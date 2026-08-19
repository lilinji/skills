# Ringi IP Illustrations (Agent Skill)

**Ringi 出品 ｜ 专为技术长文、AI 基础设施与 AI 工作流打造的个人 IP 复古 3D 小剧场插图工作流。**

这是一个完整的 AI Agent Skill：内置已确认的 **Ringi** 专属个人 IP（默认标准透明眼镜版与潮酷墨镜版），可自动读取技术文章、架构方案或观点，生成高质量、统一风格的 16:9 复古彩色扁平 3D 小剧场正文插图；同时也支持上传照片创建新的专属 IP。

---

## 📸 角色设定与多角度展示

<table>
  <tr>
    <td width="50%" align="center">
      <b>标准默认版（透明眼镜 · 专注极客）</b><br>
      <img src="assets/ringi-character-sheet.jpg" width="100%" alt="Ringi 角色设定图（透明眼镜版）">
    </td>
    <td width="50%" align="center">
      <b>潮酷备用版（黑框墨镜 · 决断大拿）</b><br>
      <img src="assets/ringi-character-sheet-v2.jpg" width="100%" alt="Ringi 角色设定图（墨镜版）">
    </td>
  </tr>
</table>

---

## 🎨 场景效果展示（AI 工作流 & 小剧场插图）

<table>
  <tr>
    <td width="50%" align="center">
      <b>RAG 知识库检索增强生成工作流</b><br>
      <img src="docs/images/01-rag-retrieval-workflow.jpg" width="100%" alt="RAG 知识检索增强工作流">
    </td>
    <td width="50%" align="center">
      <b>AI Agent 智能体闭环工作流 (ReAct Loop)</b><br>
      <img src="docs/images/02-agent-execution-loop.jpg" width="100%" alt="AI Agent 智能体闭环工作流">
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <b>Human-in-the-Loop 人工把关与安全护栏</b><br>
      <img src="docs/images/03-human-in-the-loop-guardrails.jpg" width="100%" alt="Human-in-the-loop 人工安全把关">
    </td>
    <td width="50%" align="center">
      <b>研究与文章撰写 4 步流水线</b><br>
      <img src="docs/images/01-workflow-sunglasses.jpg" width="100%" alt="文章撰写流程拆解流水线">
    </td>
  </tr>
</table>

---

## ⚡ 核心能力与特性

- **开箱即用**：内置已调优的 Ringi 高清 3D 资产，无需重新训练即可直接出图。
- **双模态外观切换**：默认标准透明方框眼镜（适合排错、调研、技术解析）；可无缝切换潮酷黑框墨镜（适合总结、架构决断）。
- **两大核心模式**：
  - **流程拆解（Process Breakdown）**：3—5 节点模块化流水线，Ringi 分身在各工位操作。
  - **核心动作（Core Action）**：单一物理关系与核心观点冲突（如：放大镜把关、故障热插拔替换）。
- **纯白无界画布**：16:9 横版正文配图，无杂乱背景，完美融入 Markdown、技术博客与公众号。

---

## 📦 安装方法

### 1. 安装至 Antigravity / Gemini IDE

Windows (PowerShell):
```powershell
git clone https://github.com/lilinji/skills.git "$HOME\.gemini\config\skills\ringi-ip-article-illustrations"
```

### 2. 安装至 Claude Code

```bash
git clone https://github.com/lilinji/skills.git ~/.claude/skills/ringi-ip-article-illustrations
```

### 3. 安装至 Codex

```bash
git clone https://github.com/lilinji/skills.git ~/.codex/skills/ringi-ip-article-illustrations
```

---

## 🚀 快速使用

在支持 Agent Skills 的客户端中，直接发送文章或需求即可：

```text
请使用 ringi-ip-article-illustrations 为以下文章生成 16:9 配图：
[粘贴您的技术长文、Markdown 或观点段落]
```

### 首次初始化角色包（若在全新工程）

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

## 📂 仓库结构

```text
skills/
├── SKILL.md                               # Agent Skill 核心指令定义
├── README.md                              # 项目说明与画廊展示
├── LICENSE                                # 开源协议
├── assets/                                # Ringi 核心视觉资产（设定板、干净全身图）
├── characters/ringi/                      # 预置已确认的角色资产包与 manifest
├── references/                            # 规范参考文档（角色规范、AI Infra模板、构图美学）
├── scripts/                               # 角色注册与状态机脚本（character_registry.py）
├── illustrations/                         # 预生成的 AI 工作流与流程拆解高清图库
└── docs/images/                           # README 画廊展示图片
```

---

## 📄 License

MIT License.
