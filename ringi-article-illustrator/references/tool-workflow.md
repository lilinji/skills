# 生图工具调用与离线降级指南

## 1. 支持的生图后端
- **Google GenAI / Imagen 3**: `gemini-3-pro-image-preview` / `imagen-3.0-generate-002`
- **OpenAI**: `gpt-image-1.5` / `dall-e-3`
- **DashScope (阿里通义万象)**: `z-image-turbo` / `wanx-v1`
- **本地 WebUI / ComfyUI**: SDXL / Flux 离线文生图
- **离线降级方案**: 自动生成 Mermaid 架构图 + 纯英文 Prompt 蓝图包

## 2. 离线使用原则
当在无网络或无 API 配额环境下使用时：
1. 依赖本地 `assets/characters/ringi/` 中已沉淀的高保真参考图；
2. 依赖 `references/prompt-formulas.md` 和 `references/ai-infrastructure-templates.md` 生成高度结构化的 Prompt；
3. 正文使用 Mermaid 架构图保障技术阅读体验，待在线时一键批量渲染图像！
