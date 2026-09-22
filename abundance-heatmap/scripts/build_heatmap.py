#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
丰度表 → 单文件交互热图（D3 v7，离线可打开）

用法：
    python3 build_heatmap.py <丰度表> [--groups 分组表] [--out 输出.html] [选项]
    python3 build_heatmap.py --help

输入表约定（自动识别，无需预处理）：
    · 第 1 行是表头：第一列为特征 ID/名称，之后允许若干「元数据列」（非数字，如通路层级），
      其余列是各样本的数值。
    · 分隔符自动识别：Tab / 逗号 / 分号。
    · 若表是「样本 × 特征」方向（首列是样本名、且给了分组表能对上），自动转置；也可用 --transpose 强制。
    · 空值 / NA / NaN 一律记为 0，并在摘要里报数量。

输出：自包含 HTML（内联 D3 + 数据 + 交互逻辑），可直接双击打开、可分享。
"""
from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(os.path.dirname(HERE), 'assets')

# ---------------------------------------------------------------- KEGG 一级分类
KEGG_TOP = {}
for _h in ['Carbohydrate metabolism', 'Energy metabolism', 'Lipid metabolism',
           'Nucleotide metabolism', 'Amino acid metabolism', 'Glycan biosynthesis and metabolism',
           'Metabolism of cofactors and vitamins', 'Metabolism of other amino acids',
           'Metabolism of terpenoids and polyketides', 'Biosynthesis of other secondary metabolites',
           'Xenobiotics biodegradation and metabolism']:
    KEGG_TOP[_h] = 'Metabolism'
for _h in ['Transcription', 'Translation', 'Folding, sorting and degradation',
           'Replication and repair', 'Information processing in viruses']:
    KEGG_TOP[_h] = 'Genetic Information Processing'
for _h in ['Membrane transport', 'Signal transduction', 'Signaling molecules and interaction']:
    KEGG_TOP[_h] = 'Environmental Information Processing'
for _h in ['Transport and catabolism', 'Cell growth and death', 'Cell motility',
           'Cellular community - eukaryotes', 'Cellular community - prokaryotes']:
    KEGG_TOP[_h] = 'Cellular Processes'
for _h in ['Immune system', 'Endocrine system', 'Circulatory system', 'Digestive system',
           'Excretory system', 'Nervous system', 'Sensory system', 'Development and regeneration',
           'Environmental adaptation', 'Aging']:
    KEGG_TOP[_h] = 'Organismal Systems'
for _h in ['Cancers: overview', 'Cancers: specific types', 'Cardiovascular disease', 'Immune disease',
           'Infectious disease: bacterial', 'Infectious disease: parasitic', 'Infectious disease: viral',
           'Neurodegenerative disease', 'Substance dependence', 'Endocrine and metabolic disease',
           'Drug resistance: antineoplastic', 'Drug resistance: antimicrobial']:
    KEGG_TOP[_h] = 'Human Diseases'
KEGG_TOP_COLORS = {
    'Metabolism': '#3f7d5b',
    'Genetic Information Processing': '#3b6ea8',
    'Environmental Information Processing': '#8a5fb0',
    'Cellular Processes': '#c2803a',
    'Organismal Systems': '#ab4a5e',
    'Human Diseases': '#6f7a86',
}
TOP_PALETTE = ['#3f7d5b', '#3b6ea8', '#8a5fb0', '#c2803a', '#ab4a5e', '#6f7a86',
               '#2f8f8f', '#8f7a2f', '#5f8f2f', '#a83f6f', '#4f5f8f', '#8f5f2f']
UNCLASSIFIED = '未分类'
UNCLASSIFIED_COLOR = '#c2c9d4'
EMPTY_TOKENS = {'', 'na', 'n/a', 'nan', 'null', 'none', '-', '--', '.', 'nd'}


# ---------------------------------------------------------------- 读表
def sniff_sep(text: str) -> str:
    line = text.split('\n', 1)[0]
    counts = {'\t': line.count('\t'), ',': line.count(','), ';': line.count(';')}
    sep = max(counts, key=counts.get)
    return sep if counts[sep] > 0 else '\t'


def read_table(path: str):
    with io.open(path, encoding='utf-8-sig', errors='replace') as fh:
        text = fh.read()
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    sep = sniff_sep(text)
    rows = []
    for ln in text.split('\n'):
        if not ln.strip():
            continue
        rows.append([c.strip() for c in ln.split(sep)])
    if not rows:
        sys.exit('[heatmap] 输入表是空的: %s' % path)
    width = max(len(r) for r in rows)
    rows = [r + [''] * (width - len(r)) for r in rows]      # 补齐短行
    return rows, sep


def to_number(s: str):
    """宽松解析数值：容忍千分位、百分号、全角空格。返回 float 或 None"""
    t = s.strip().replace(',', '').replace('\u3000', '').replace(' ', '')
    if t.endswith('%'):
        t = t[:-1]
    if t.lower() in EMPTY_TOKENS:
        return 0.0, True
    try:
        return float(t), False
    except ValueError:
        return None, False


def numeric_ratio(rows, j):
    vals = 0
    tot = 0
    for r in rows[1:]:
        v, _ = to_number(r[j])
        tot += 1
        if v is not None:
            vals += 1
    return (vals / tot) if tot else 0.0


def split_meta(rows):
    """返回 (meta_idx, sample_idx)：前面的非数字列视为元数据列，其余为样本列"""
    ncol = len(rows[0])
    meta_idx = [0]
    j = 1
    while j < ncol and numeric_ratio(rows, j) < 0.5:
        meta_idx.append(j)
        j += 1
    sample_idx = list(range(j, ncol))
    return meta_idx, sample_idx


def transpose(rows):
    ncol = max(len(r) for r in rows)
    rows = [r + [''] * (ncol - len(r)) for r in rows]
    return [[rows[i][j] for i in range(len(rows))] for j in range(ncol)]


# ---------------------------------------------------------------- 主流程
def main():
    ap = argparse.ArgumentParser(
        description='丰度表 → 单文件交互热图（D3，离线可用）',
        formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('table', help='丰度表（TSV/CSV，第一列特征名，之后可有若干非数字注释列）')
    ap.add_argument('--groups', help='样本分组表（两列：sample<TAB>group）')
    ap.add_argument('--out', help='输出 HTML 路径（默认 ./heatmap/<表名>.heatmap.html）')
    ap.add_argument('--title', help='页面标题（默认按表名自动生成）')
    ap.add_argument('--entity', help='特征实体名，用于界面文案，如「通路」「OTU」「基因」「代谢物」')
    ap.add_argument('--transpose', action='store_true', help='强制转置（表是「样本 × 特征」方向时）')
    ap.add_argument('--hier-map', help='两级分类映射表（两列：level2<TAB>level1）；不传则：'
                                       'KEGG 层级用内置映射，其它直接用 level2 本身作为一级分类')
    ap.add_argument('--no-normalize', action='store_true',
                    help='不做列和归一化（表已做过 log/z-score 等变换时使用；此时阈值按原始数值解释）')
    ap.add_argument('--ab-thresh', type=float, help='相对丰度阈值默认值（%%；--no-normalize 时为原始值，默认 0）')
    ap.add_argument('--prev', type=int, help='特征数量阈值默认值（至少在 N 个样本中检出；默认 10）')
    ap.add_argument('--no-open', action='store_true', help='不自动打开浏览器（仅构建）')
    args = ap.parse_args()

    if not os.path.exists(args.table):
        sys.exit('[heatmap] 找不到输入表: %s' % args.table)
    rows, sep = read_table(args.table)
    if len(rows) < 2:
        sys.exit('[heatmap] 表里只有表头、没有数据行: %s' % args.table)

    # 分组表
    groups = {}
    group_order = []
    if args.groups:
        grows, _ = read_table(args.groups)
        hdr = [c.lower() for c in grows[0]]
        gi = 1 if len(hdr) > 1 else 0
        for r in grows[1:]:
            s, g = r[0].strip(), r[gi].strip()
            if not s:
                continue
            groups[s] = g
            if g and g not in group_order:
                group_order.append(g)

    # 方向判定：给了分组表且首列（数据行）就是样本名 → 表是「样本 × 特征」
    def first_col_hits(rs):
        names = [r[0].strip() for r in rs[1:] if r[0].strip()]
        if not names:
            return 0.0
        return sum(1 for n in names if n in groups) / len(names)

    n_rows, n_cols = len(rows) - 1, len(rows[0]) - 1
    transposed = False
    if args.transpose:
        rows = transpose(rows)
        transposed = True
    elif groups and first_col_hits(rows) >= 0.8:
        rows = transpose(rows)
        transposed = True

    meta_idx, sample_idx = split_meta(rows)
    if not sample_idx:
        sys.exit('[heatmap] 没找到任何数值列，请检查分隔符/表头，或改用 --transpose')
    if len(sample_idx) < 2:
        print('[heatmap] 警告：只识别到 %d 个样本列，热图会很窄' % len(sample_idx), file=sys.stderr)

    header = rows[0]
    sample_names = [header[j].strip() or ('S%d' % (k + 1)) for k, j in enumerate(sample_idx)]

    # 分组：表中样本在分组表里找不到时归为「未分组」
    missing = [s for s in sample_names if s not in groups]
    if groups and missing:
        print('[heatmap] 警告：%d 个样本不在分组表里，归为「未分组」：%s'
              % (len(missing), ', '.join(missing[:6]) + (' …' if len(missing) > 6 else '')), file=sys.stderr)
    smp_group = {s: groups.get(s, '未分组') for s in sample_names}
    if not group_order:
        group_order = sorted(set(smp_group.values()), key=lambda g: (g == '未分组', g))
    for g in group_order:
        if g not in set(smp_group.values()):
            group_order.remove(g) if False else None
    extra_groups = [g for g in sorted(set(smp_group.values())) if g not in group_order]
    group_order = group_order + extra_groups
    samples = [{'n': s, 'g': smp_group[s]} for s in sample_names]

    # 特征
    n_meta = len(meta_idx)
    feat_name_col = meta_idx[0]
    feat_hier_col = meta_idx[1] if n_meta > 1 else None
    meta_cols = [header[j].strip() or ('Meta%d' % (k + 1)) for k, j in enumerate(meta_idx)]

    def fmt(x):
        return float('%.6g' % x)

    features = []
    empties = 0
    seen = set()
    for r in rows[1:]:
        fname = r[feat_name_col].strip()
        if not fname:
            continue
        vals = []
        for j in sample_idx:
            v, was_empty = to_number(r[j])
            if v is None:
                sys.exit('[heatmap] 无法解析的数值: 行「%s」列「%s」= %r\n'
                         '（若表是「样本 × 特征」方向请加 --transpose；若分隔符特殊请先转成 TSV）'
                         % (fname, header[j], r[j]))
            if was_empty:
                empties += 1
            vals.append(fmt(v))
        fid, fname2 = (fname.split(':', 1) + [fname])[:2] if ':' in fname else (fname, fname)
        if fid in seen:
            fid = '%s#%d' % (fid, len(features))
        seen.add(fid)
        features.append({
            'id': fid.strip(),
            'name': fname2.strip(),
            'hier': (r[feat_hier_col].strip() if feat_hier_col is not None else ''),
            'top': '',
            'v': vals,
        })
    n_dropped = (len(rows) - 1) - len(features)
    if not features:
        sys.exit('[heatmap] 没有解析出任何特征行')

    # 一级分类
    hier_map = dict(KEGG_TOP) if not args.hier_map else {}
    if args.hier_map:
        with io.open(args.hier_map, encoding='utf-8-sig') as fh:
            for ln in fh:
                parts = re.split(r'[\t,;]', ln.rstrip('\n'))
                if len(parts) >= 2 and parts[1].strip():
                    hier_map[parts[0].strip()] = parts[1].strip()
    hier_values = [f['hier'] for f in features if f['hier']]
    use_kegg = bool(hier_values) and not args.hier_map and \
        sum(1 for h in hier_values if h in KEGG_TOP) / len(hier_values) >= 0.6
    use_tax = bool(hier_values) and not use_kegg and \
        sum(1 for h in hier_values if re.search(r'[;|]', h)) / len(hier_values) >= 0.6

    def tax_phylum(s):
        """分类学串（d__Bacteria;p__Firmicutes;g__Bacillus）取门级做一级分类"""
        parts = [p.strip() for p in re.split(r'[;|]', s) if p.strip()]
        for p in parts:
            if p[:3].lower() == 'p__':
                return re.sub(r'^[a-z]__', '', p)
        return re.sub(r'^[a-z]__', '', parts[-1]) if parts else s

    for f in features:
        if not f['hier']:
            f['top'] = UNCLASSIFIED
        elif use_kegg:
            f['top'] = KEGG_TOP.get(f['hier'], f['hier'])
        elif use_tax:
            f['top'] = tax_phylum(f['hier'])          # hier 保留完整分类串
        else:
            f['top'] = hier_map.get(f['hier'], f['hier'])   # 无映射时用 level2 本身当一级分类

    distinct_tops = []
    for f in features:
        if f['top'] not in distinct_tops:
            distinct_tops.append(f['top'])
    top_colors = {}
    if use_kegg:
        for t in distinct_tops:
            if t in KEGG_TOP_COLORS:
                top_colors[t] = KEGG_TOP_COLORS[t]
    ci = 0
    for t in distinct_tops:
        if t == UNCLASSIFIED:
            top_colors[t] = UNCLASSIFIED_COLOR
        elif t not in top_colors:
            top_colors[t] = TOP_PALETTE[ci % len(TOP_PALETTE)]
            ci += 1
    has_annotation = any(t != UNCLASSIFIED for t in distinct_tops)

    # 元信息与默认阈值
    base = os.path.basename(args.table)
    stem = os.path.splitext(base)[0]

    def guess_entity():
        """从表头列名 + 前几行特征名猜实体类型，用于界面文案"""
        hint = ' '.join([header[feat_name_col]] + [f['id'] for f in features[:5]] +
                        [f['name'] for f in features[:3]])
        if re.search(r'kegg|pathway|^ko\d|\bko\d{5}\b', hint, re.I):
            return '通路'
        if re.search(r'otu|asv|feature_?id|amplicon', hint, re.I):
            return 'OTU'
        if re.search(r'\bspecies\b|genus|taxon|taxonomy', hint, re.I):
            return '物种'
        if re.search(r'gene|unigene|orf|transcript', hint, re.I):
            return '基因'
        if re.search(r'metabol|compound|chem', hint, re.I):
            return '代谢物'
        if re.search(r'go_?id|go_term|ontology', hint, re.I):
            return 'GO 条目'
        return '特征'

    entity = args.entity or guess_entity()
    title = args.title or ('%s丰度热图%s' % (entity, '（%s）' % stem if stem else ''))
    defaults = {
        'abThresh': args.ab_thresh if args.ab_thresh is not None else (0 if args.no_normalize else 1.0),
        'prevOn': True,
        'prevN': args.prev if args.prev is not None else 10,
        'topN': 0,
    }
    data = {
        'samples': samples,
        'groups': group_order,
        'topColors': top_colors,
        'features': features,
        'meta': {
            'title': title,
            'entity': entity,
            'entityShort': entity,
            'metaCols': meta_cols,
            'featureCol': meta_cols[0],
            'hierCol': meta_cols[1] if n_meta > 1 else '',
            'topCol': 'Top_category',
            'hasAnnotation': has_annotation,
            'noNormalize': bool(args.no_normalize),
            'source': base,
            'transposed': transposed,
        },
        'defaults': defaults,
    }
    data_json = json.dumps(data, ensure_ascii=False, separators=(',', ':'))

    # 组装
    out = args.out or os.path.join('heatmap', os.path.splitext(base)[0] + '.heatmap.html')
    outdir = os.path.dirname(os.path.abspath(out))
    if not os.path.isdir(outdir):
        os.makedirs(outdir)
    with io.open(os.path.join(ASSETS, 'template.html'), encoding='utf-8') as fh:
        html = fh.read()
    with io.open(os.path.join(ASSETS, 'style.css'), encoding='utf-8') as fh:
        css = fh.read()
    with io.open(os.path.join(ASSETS, 'app.js'), encoding='utf-8') as fh:
        app = fh.read()
    d3file = os.path.join(ASSETS, 'd3.v7.min.js')
    if not os.path.exists(d3file):
        sys.exit('[heatmap] 缺少依赖 %s（D3 v7 压缩版）' % d3file)
    with io.open(d3file, encoding='utf-8') as fh:
        d3 = fh.read()
    html = html.replace('/*__STYLE__*/', css)
    d3 = re.sub(r'//# sourceMappingURL=\S*', '', d3)
    html = html.replace('/*__D3__*/', d3)
    html = html.replace('/*__DATA__*/', 'window.HEATMAP_DATA = ' + data_json + ';')
    html = html.replace('/*__APP__*/', app)
    for ph in ('/*__STYLE__*/', '/*__D3__*/', '/*__DATA__*/', '/*__APP__*/'):
        if ph in html:
            sys.exit('[heatmap] 占位符未替换: %s' % ph)
    with io.open(out, 'w', encoding='utf-8') as fh:
        fh.write(html)

    # 摘要
    colsum = [0.0] * len(sample_names)
    for f in features:
        for j in range(len(sample_names)):
            colsum[j] += float(f['v'][j])
    print('[heatmap] 输入      : %s (分隔符 %s)' % (args.table, {chr(9): 'TAB', ',': '逗号', ';': '分号'}[sep]))
    print('[heatmap] 方向      : %s' % ('样本 × 特征（已转置）' if transposed else '特征 × 样本'))
    print('[heatmap] 特征 × 样本: %d × %d（元数据列 %d：%s）'
          % (len(features), len(sample_names), n_meta, ', '.join(meta_cols)))
    if n_dropped:
        print('[heatmap] 跳过空行  : %d' % n_dropped)
    if empties:
        print('[heatmap] 空值计 0  : %d 个单元格' % empties)
    print('[heatmap] 分组      : %d 组（%s）'
          % (len(group_order), ', '.join('%s×%d' % (g, sum(1 for s in samples if s['g'] == g)) for g in group_order)))
    print('[heatmap] 一级分类  : %d 类%s' % (len(distinct_tops), '（' + '、'.join(distinct_tops[:6]) + '…）' if len(distinct_tops) > 6 else '（' + '、'.join(distinct_tops) + '）'))
    if args.no_normalize:
        print('[heatmap] 数值口径  : 原始值（未做列和归一化，阈值按原值解释）')
    else:
        print('[heatmap] 数值口径  : 相对丰度%%（每列除以列和 ×100；列和 %.0f–%.0f）' % (min(colsum), max(colsum)))
    print('[heatmap] 默认阈值  : %s %s%s ；至少在 %d 个样本中检出'
          % ('丰度阈值' if args.no_normalize else '相对丰度阈值',
             defaults['abThresh'], '' if args.no_normalize else '%', defaults['prevN']))
    print('[heatmap] 输出      : %s (%.1f KB)' % (os.path.abspath(out), os.path.getsize(out) / 1024.0))
    if not transposed and groups:
        hit = first_col_hits(rows)
        if 0.3 <= hit < 0.8:
            print('[heatmap] 提示      : 首列有 %.0f%% 的值与分组表样本名相同；'
                  '若这张表是「样本 × 特征」方向，请加 --transpose' % (hit * 100))
    if not transposed and len(rows) - 1 < len(sample_idx) / 2:
        print('[heatmap] 提示      : 特征行数远少于样本列数，若表是「样本 × 特征」方向请加 --transpose')

    if not args.no_open:
        try:
            import subprocess
            if sys.platform == 'darwin':
                subprocess.Popen(['open', os.path.abspath(out)],
                                 stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                print('[heatmap] 已用默认浏览器打开')
            else:
                print('[heatmap] 请手动打开上面的 HTML')
        except Exception as exc:                                  # pragma: no cover
            print('[heatmap] 自动打开失败（%s），请手动打开' % exc, file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
