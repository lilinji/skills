---
name: frontier-agent
description: FrontierAgent 开源智能体运行时与终端系统技能：支持 Stateful ReAct 单兵循环与 Agent Team 多智能体协同团队，提供基于 Textual 的原生交互终端（TUI）、三级任务沙箱隔离（/inputs、/workspace、/outputs）、异步指令热注入、会话差分审计与前沿科研基准评测。
---

# FrontierAgent 智能体运行时技能手册

`FrontierAgent` 是由 ApodexAI 团队随同 Apodex-1.1 旗舰模型开源的现代智能体运行时框架、交互式命令行终端（TUI）与科研评测套件，专为解决高复杂度、长程研究（Long-Horizon Research）与严格文件工作流（File-grounded Tasks）而设计。

---

## 核心模式

### 1. Stateful ReAct 模式 (`--mode react`)
- **适用场景**：单兵深度排障、代码重构、单文件迭代、确定性工具调试。
- **机制**：单个高智商智能体在任务隔离沙箱中自主循环：观察 ➔ 推理 ➔ 工具执行 ➔ 差分自愈 ➔ 产出。

### 2. Agent Team 团队模式 (`--mode agent_team`)
- **适用场景**：复杂课题深度调研（Deep Research）、跨学科综合分析、复杂 Office 报表多线程编撰。
- **机制**：
  1. **Coordinator（总控智能体）**：拆解全局目标，在 **Task Board（实时任务看板）** 上建立任务条目。
  2. **AgentBus & SpawnGuard**：通过异步总线派发受限的并发子智能体（Sub-agents），严格控制派生深度与算力消耗。
  3. **Parallel Sub-agents（并发子智能体）**：多路并行抓取资料、检索网页、提取文档并提交结构化报告（`submit_report`）。
  4. **Fast Reporter 证据审查**：独立审查通道进行事实交叉核验，由总控生成权威综合报告。

---

## 常用命令与启动指南

### 1. 交互式 TUI 终端启动
```bash
# Windows 原生环境（已配置 SANDBOX_BACKEND=host 或使用 --no-sandbox）
uv run frontier-agent --mode agent_team --cwd /path/to/project --no-sandbox

# 启动单智能体 ReAct 模式
uv run frontier-agent --mode react --cwd /path/to/project --no-sandbox

# Linux / WSL2 环境
uv run frontier-agent --mode agent_team --cwd /path/to/project
```

### 2. 单次指令或无界面批处理
```bash
# 直接执行任务并输出
uv run frontier-agent --mode agent_team --no-tui -p "调研大模型长上下文推理机制并生成报告"

# 挂载只读前置输入文档启动
uv run frontier-agent --mode react --input ./input.pdf --input ./dataset.xlsx
```

### 3. 断点恢复与回滚
```bash
# 恢复上一中断会话
uv run frontier-agent --resume

# 在 TUI 会话内撤销文件变更（利用文件审计日志）
/revert
```

---

## 沙箱安全与文件流规范

FrontierAgent 采用任务级三区隔离模型（Fail-closed 安全底座）：

| 路径 | 权限 | 用途说明 |
|:---|:---|:---|
| `/inputs` | **只读 (Read-Only)** | 严禁污染的原始输入数据、文献与前置素材 |
| `/workspace` | **读写 (Working State)** | 临时代码执行、临时文件、爬虫缓存中间产物 |
| `/outputs` | **持久化 (Deliverables)** | 仅允许已声明的发布者输出最终报告与交付物，映射到主机会话目录 |

---

## 环境变量配置 (`.env`)

```ini
# 核心大模型配置（兼容 OpenAI 规范）
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o

# 搜索增强（可选）
SERPER_API_KEY=your-serper-key
JINA_API_KEY=your-jina-key
```
