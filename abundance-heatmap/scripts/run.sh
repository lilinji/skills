#!/usr/bin/env bash
# abundance-heatmap :: 一条命令完成「丰度表 → 交互热图 HTML + 打开浏览器」
#
#   bash run.sh <丰度表> [--groups 分组表] [--out FILE] [选项]
#
# 常用选项（完整列表见 python3 build_heatmap.py --help）：
#   --groups FILE     样本分组表（两列：sample<TAB>group）
#   --out FILE        输出 HTML（默认 ./heatmap/<表名>.heatmap.html）
#   --title TEXT      页面标题
#   --entity NAME     特征实体名，用于界面文案（如 通路 / OTU / 基因 / 代谢物）
#   --transpose       强制转置（表是「样本 × 特征」方向时）
#   --no-normalize    不做列和归一化（表已做 log/z-score 等变换时）
#   --ab-thresh X     相对丰度阈值默认值（%），--prev N 检出样本数阈值默认值
#   --no-open         只构建，不打开浏览器
#
# 例：
#   bash run.sh 功能.txt --groups 样本分组.txt
#   bash run.sh otu_table.csv --entity OTU --no-open
#   bash run.sh genes_sample_wise.tsv --groups groups2.tsv --transpose
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---- 选一个可用的 python3（>=3.6 即可，脚本兼容 3.7，无第三方依赖）----
PY=""
for cand in "${HEATMAP_PY:-}" python3 /opt/homebrew/bin/python3 /usr/local/bin/python3 /usr/bin/python3 python; do
  [ -n "$cand" ] || continue
  if command -v "$cand" >/dev/null 2>&1; then
    if "$cand" -c 'import sys; sys.exit(0 if sys.version_info >= (3,6) else 1)' 2>/dev/null; then
      PY="$cand"; break
    fi
  fi
done
if [ -z "$PY" ]; then
  echo "[heatmap] 找不到可用的 python3（需要 >= 3.6）。macOS: brew install python3" >&2
  exit 3
fi

if [ $# -eq 0 ]; then
  awk 'NR>1 && /^#/ {sub(/^# ?/,""); print; next} NR>1 {exit}' "${BASH_SOURCE[0]}" >&2
  exit 2
fi

exec "$PY" "$HERE/build_heatmap.py" "$@"
