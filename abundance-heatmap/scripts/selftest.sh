#!/usr/bin/env bash
# abundance-heatmap :: 自检脚本（改过 build_heatmap.py / assets 后必须跑一遍）
#
#   bash selftest.sh
#
# 覆盖：分隔符识别、方向识别与强制转置、元数据列数、空值/千分位/百分号、
#       单样本列、分组表缺样本、自定义层级映射、--no-normalize、默认阈值注入、
#       输出自包含性，以及各类错误输入的退出码。
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD="$HERE/build_heatmap.py"
PY="${HEATMAP_PY:-python3}"
TMP="$(mktemp -d /tmp/heatmap-selftest.XXXXXX)"
PASS=0; FAIL=0

ok()   { PASS=$((PASS+1)); printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { FAIL=$((FAIL+1)); printf '  \033[31m✗\033[0m %s\n' "$1"; }
head1() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# run <期望退出码> <名字> <grep 关键词或 -> <参数...>
run() {
  local want="$1" name="$2" pat="$3"; shift 3
  local out rc tail2
  out="$("$PY" "$BUILD" "$@" --no-open 2>&1)"; rc=$?
  if [ "$want" = "0" ] && [ "$rc" -ne 0 ]; then
    tail2="$(printf '%s' "$out" | tail -2)"
    bad "${name} [期望成功, 实际退出 ${rc}] ${tail2}"; return 1
  fi
  if [ "$want" != "0" ] && [ "$rc" -eq 0 ]; then bad "${name} [期望失败, 实际成功]"; return 1; fi
  if [ "$pat" != "-" ] && ! printf '%s' "$out" | grep -q "$pat"; then
    bad "${name} [输出未包含 ${pat}]"; printf '%s\n' "$out" | sed 's/^/      /'; return 1
  fi
  ok "${name}"
}

printf '\033[1mabundance-heatmap selftest\033[0m  python: %s\n' "$("$PY" -V 2>&1)"

# ---------------------------------------------------------------- 夹具
cat > "$TMP/basic.tsv" <<'EOF'
KEGG_pathway	Pathway_Hierarchy2	S1	S2	S3	S4
ko00010:Glycolysis / Gluconeogenesis	Carbohydrate metabolism	50	60	55	45
ko00020:Citrate cycle (TCA cycle)	Carbohydrate metabolism	40	20	25	35
ko00550:Peptidoglycan biosynthesis	Glycan biosynthesis and metabolism	5	15	10	12
ko00970:Aminoacyl-tRNA biosynthesis	Translation	5	5	10	8
EOF
cat > "$TMP/groups.tsv" <<'EOF'
sample	sample_group
S1	A
S2	A
S3	B
S4	B
EOF
printf 'sample,group\nS1,A\nS2,A\nS3,B\nS4,B\n' > "$TMP/groups.csv"
printf 'id,hier,S1,S2,S3,S4\nG1,X,1,2,3,4\nG2,Y,5,6,7,8\n' > "$TMP/comma.csv"
# 分号分隔 + 无注释列 + 单样本 + 千分位/百分号/空值
printf 'id;S1;S2;S3\nG1;1,234;NA;12.5%%\nG2;2,000;30;40%%\nG3;;15;8%%\n'  > "$TMP/semi.csv"
printf 'id\tS1\nG1\t10\nG2\t20\n'                                            > "$TMP/one_sample.tsv"
printf 'id\tS1\tS2\tS3\n'                                                    > "$TMP/header_only.tsv"
: > "$TMP/empty.tsv"
printf 'id\thier\tS1\tS2\nG1\tX\t1\t2\nG2\tY\t3\t4\n'                        > "$TMP/hier.tsv"
printf 'hier1\thier2\nX\t甲\nY\t乙\n'                                          > "$TMP/hiermap.tsv"
printf 'id\thier\tS1\tS2\nG1\tX\t1\t2\n'                                     > "$TMP/short_row.tsv"
# 样本 × 特征 方向
printf 'sample\tg1\tg2\tg3\nS1\t5\t1\t9\nS2\t6\t2\t8\nS3\t4\t3\t7\nS4\t7\t4\t6\n' > "$TMP/wide.tsv"
printf 'id\thier\tS1\tS2\tSX\nG1\tX\t1\t2\t3\n'                              > "$TMP/missing_group.tsv"
# CRLF + BOM
printf '\xef\xbb\xbfid\thier\tS1\tS2\r\nG1\tX\t1\t2\r\nG2\tX\t3\t4\r\n'       > "$TMP/crlf_bom.tsv"

head1 '① 正常路径'
run 0 'TSV + 分组表'                 '相对丰度'  "$TMP/basic.tsv" --groups "$TMP/groups.tsv" --out "$TMP/o1.html"
run 0 'CSV（逗号）+ 分组表'           '分隔符 逗号' "$TMP/comma.csv" --groups "$TMP/groups.csv" --out "$TMP/o2.html"
run 0 '分号分隔 + 千分位 + % + 空值'   '空值计 0'   "$TMP/semi.csv"  --out "$TMP/o3.html"
run 0 '样本 × 特征 自动转置'          '已转置'     "$TMP/wide.tsv"  --groups "$TMP/groups.tsv" --out "$TMP/o4.html"
run 0 '--transpose 强制转置'         '已转置'     "$TMP/wide.tsv"  --transpose --out "$TMP/o5.html"
run 0 'CRLF + BOM'                  '特征 × 样本' "$TMP/crlf_bom.tsv" --out "$TMP/o6.html"
run 0 '短行补齐'                     '特征 × 样本' "$TMP/short_row.tsv" --out "$TMP/o7.html"

head1 '② 参数与边界'
run 0 '--no-normalize 原值口径'      '原始值'     "$TMP/basic.tsv" --no-normalize --out "$TMP/o8.html"
run 0 '--hier-map 自定义层级'        '一级分类'   "$TMP/hier.tsv"  --hier-map "$TMP/hiermap.tsv" --out "$TMP/o9.html"
run 0 '分组表缺样本 → 未分组'         '未分组'     "$TMP/missing_group.tsv" --groups "$TMP/groups.tsv" --out "$TMP/o10.html"
run 0 '单样本列（警告但可出图）'       '特征 × 样本' "$TMP/one_sample.tsv" --out "$TMP/o11.html"
run 0 '--title / --entity 生效'       '一级分类'   "$TMP/basic.tsv" --title '自检标题' --entity '测试实体' --out "$TMP/o12.html"

head1 '③ 错误输入（应非零退出）'
run 1 '空文件'                       '输入表是空的' "$TMP/empty.tsv" --out "$TMP/e1.html"
run 1 '只有表头'                     '没有数据行' "$TMP/header_only.tsv" --out "$TMP/e2.html"
run 1 '对正常表强行转置 → 报错提示'    '无法解析的数值' "$TMP/basic.tsv" --transpose --out "$TMP/e4.html"
run 1 '文件不存在'                    '找不到输入表' "$TMP/nope.tsv" --out "$TMP/e3.html"

head1 '④ 产物正确性'
if [ -s "$TMP/o1.html" ]; then ok 'HTML 已生成且非空'; else bad 'HTML 未生成'; fi
if grep -qE '<script[^>]+src=|<link[^>]+href=|@import url\(' "$TMP/o1.html"; then
  bad 'HTML 含外部依赖（应为自包含）'
else ok 'HTML 自包含（无外链 script/link/@import）'; fi
if grep -q '__DATA__\|__APP__\|__STYLE__\|__D3__' "$TMP/o1.html"; then bad '占位符未替换'; else ok '占位符全部替换'; fi
if grep -q 'interpolateRdBu' "$TMP/o1.html" && ! grep -q 'sourceMappingURL' "$TMP/o1.html"; then
  ok 'D3 已内联（且无 sourceMappingURL 残留）'
else bad 'D3 未内联或存在残留注释'; fi

"$PY" - "$TMP/o1.html" "$TMP/o12.html" "$TMP/o8.html" "$TMP/o9.html" "$TMP/o4.html" <<'PY'
import io, json, sys
KEY = 'window.HEATMAP_DATA = '
def load(p):
    for ln in io.open(p, encoding='utf-8'):
        i = ln.find(KEY)
        if i >= 0:
            s = ln[i+len(KEY):]
            return json.loads(s[:s.rfind('};')+1])
    raise SystemExit('no data in ' + p)
fail = 0
def chk(name, cond, extra=''):
    global fail
    print(('  \033[32m✓\033[0m ' if cond else '  \033[31m✗\033[0m ') + name + ('' if cond else ' -> ' + extra))
    if not cond: fail += 1

d = load(sys.argv[1])
chk('默认阈值注入 abThresh=1.0 / prevN=10',
    d['defaults']['abThresh'] == 1.0 and d['defaults']['prevN'] == 10, json.dumps(d['defaults']))
chk('元数据列识别为 2 列', d['meta']['metaCols'] == ['KEGG_pathway', 'Pathway_Hierarchy2'], str(d['meta']['metaCols']))
chk('实体名自动识别为 通路', d['meta']['entity'] == '通路', d['meta']['entity'])
chk('KEGG 一级分类只保留实际出现的 2 类', list(d['topColors']) == ['Metabolism', 'Genetic Information Processing'], str(list(d['topColors'])))
chk('特征数与表一致（4 条）', len(d['features']) == 4, str(len(d['features'])))
# 默认阈值保留数：列和 100，平均相对丰度 = 均值
kept = [f['id'] for f in d['features']
        if sum(f['v']) / len(f['v']) >= 1.0 and sum(1 for v in f['v'] if v > 0) >= 10]
chk('默认阈值（平均≥1%%、检出≥10）保留 0 条（样本数不足 10）', kept == [], str(kept))

d12 = load(sys.argv[2])
chk('--title 生效', d12['meta']['title'] == '自检标题', d12['meta']['title'])
chk('--entity 生效', d12['meta']['entity'] == '测试实体', d12['meta']['entity'])

d8 = load(sys.argv[3])
chk('--no-normalize 标记写入', d8['meta']['noNormalize'] is True)
chk('--no-normalize 默认阈值 0', d8['defaults']['abThresh'] == 0, str(d8['defaults']))

d9 = load(sys.argv[4])
chk('--hier-map 映射生效（甲/乙 2 类）', list(d9['topColors']) == ['甲', '乙'], str(list(d9['topColors'])))

d4 = load(sys.argv[5])
chk('自动转置后 3 个特征 × 4 个样本',
    len(d4['features']) == 3 and len(d4['samples']) == 4,
    '%d×%d' % (len(d4['features']), len(d4['samples'])))
chk('转置后分组正确（A/B 各 2）',
    sorted(set(s['g'] for s in d4['samples'])) == ['A', 'B'], str([s['g'] for s in d4['samples']]))
sys.exit(1 if fail else 0)
PY
if [ $? -eq 0 ]; then PASS=$((PASS+1)); else FAIL=$((FAIL+1)); fi

printf '\n\033[1m结果: %d 通过, %d 失败\033[0m  临时目录 %s\n' "$PASS" "$FAIL" "$TMP"
[ "$FAIL" -eq 0 ] || exit 1
