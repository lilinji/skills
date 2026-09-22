#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成演示/回归用的模拟丰度表（三种形态，覆盖自动识别分支）

    python3 demo_data.py [--outdir /tmp/heatmap-demo]

产出：
    ko_table.tsv        特征 × 样本，2 个元数据列（KEGG 风格，含层级）+ 分组表 groups.tsv
    otu_table.csv       特征 × 样本，1 个元数据列（分类学字符串），逗号分隔 + 分组表 groups.csv
    genes_sample_wise.tsv   样本 × 特征 方向（检验自动转置）+ 分组表 groups2.tsv
"""
import argparse
import io
import os
import random

GROUPS = ['CK', 'LS1', 'LS3', 'OS1', 'OS3']          # 5 组 × 3 重复 = 15 个样本
SAMPLES = ['%s_%d' % (g, i + 1) for g in GROUPS for i in range(3)]
H1 = ['KEGG_pathway', 'Pathway_Hierarchy2']
H2 = ['OTU_ID', 'Taxonomy']
KEGG_PATHS = [
    ('ko00010', 'Glycolysis / Gluconeogenesis', 'Carbohydrate metabolism', 1.2),
    ('ko00020', 'Citrate cycle (TCA cycle)', 'Carbohydrate metabolism', 1.1),
    ('ko00061', 'Fatty acid biosynthesis', 'Lipid metabolism', 1.8),
    ('ko00250', 'Alanine, aspartate and glutamate metabolism', 'Amino acid metabolism', 1.3),
    ('ko00290', 'Valine, leucine and isoleucine biosynthesis', 'Amino acid metabolism', 1.7),
    ('ko00550', 'Peptidoglycan biosynthesis', 'Glycan biosynthesis and metabolism', 1.4),
    ('ko00970', 'Aminoacyl-tRNA biosynthesis', 'Translation', 1.2),
    ('ko02030', 'Bacterial chemotaxis', 'Cell motility', 1.4),
    ('ko03010', 'Ribosome', 'Translation', 1.0),
    ('ko00190', 'Oxidative phosphorylation', 'Energy metabolism', 0.9),
    ('ko00072', 'Synthesis and degradation of ketone bodies', '', 1.6),
    ('ko99991', 'Low abundance pathway A', 'Carbohydrate metabolism', 0.05),
    ('ko99992', 'Low abundance pathway B', 'Lipid metabolism', 0.02),
    ('ko99993', 'Absent in most samples', 'Energy metabolism', 0.01),
]
TAXA = ['d__Bacteria;p__Proteobacteria;g__Escherichia', 'd__Bacteria;p__Firmicutes;g__Bacillus',
        'd__Bacteria;p__Bacteroidetes;g__Bacteroides', 'd__Bacteria;p__Actinobacteria;g__Streptomyces',
        'd__Bacteria;p__Firmicutes;g__Clostridium', 'd__Bacteria;p__Proteobacteria;g__Pseudomonas',
        'd__Bacteria;p__Bacteroidetes;g__Flavobacterium', 'd__Bacteria;p__Firmicutes;g__Lactobacillus']


def rnd_vals(mean_pct, base, n, trend=0.0, noise=0.08):
    out = []
    for i in range(n):
        g = i // 3
        v = mean_pct * (1 + trend * g) * (1 + random.uniform(-noise, noise))
        out.append(max(0.0, v * base))
    return out


def write(path, rows, sep='\t'):
    with io.open(path, 'w', encoding='utf-8') as fh:
        for r in rows:
            fh.write(sep.join(str(c) for c in r) + '\n')


def write_groups(path, samples, groups, sep='\t'):
    write(path, [['sample', 'sample_group']] + [[s, g] for s, g in zip(samples, groups)], sep)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--outdir', default='/tmp/heatmap-demo')
    ap.add_argument('--seed', type=int, default=42)
    args = ap.parse_args()
    random.seed(args.seed)
    os.makedirs(args.outdir, exist_ok=True)

    # 1) KEGG 风格：特征 × 样本，2 元数据列
    rows = [H1 + SAMPLES]
    for fid, fname, hier, pct in KEGG_PATHS:
        vals = rnd_vals(pct, 1e6 / 100.0, len(SAMPLES), trend=-0.02, noise=0.06)
        rows.append(['%s:%s' % (fid, fname), hier] + ['%.4f' % v for v in vals])
    write(os.path.join(args.outdir, 'ko_table.tsv'), rows)
    write_groups(os.path.join(args.outdir, 'groups.tsv'), SAMPLES, [s.split('_')[0] for s in SAMPLES])

    # 2) OTU 风格：逗号分隔，1 个元数据列，含空值
    rows = [H2 + SAMPLES]
    for i, tax in enumerate(TAXA):
        vals = rnd_vals(3.0 + i, 5000, len(SAMPLES), trend=0.03, noise=0.25)
        cells = ['%.0f' % v if random.random() > 0.06 else 'NA' for v in vals]
        rows.append(['OTU_%03d' % (i + 1), tax] + cells)
    write(os.path.join(args.outdir, 'otu_table.csv'), rows, sep=',')
    write_groups(os.path.join(args.outdir, 'groups.csv'), SAMPLES, [s.split('_')[0] for s in SAMPLES], sep=',')

    # 3) 样本 × 特征 方向（需要自动转置）
    rows = [['sample'] + ['gene_%02d' % (i + 1) for i in range(len(KEGG_PATHS))]]
    for s in SAMPLES:
        g = s.split('_')[0]
        rows.append([s] + ['%.0f' % (rnd_vals(KEGG_PATHS[i][3], 1000, 1, noise=0.1)[0] * (1.15 if g.startswith(('LS', 'OS')) else 1.0))
                           for i in range(len(KEGG_PATHS))])
    write(os.path.join(args.outdir, 'genes_sample_wise.tsv'), rows)
    write_groups(os.path.join(args.outdir, 'groups2.tsv'), SAMPLES, [s.split('_')[0] for s in SAMPLES])

    print('已生成演示数据到 %s :' % args.outdir)
    for f in sorted(os.listdir(args.outdir)):
        print('   ', f)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
