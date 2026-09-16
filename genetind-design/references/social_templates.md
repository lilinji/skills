# GeneTind Social Media & Marketing Templates

This reference documents the rule-based social graphics system, approved background compositions, and 3 standard production templates.

---

## 1. System Philosophy & Hard Limits

Social media output in GeneTind is a **rule-based architectural system**, not a freestyle canvas.

### Hard Limits (Anti-Patterns)
1. **Layout Purity**: Use strictly **ONE** layout structure per graphic. Never mix Hero, Split, and Frame in the same card.
2. **Zero Decor Slop**: No artificial gradients, neon glows, dropshadow blurs, lens flares, or decorative noise textures.
3. **Mockup Integrity**: Mockups must keep their true device proportions. Never stretch, distort, or perspective-warp beyond clean front/slight-isometric elevations.
4. **Single Emphasis**: Titles must have **ONE** italic keyword only, rendered strictly in **Tinos Italic**.

---

## 2. Core Elemental Vocabulary

Every graphic is constructed from these approved primitives:
- **Lens / Orbit Rings**: Thin concentric circular hairline rings with a solid center anchor dot (`assets/media/image-concentric-pattern.png`).
- **Grid Origin**: Architectural crosshairs and coordinate lines (`assets/media/H.svg`).
- **Bracket Corners**: `w-10 h-10` hairline L-brackets marking boundary corners (`border-t border-l border-black/20`).
- **Linear Grid Overlay**: `30px×30px` (light) or `34px×34px` (dark) subtle grid lines.
- **12 Approved Background Compositions**: Stored in `assets/backgrounds/` (`genetind-background-01.png` through `12.png`).

---

## 3. The 3 Standard Production Templates

### Template 1: Dark Background / Portfolio Intro
**Role**: Category intro, portfolio announcement, high-impact dark mode card.
- **Aspect Ratio**: `4:5` (or `1:1`)
- **Canvas Base**: Pure black `#000000`
- **Background Construction**:
  - `34px×34px` linear white grid at `0.08` opacity
  - Centered concentric circular rings (diameters: 44px, 28px, 14px) in `border-white/10`
  - Horizontal (`w-[52%] h-px`) and vertical (`h-[28%] w-px`) hairline crosshairs
- **Header Metadata**:
  - Left: Mini circular orbit icon + `GENETIND` (`text-[10px] font-semibold uppercase tracking-[0.18em] text-white/78`)
  - Right: `@GENETIND` (`text-[10px] font-semibold uppercase tracking-[0.14em] text-white/65`)
- **Headline Architecture**:
  - `text-[40px] leading-[0.95] tracking-tight text-white max-w-[15ch]`
  - Italic Keyword Rule: Uses **`#FBDD67`** (`--color-primary-highlight`)
  - Example: `Portfolio <span class="font-accent-italic" style="color: var(--color-primary-highlight);">Signals</span>`
- **Sub-label**: `text-[11px] font-mono uppercase tracking-[0.24em] text-[#FBDD67]/80` (e.g. `www.genetind.com`)
- **Visual Anchor**: Clean, undistorted laptop device mockup anchored at bottom (`h-[42%]`).

---

### Template 2: Framed Device Showcase
**Role**: Headline-led product showcase, technical capability release.
- **Aspect Ratio**: `4:5`
- **Canvas Base**: Warm light neutral `#F6F4EE`
- **Background Construction**:
  - Subtle `30px` grid overlay
  - Large offset watermark rings in lower right quadrant (`w-[78%] h-[78%] rounded-full border-black/8`)
- **Header Metadata**:
  - Left: `GENETIND` | Right: `@GENETIND` in dark charcoal `#1F1F1F`
- **Headline Architecture**:
  - Vertically centered, text-center: `text-[42px] leading-none tracking-tight text-black`
  - Italic Keyword Rule: Uses **`#EA580C`** (`--color-accent-orange`)
  - Example: `Accelerate <span class="font-accent-italic" style="color: var(--color-accent-orange);">Insight</span>`
- **Frame Boundary**:
  - Exactly **ONE** hard frame: `border-[3px] border-black bg-white rounded-[12px]` wrapping the device area.
  - **NO** nested multiple borders or outer frames.
- **Visual Anchor**: Device UI mockup centered inside the single black frame.

---

### Template 3: Soft UI / Product Promotion
**Role**: Product-led promotion, interactive feature announcements.
- **Aspect Ratio**: `4:5`
- **Canvas Base**: Soft stone neutral `#EFEFEB`
- **Background Construction**:
  - Subtle grid with upper-right radial ring watermark
- **Header Metadata**:
  - Left: `GENETIND` | Right: `@GENETIND`
- **Headline Architecture**:
  - Upper-left read zone: `text-[40px] leading-[0.95] tracking-tight text-black`
  - Italic Keyword Rule: Black Tinos Italic with a solid **rectangular `#FBDD67` highlight block** directly behind the word.
  - **Constraint**: Yellow block must have zero border-radius (`rounded-none`).
  - Example:
    ```html
    Product&nbsp;
    <span class="relative inline-block font-accent-italic">
      <span class="absolute inset-x-[-0.08em] inset-y-[0.14em] bg-[#FBDD67] -z-10"></span>
      Focus
    </span>
    ```
- **Container**: Soft container block with `rounded-[24px] bg-white/96` and **NO visible border**.
- **Interactive Call-to-Action**:
  - Bottom centered pill button: `rounded-full bg-white text-black px-6 py-3 text-[12px] font-medium tracking-tight shadow-sm` with right arrow `→`.

---

## 4. Composition Rules & Correction Logic

### Composition Golden Rules
1. **Focal Anchor**: Every card has exactly one primary element that reads first (Headline, Lens form, or Device).
2. **Negative Space**: Maintain generous quiet zones around text blocks.
3. **Alignment Discipline**: Strict left or center alignment. No floating off-axis text.

### Real-Time Correction Logic
| Symptom | Diagnosis | Corrective Action |
| :--- | :--- | :--- |
| **Card feels weak / low impact** | Too many competing accents | Simplify. Remove secondary badges and enlarge the primary headline or mockup anchor. |
| **Card feels crowded / messy** | Too many decorative parts | Delete elements. Keep only the top-corner brand, main headline, and single visual container. |
| **Card feels empty / barren** | Lacks structural grounding | Add system structure (subtle `30px` grid, hairline orbit ring, or bracket corners), **never** random decorative stickers or floating blobs. |
