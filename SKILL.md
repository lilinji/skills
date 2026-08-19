---
name: ringi-ip-article-illustrations
description: Ringi 出品的完整个人 IP 插图工作流：内置已确认的 Ringi 专属 IP 角色（默认透明方框眼镜版与可选潮酷墨镜版），可直接为文章、AI 基础设施、大模型系统、技术架构与教程自动生成 16:9 复古彩色扁平 3D 小剧场插图；同时也支持上传照片创建新的个人角色。
---

# Ringi IP 文章插图

`Ringi` 是本 Skill 的核心品牌、作者印记与内置首选角色预设（默认佩戴透明方框眼镜，展现专注、极客与专业技术气质；也可随时切换为黑框墨镜版）。

本 Skill 提供两种使用方式：
1. **直接开箱即用（推荐）**：使用内置已确认的 **Ringi** 角色为技术文章、AI 基础设施、AI 工作流与方法论进行自动化小剧场插图生成；
2. **创建新角色**：任何人也可以上传自己的照片创建新专属角色并用于配图。

---

## 每次开始时

1. 读取 `references/character-package.md`，确定运行目录、角色状态与当前角色。
2. 若本地无已激活角色，默认自动启用内置 **Ringi（透明眼镜版）**。
3. 根据用户输入选择阶段（文章配图 / AI 模板 / 创建新角色 / 切换墨镜版）。
4. 只读取当前阶段需要的其他参考文件。

---

## 阶段路由

- **用户提供文章、Markdown、观点、链接或文件**：直接使用已激活的 Ringi 角色进入【文章配图】流程。
- **用户要求生成 AI 工作流 / AI 基础设施插图**：参考 `references/ai-infrastructure-templates.md` 生成对应的 16:9 小剧场插图。
- **用户要求切换为墨镜版 / 正常版**：在 `character-spec.md` 中调整对应饰品描述。
- **用户上传真人照片并要求创建新 IP**：进入【创建新角色】流程。
- **用户要求列出或管理角色**：运行 `scripts/character_registry.py list`。

---

## 核心表现模式与视觉语言

- **画幅标准**：16:9 横版正文插图。
- **背景规范**：延伸至四边的纯白画布（Pure Solid White），主体占比约 55%—65%，留出充足呼吸感。
- **美学风格**：复古彩色扁平 3D 手办/黏土质感、柔和接触阴影、哑光材质、低饱和复古色调。
- **两大表现模式**：
  - **流程拆解**：3—5 个关键节点组成的模块化传送带/机械流水线，Ringi 分身在各节点操作（如：收集资料 ➔ 筛选证据 ➔ 形成判断 ➔ 输出文章；用户提问 ➔ 向量检索 ➔ 上下文注入 ➔ 准确输出）。
  - **核心动作**：单一物理关系与核心冲突（如：Ringi 手持放大镜与印章进行人工把关/安全护栏过滤）。

---

## 启用与初始化内置 Ringi

首次在全新项目运行时，运行以下命令即可快速初始化并激活 Ringi 资产包：

```bash
python3 scripts/character_registry.py register \
  --root .punk-ip-assets \
  --slug ringi \
  --name "Ringi" \
  --sheet assets/ringi-character-sheet.jpg \
  --clean-reference assets/ringi-character-reference-clean.jpg \
  --spec references/character-spec.md

python3 scripts/character_registry.py confirm --root .punk-ip-assets --slug ringi
```

---

## 参考文件索引

- `references/character-spec.md`：Ringi 固定身份特征与外观规范
- `references/ai-infrastructure-templates.md`：AI 基础设施与工作流核心场景模板
- `references/illustration-style.md`：小剧场插图构图、色彩与美学规范
- `references/article-workflow.md`：文章阅读、认知锚点提取与配图流程
- `references/ip-builder.md`：新角色创建与特征提炼指南
- `references/tool-workflow.md`：图像生成接口调用与降级策略
