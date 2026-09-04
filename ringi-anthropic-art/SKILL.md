---
name: ringi-anthropic-art
description: "生成融合 Ringi 专属个人 IP 角色与 Anthropic / Claude 官方手绘编辑插画美学的概念配图：满版不透明纯色底色、不规则象牙白承载形、朴拙近黑手绘线条，将复杂抽象的 AI 概念、基础设施架构与人机协作提炼为高辨识度的扁平 2D 视觉隐喻卡片。"
---

# Ringi Anthropic Art (Ringi x Anthropic 手绘风插画)

本技能将 **Ringi 工程师 IP 形象** 与 **Anthropic 官方手绘编辑插画美学系统** 深度融合，生成具备新闻编辑感、学术严谨度与人文手绘质感的高级概念插画。

---

## 🎨 核心美学规范（三层视觉系统）

每张插画必须严格遵循三层物理构造：

1. **底层：全画幅不透明强调色背景（Full-Bleed Opaque Accent Background）**
   - 覆盖画面四个边角，严禁留白边、透明背景或棋盘格；
   - 官方标准色板：
     - **仙人掌淡绿 (Cactus)**：`#BCD1CA`（推荐：系统性、可信度、工程架构、治理）
     - **石楠淡紫灰 (Heather)**：`#CBCADB`（技术、研究、前沿洞察、内省）
     - **澄澈天空蓝 (Sky)**：`#6A9BCC`（开放、高速基础设施、通信、网络）
     - **燕麦温润米 (Oat)**：`#E3DACC`（人性化、平静、人机协作、伙伴关系）
     - **陶土暖橙 (Clay)**：`#D97757`（重大发布、能量、关键演进、强强调）
     - **无花果粉 (Fig)**：`#C46686`（创造力、文化、多样性）

2. **中层：不规则象牙白承载形（Ivory Carrier Shape）**
   - 色值固定为象牙白 `#FAF9F5`；
   - 占画面约 **55%–80%**，具有微弧度、略微不对称的手绘有机轮廓，自然将主体从彩色背景中托起。

3. **顶层：近黑色粗手绘墨迹（Near-Black Gestural Linework）**
   - 色值固定为 `#141413`；
   - 线条特点：圆头收尾、粗细自然不均、微有手工抖动（Analog Ink Wobble），保持朴拙天真感；
   - **零渐变、零阴影、零 3D、零高光、零写实摄影感**。

---

## 👤 Ringi 专属手绘特征设定

将 3D 手办版 Ringi 提炼为极简 2D 手绘符号：
- **发型**：规整利落的黑色平头短寸（Black buzz cut hair），黑墨块概括；
- **面容**：清晰的细方框眼镜，温暖友善的微笑弧线；
- **服饰**：简约休闲 T 恤或连帽卫衣，左手腕佩戴黑色方形智能手表；
- **动态手势**：极具表达力的手势（单手轻托、双手引导、思考构筑），与核心视觉隐喻对象产生生动互动。

---

## 🚀 工作流与提示词契约（Prompt Contract）

调用图像生成工具时，使用以下结构化契约：

```text
Use case: stylized-concept
Asset type: [editorial card / blog hero / social card]
Primary request: Illustrate Ringi with [主题概念/视觉隐喻], rendered strictly in Anthropic's signature hand-drawn editorial illustration visual language.
Scene/backdrop: full-bleed opaque [palette name and hex, e.g. cactus green #BCD1CA] background covering every corner from edge to edge; completely opaque, no transparency, no white border.
Subject: A simplified hand-drawn figure of Ringi: an Asian male with neat black buzz cut hair, wearing thin rectangular glasses, a simple relaxed t-shirt, and a smartwatch on his left wrist, smiling warmly as his expressive gestural hand [具体互动动作，如 holds up an abstract floating neural lightbulb / guides a puzzle piece / operates a simple hand-drawn terminal], symbolizing [主题核心内涵]. Centered with generous breathing room.
Style/medium: Anthropic editorial illustration language; naive black ink gesture; thick, slightly uneven, rounded stroke ends; simplified anatomy and objects; deliberate subtle asymmetry; flat two-dimensional forms.
Composition/framing: [1:1 square / 16:9 widescreen], focal cluster occupying roughly 65–80% of the canvas; instantly readable at thumbnail size.
Color palette: near-black #141413 gestural linework; large irregular organic ivory #FAF9F5 carrier shape behind the figure; full-frame opaque [背景色名与Hex] accent background; at most one tiny secondary accent.
Materials/textures: clean flat 2D color fields with subtle analog ink wobble; completely flat, zero 3D, zero gradients, zero shadows.
Text: none.
Avoid: transparent background, white outer border, black outer canvas, photorealism, 3D, gradients, shading, shadows, corporate vector art, dense clutter, logo, watermark.
```

---

## 📁 核心视觉资产引用

- `assets/reference-ringi-anthropic.jpg`：Ringi 在 Anthropic 手绘风下的官方基准参考
- `assets/reference-hand-house.png`：手部手势与不规则载体参考
- `assets/reference-hands-light.png`：双向节奏与光芒隐喻参考
- `assets/reference-object-globe.png`：大尺度有机轮廓参考
