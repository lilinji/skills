---
name: abundance-heatmap
description: 把丰度表（KEGG 通路 / GO / OTU / 物种 / 基因 / 代谢物…，TSV/CSV）做成单文件、离线可双击打开的**交互热图** HTML——前端 D3 渲染，支持行层次聚类 + 树状图、行 Z-score 归一化、相对丰度百分比与特征数量双阈值筛选、分组均值列、滚轮缩放平移、悬停读数、点击看单条丰度曲线、导出 SVG/PNG/TSV。当用户说“画热图”“做个热图”“丰度热图”“聚类热图”“z-score 热图”“KEGG 通路热图”“OTU/物种丰度热图”“把这张丰度表可视化”“要行聚类 + 行归一化”“按 1% 丰度阈值筛完再画”时使用。也适合需要把探索结果分享给别人、对方双击就能看（无需装环境/联网）的场景。
license: MIT
metadata:
  version: "1.0"
  requires: python3 (>=3.6, 无第三方依赖；脚本兼容 3.7) + 任意现代浏览器（D3 已内联进产物）
---

# abundance-heatmap —— 丰度表 → 可交互热图（单文件离线 HTML）

给一张丰度表（可选给分组表），产出**一个自包含 HTML**：D3 前端渲染、行聚类树 + 行 Z-score 归一化、双阈值筛选、缩放读数曲线，双击就能看，可以直接发给别人。

## 快速开始

```bash
bash ~/.agents/skills/abundance-heatmap/scripts/run.sh <丰度表> [--groups 分组表] [选项]
```

一条命令完成：解析 → 换算相对丰度 → 注入模板 → 生成 HTML → `open` 打开。
默认输出到 `./heatmap/<表名>.heatmap.html`（`--out` 可改）。构建过程会在 stdout 打印摘要（识别到的方向、元数据列、分组、一级分类、列和、默认阈值）。

常见用法：

```bash
# KEGG 通路表 + 分组表（最典型）
bash scripts/run.sh 功能.txt --groups 样本分组.txt

# OTU 表（逗号 CSV，含分类学列），指定实体名让界面文案显示「OTU」
bash scripts/run.sh otu_table.csv --entity OTU

# 表是「样本 × 特征」方向（首列是样本名）
bash scripts/run.sh genes_sample_wise.tsv --groups groups.tsv --transpose

# 已经做过 log / z-score 的表：不要列和归一化
bash scripts/run.sh norm_matrix.tsv --no-normalize

# 只要文件，不打开浏览器
bash scripts/run.sh table.tsv --groups g.tsv --out ~/Desktop/heat.html --no-open
```

先看效果（造模拟数据：KEGG 风格 / OTU 风格 / 样本×特征 三种形态）：

```bash
python3 ~/.agents/skills/abundance-heatmap/scripts/demo_data.py --outdir /tmp/heatmap-demo
bash ~/.agents/skills/abundance-heatmap/scripts/run.sh /tmp/heatmap-demo/ko_table.tsv \
     --groups /tmp/heatmap-demo/groups.tsv
```

## 输入数据要求

| 项 | 要求 | 自动处理 |
| --- | --- | --- |
| 形状 | 第 1 行表头；第一列特征 ID/名称；之后可跟若干**非数字注释列**；其余列为各样本数值 | 元数据列数自动识别（非数字比例 < 50% 的前导列） |
| 方向 | 特征 × 样本（默认）；也支持样本 × 特征 | 给了分组表且首列能对上样本名 → 自动转置；也可 `--transpose` 强制 |
| 分隔符 | Tab / 逗号 / 分号 | 按表头自动嗅探 |
| 数值 | 原始计数、相对丰度（和为 1 或 100）、TPM/CPM 均可 | 统一按**列和**归一化（对已是相对丰度的表幂等） |
| 缺失 | 空 / NA / N/A / NaN / null / - 等 | 记为 0，并在摘要里报单元格数量 |
| 脏值 | 千分位 `1,234`、百分号 `12.5%`、CRLF、BOM、短行 | 自动清洗/补齐 |
| 分组表 | 两列 `sample<TAB>group`（逗号亦可）；可省略 | 表中样本不在分组表里 → 归为「未分组」并警告 |
| 分类注释 | 第二列（可选）：KEGG 二级分类、分类学串、任意标签 | KEGG 二级分类自动映射到 6 个一级类；分类学串自动取**门级**做一级分类，全串保留在提示里 |

## 界面能做什么

- **悬停**单元格：特征名、分类、样本、分组、相对丰度 %、原始值、归一化值、色值；同时十字高亮所在行/列，行标签变橙。
- **点击**任意单元格或行标签：下方展开该特征在全部样本 + 全部分组均值中的丰度曲线（灰线＝样本、深色线＝组均值；丰度差异小时 Y 轴自动放大并标注），右侧给出平均/最高/最低/检出样本数与各组均值 Top5。
- **滚轮缩放 / 拖拽平移**：标签随缩放自动抽稀；「适应窗口」一键复位。
- **列内容**切「各样本」/「分组均值」；列顺序可选按分组归并或列聚类。
- **归一化**：行 Z-score（默认，即 `row`）/ 行中心化 / 行 Min-Max / log10 / 不归一化；计算基础可选相对丰度或原始值。
- **聚类**：距离（欧氏 / 相关 1−r / 余弦 / 曼哈顿）× 连接（平均 UPGMA / 完全 / 单链 / Ward.D2），左侧树状图横轴＝合并距离。
- **筛选**：相对丰度阈值（平均 / 任一最大 / 至少 N 个样本 ≥ 阈值）+ 特征数量阈值（至少在 N 个样本中检出），任一改动实时重算聚类与配色；另有检索框和「按丰度 Top 30」。
- **配色**：9 种色板（默认蓝-白-红）、以 0 为中心对称、分位裁剪；另可显示单元格数值、网格线、分类色条。
- **导出**：SVG（矢量）、PNG（2×）、TSV（当前视图：归一化值或相对丰度 %，行序列序与屏幕一致，带 BOM 与新旧参数注释）。

## 参数

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| `--groups FILE` | 无 | 样本分组表（两列）；不给则全部样本一组「未分组」 |
| `--out FILE` | `./heatmap/<表名>.heatmap.html` | 输出 HTML |
| `--title TEXT` | 自动 | 页面标题 |
| `--entity NAME` | 自动识别 | 界面文案里的特征实体名（通路 / OTU / 物种 / 基因 / 代谢物…）。识别依据：表头列名 + 前几行特征名 |
| `--transpose` | 自动判断 | 强制转置（表是「样本 × 特征」方向时） |
| `--hier-map FILE` | 无 | 自定义两级分类映射（两列 `level2<TAB>level1`）；不给时 KEGG 用内置映射，其它用 level2 本身 |
| `--no-normalize` | 关 | 不做列和归一化（表已 log/z-score 等变换过时用），阈值按原始数值解释，界面文案同步变成「丰度」 |
| `--ab-thresh X` | 1.0（`--no-normalize` 时 0） | 相对丰度阈值默认值（%%）；界面里仍可随时改 |
| `--prev N` | 10 | 特征数量阈值默认值（至少在 N 个样本中检出） |
| `--no-open` | 关 | 只构建，不打开浏览器 |

## 参数口径（很重要，别想当然）

- **相对丰度**：每个值 ÷ 本样本列和 × 100。用列和而不是总丰度，所以对「已是相对丰度（列和 = 1 或 100）」的表是幂等的；但对已做过 log / z-score / 中心化的表会二次扭曲 → 这种表必须加 `--no-normalize`。
- **两个阈值都有多种常见口径**，技能默认：
  - 相对丰度阈值 1.0% → **平均相对丰度 ≥ 1.0%**（跨全部样本的均值）；界面可切「任一（最大）样本 ≥ 阈值」「至少 N 个样本 ≥ 阈值」。
  - 特征数量阈值 10 → **至少在 10 个样本中检出**（丰度 > 0 的样本数），即检出率过滤；界面可关或改 N。
  两者是 **AND** 关系。因为口径会显著改变结果，交付时把「当前用了哪种口径 + 保留了多少条」讲给用户，界面顶部参数条也实时显示；口径不确定就先按默认出图再让用户在界面上切。
- **行归一化 row**：对保留矩阵逐行 Z-score（n−1）。颜色＝该特征在自身各列中的相对高低，**行间可比模式、不可比绝对量级**。
- **行聚类**在归一化后的矩阵上做（与主流工具一致），距离/连接可换；Ward 只对欧氏距离有统计意义。列聚类与行聚类独立。

阈值、算法、配色、导出的完整说明见 `references/parameters.md`。

## 踩过的坑（改代码前务必看）

1. **数值列不能是字符串**。JSON 里若把数值写成字符串，列和会变成字符串拼接 → 筛选结果全空、热图空白。构建脚本写的是 JSON 数字，前端还额外做了 `+f.v[k]` 兜底。
2. **SVG 的 viewBox 必须与容器实际像素同步**。首帧布局未稳定时测量出来的尺寸会和真实容器差十几像素，导致内容错位；前端用 `ResizeObserver` 兜住（`drawAll()` 里每次都按 `chartWrap.clientWidth/Height` 设 viewBox）。
3. **d3 的 `.append()` 会改变选择对象**。`.text(...).append('title')` 之后拿到的是 title 元素，若把它存成「行标签选择器」，悬停高亮就会静默失效。
4. **缩放后标签必须抽稀**，否则 200 行的标签会糊成一片；`updateThinning()` 按 `cellH * zoomK` 算步长。
5. **内联 D3 时要删掉 `//# sourceMappingURL=`**，否则产物看起来像在引外部文件（自检会报）。
6. 特征数很多（几千）时 SVG 矩形数会线性增长，浏览器仍能渲染但缩放略卡；建议先用阈值或 Top-N 收敛到几百条以内。
7. 选行后详情面板展开会改变图表区高度 → 依赖 `ResizeObserver` 重绘；这也是为什么 `drawAll()` 必须能独立于数据变化被调用。

## 文件结构

| 路径 | 作用 |
| --- | --- |
| `scripts/run.sh` | 一站式入口：找 python3 → 调 build（透传所有参数） |
| `scripts/build_heatmap.py` | 核心：丰度表(+分组表) → 自包含 HTML。分隔符/元数据列/方向/分类层级识别，CLI 在这里 |
| `scripts/demo_data.py` | 造 3 种形态的模拟数据（试跑 / 演示 / 回归） |
| `scripts/selftest.sh` | 自检：21 项（分隔符、方向、脏值、分组缺失、参数注入、错误退出码、产物自包含性…）。**改过脚本或 assets 后必须跑一遍** |
| `assets/NOTICE.md` | 内置 D3 的版本与 ISC 许可声明 |
| `assets/template.html` / `style.css` / `app.js` | 前端三件套（文案与口径由构建脚本注入的 `meta`/`defaults` 驱动） |
| `assets/d3.v7.min.js` | D3 v7.9.0，构建时内联（离线可用）；许可见 `assets/NOTICE.md` |
| `references/parameters.md` | 阈值/归一化/聚类/配色/导出的完整口径与常见问答 |
| `README.md` / `docs/preview-*.jpg` | 仓库浏览用的简介与效果图（不影响技能运行） |

改默认阈值要同时改 `build_heatmap.py` 的 `defaults` 和 `references/parameters.md`；改前端口径文案在 `assets/app.js` 的 `helpHTML()` / `applyDataDefaults()`。
