---
name: ringi-article-illustrator
description: Ringi IP x Baoyu 工业级技术文章配图工作流：结合宝玉 Type x Style 配图方法论（信息图、场景、流程、对比、架构、时间线）与 Ringi 专属 IP 3D 小剧场（16:9 纯白底、哑光手办黏土质感、流程工坊与核心动作双模态），自动化分析文章结构、提取认知锚点、规划插图大纲并生成高一致性的 IP 插图。使用场景包括“为文章配图”、“生成技术插图”、“Ringi 配图”、“文章配图”等。
---

# Ringi IP x Baoyu 文章插图工作流（Ringi Article Illustrator）

本 Skill 融合了 **宝玉（Baoyu）工业级文章配图方法论** 与 **Ringi 专属个人 IP 3D 视觉系统**。它能够自动通读文章、识别认知重难点、按章节规划信息载荷，并以 **16:9 纯白底复古彩色扁平 3D 小剧场（流程工坊 / 核心动作）** 为载体，生成极具极客辨识度与技术严谨性的高水准插图。

---

## 🎨 核心视觉语言与三维矩阵（Type x Style x IP）

### 1. 维度一：信息结构（Type）
| 类型 Type | 表现形态 | 适用技术场景 |
| :--- | :--- | :--- |
| **`pipeline-workshop`（流程工坊）** | 3~5 节点模块化流水线/传送带，Ringi 分身在各工位操作 | 数据加载流、算子执行链、训练/推理 Forward-Backward 流程、编译 JIT/AOT |
| **`core-action`（核心动作）** | 单一物理冲突与核心动作特写，强对比 | 指针零拷贝移交、显存安全锁闭、故障节点自愈热插拔、GIL 锁打破 |
| **`memory-map`（物理存储）** | 1D 连续物理地址带 vs 高维逻辑结构展开 | 虚拟地址空间、栈堆分配、Cache Line 64B 对齐、张量 Strides 步长 |
| **`comparison`（双轨对比）** | 上下/左右双轨对比测试台 | 深拷贝（慢速吊车） vs 移动语义（光速移交）、稠密 vs 稀疏 Attention |
| **`architecture`（分层架构）** | 悬浮透视分层工作台（控制面、Runtime、硬件层） | vLLM/TRT-LLM 架构、PyTorch ATen 三层结构、CPU-GPU 异构通信拓扑 |
| **`infographic`（高密信息图）** | 仪表盘、监控矩阵与核心数据牌 | Roofline 算术强度模型、显存/计算量三账本、集群吞吐量监控 |

### 2. 维度二：美学风格（Style）
- **默认/核心风格**：`retro-flat-3d`（16:9 复古彩色扁平 3D 黏土/潮玩手办质感，纯白无界背景，柔和接触阴影，低饱和极客色调）；
- **扩展风格**：`minimal-tech`（极简白底极客线框）、`blueprint`（工程深蓝/白底蓝图）。

### 3. 维度三：IP 角色规范（Ringi v3 夏季短袖版）
- **发型五官**：30 岁亚裔男性、帅气自信微笑、黑色利落短寸头（buzz cut）、规整发际线、干净无胡茬；
- **核心上装**：宽松圆领短袖 T 恤，**胸口正中清晰印有纯白无衬线英文字样 `Ringi`**；
  - *经典极客绿（默认）*：橄榄绿 / 森林绿（Olive / Moss Green）—— 适用 AI Infra、算子、底层系统；
  - *复古暖姜黄（活力）*：芥末黄 / 暖赭石（Mustard Yellow）—— 适用日常工作流、算法教程、高互动；
  - *科技岩板蓝（专业）*：雾霾蓝 / 岩板蓝（Slate Blue）—— 适用分布式系统、网络与云原生；
- **下装配饰**：纯黑宽松工装阔腿长裤、黑白滑板鞋、黑色方形智能手表、**细金属框透明眼镜（默认）** / 复古黑框墨镜（潮酷决断）。

---

## 🔄 6 步标准配图工作流（Execution Workflow）

```
Step 1: 资产与偏好预检 ──> Step 2: 深度通读与认知锚点分析 ──> Step 3: 配置确认
         │
         ▼
Step 6: 文档组装回填 <── Step 5: 图像生成与降级保障 <── Step 4: 生成插图大纲 outline.md
```

### Step 1: 资产与偏好预检
1. 检查角色资产：优先加载 `.punk-ip-assets/characters/ringi/character-spec-v3.md` 与参考图；
2. 检查生图环境：支持 `baoyu-image-gen`、Google GenAI、OpenAI、DashScope、Replicate 或本地 WebUI。

### Step 2: 深度通读与认知锚点分析
- 通读文章全文，提炼 3~5 个核心技术论点；
- **定位配图锚点**：在**读者认知负荷最大、概念极度抽象、涉及多组件物理流动或涉及两难对比**的位置插入配图；
- **物理隐喻转化**：绝不画无意义的装饰图，必须将抽象算法/系统机制具象化为机械工坊物件（齿轮、传送带、保险库、仪表盘、钥匙、管道）。

### Step 3: 配置确认（交互或默认）
- 默认配图密度：**章节核心（Per-Section, 3~6 张）**；
- 默认画幅比例：**16:9 横版（Panoramic Widescreen）**；
- 默认背景：**Pure Solid White Background（纯白画布）**。

### Step 4: 规划插图大纲（`outline.md`）
在文章同级或 `.punk-ip-assets/illustrations/` 生成标准规划：
```markdown
# 文章配图大纲: [文章标题]
- 角色: Ringi (v3 极客绿短袖 + 透明方框眼镜)
- 画幅: 16:9
- 总图数: 4

## 插图 1: [标题]
- **位置**: 第 0.1 节后
- **Type**: architecture (分层架构工坊)
- **核心隐喻**: Python 控制面通过发光透明管道下沉至 C++ 数据面
- **Ringi 动作**: 操作中枢跨语言数据总线
- **文件名**: assets/ringi_01_arch.jpg
- **Prompt**: [完整英文提示词]
```

### Step 5: 图像生成与降级保障
1. **API 可用时**：调用 `baoyu-image-gen` 或 Python SDK 批量生成 2K 16:9 图片；
2. **API 达到配额限制（429）时触发降级协议**：
   - 绝不伪造文件；
   - 输出完整的 16:9 英文提示词、物理机制拆解与参数包；
   - 在正文中使用 **高清晰度 Mermaid 架构时序图与 ASCII 内存物理图** 确保正文立即可读！

### Step 6: 文档组装回填
将图片以标准 Markdown 语法回填至正文对应锚点：
```markdown
![Ringi 导师解构：[插图主题]](assets/[文件名].jpg)
```

---

## 🛠️ 常用命令与脚本

```bash
# 1. 为指定 Markdown 文章自动分析并生成配图方案
python scripts/illustrate_article.py --article path/to/article.md

# 2. 仅生成 AI Infra 专属标准场景图
python scripts/generate_ai_infra_scenes.py --scene "gpu_cluster" --output assets/gpu_cluster.jpg
```
