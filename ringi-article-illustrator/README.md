# 👓 Ringi Article Illustrator (Ringi IP x 宝玉文章插图工作流)

> **全自洽、可离线、即拷即用的技术文章配图与 IP 视觉系统**  
> 结合 **宝玉（Baoyu）Type x Style 配图方法论** 与 **Ringi v3 专属 3D 小剧场视觉标准**。

---

## 📦 目录结构全景

```
skills/ringi-article-illustrator/
├── SKILL.md                          # 核心执行规范与 6 步工作流指令
├── README.md                         # 本离线自洽包说明文档
├── assets/                           # 角色参考图与高保真 3D 设定板
│   ├── ringi-tshirt-standee-clearglasses.jpg   # 官方标准立绘（透明方框眼镜）
│   ├── ringi-tshirt-standee-sunglasses.jpg     # 官方潮酷立绘（黑框墨镜版）
│   ├── ringi-tshirt-three-colorways.jpg        # 极客绿/暖姜黄/岩板蓝三色全景
│   ├── ringi-tshirt-multi-poses.jpg            # 四动作多姿态全景设定板
│   └── characters/ringi/                       # 角色元数据与多版本规范
├── references/                       # 核心规范与模板库
│   ├── character-spec-v3.md          # Ringi v3 身份特征与防漂移规范
│   ├── illustration-style.md         # 16:9 纯白底 3D 小剧场美学规范
│   ├── article-workflow.md           # 6 步深度通读与认知锚点提取指南
│   ├── types-and-styles.md           # Type x Style x IP 三维矩阵说明
│   ├── prompt-formulas.md            # 16:9 纯白底 Prompt 标准构造公式
│   ├── ai-infrastructure-templates.md# 7 大 AI Infra 领域专属场景模板
│   └── tool-workflow.md              # 生图工具调用与离线降级指南
└── scripts/                          # 离线自洽分析与管理脚本
    ├── illustrate_article.py         # 文章自动通读与配图规划 CLI
    └── character_registry.py         # 角色注册与状态查询 CLI
```

---

## 🚀 离线使用说明

本目录 `skills/ringi-article-illustrator/` 已完全解除对任何外部资产包的路径依赖。你可以：
1. **整体迁移**：直接将本目录复制到任何项目、任何开发机或任何离线环境；
2. **在 Antigravity / Claude Code 中使用**：直接指示 AI：  
   `使用 ringi-article-illustrator 为这篇文章配图`
3. **本地脚本分析**：
   ```bash
   python scripts/illustrate_article.py --article path/to/your_article.md
   ```
