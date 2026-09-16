---
name: genetind-design
description: GeneTind Visual Design System skill for generating, styling, and reviewing user interfaces, landing pages, technical modules, social media marketing graphics, and brand assets. This skill should be used whenever the user requests GeneTind design work, UI development, social media cards, LinkedIn banners, or visual brand compliance checks.
---

# GeneTind Visual Design System Skill

The GeneTind Visual Design System is a precision-engineered, scientific, and low-entropy design language. It combines architectural rigor, Swiss typographic restraint, and warm tactile surfaces to convey technical authority, research confidence, and operational clarity.

This skill equips agents to design and code Web interfaces, landing pages, social media announcements, wide-format banners, and to audit existing surfaces for GeneTind brand compliance.

---

## 1. Core Design Philosophy & The 4 Non-Negotiable Rules

When creating any GeneTind visual or coded interface, enforce these four core rules:

1. **Undistorted Device Mockups**: Mockups must maintain their native device aspect ratios at all times. Never stretch, squash, or perspective-skew device screens.
2. **Strict Single-Keyword Emphasis**:
   - Headings and hero titles may contain **only ONE italic keyword**.
   - The italic keyword **must strictly use Tinos Italic** (`font-family: var(--font-accent); font-style: italic; font-synthesis: none;`). Never use browser-generated synthetic italics.
   - Approved color accents (`#EA580C` or `#FBDD67`) apply strictly to the italic keyword when specified by the template.
3. **Single Unbroken Containers & No Nested Frames**:
   - Extra outer frames, decorative nested outlines, and duplicate container boxes are forbidden.
   - Every rendered card, module, or preview must represent a single, clear structural entity.
4. **Zero AI Visual Slop (Anti-Slop Directive)**:
   - Banned: Purple/neon glows, random multi-color gradients, floating decorative shapes, blurred atmospheric noise, emojis, and marketing hype text.

---

## 2. Fast Reference & Design Tokens

Detailed specifications are partitioned into the `references/` directory. Consult them as needed:

- **Color Palettes & Figma Tokens**: See [references/design_tokens.md](references/design_tokens.md)
  - Base Canvas: `#FCFCFA` (`color/neutral/050`)
  - Surface Fill: `#F7F7F4` (`color/neutral/100`)
  - Line / Divider: `#E7E5DE` (`color/neutral/200`)
  - Primary Highlight: `#FBDD67` (`color/primary/300`)
  - Accent Orange: `#EA580C` (`color/accent/orange`)
  - Official Peak Green Mark: `#22C68D`
  - Deep Ink / Black Text: `#111111` / `#000000`
- **Typography & Grid Spacing**: See [references/typography_and_spacing.md](references/typography_and_spacing.md)
  - Fonts: `Inter` (Sans), `Roboto Mono` (Mono), `Tinos Italic` (Accent Italic)
  - Spacing Scale: `4px` (micro note) → `12px` (micro stack) → `24px` (section rhythm) → `32px` (panel padding) → `48px` (major gap)
  - 12-Column Desktop Grid: `max-w-6xl mx-auto w-full`
- **Buttons, Tags & Interactions**: See [references/ui_components.md](references/ui_components.md)
  - Buttons: Primary Ink (`bg-black text-white px-6 py-3 uppercase`), Secondary Outline, Split Directional (Black arrow block + White label block)
  - Tags: Neutral Tag, Active Tag (`bg-[#FBDD67] text-black border border-black`)
  - Icons: Lucide 24×24, 2px stroke, outline only
- **Social Media Templates**: See [references/social_templates.md](references/social_templates.md)
  - 3 Fixed Templates: Dark Portfolio Intro (`#000000`), Framed Device Showcase (`#F6F4EE`), Soft UI Product Promotion (`#EFEFEB`)
  - Aspect Ratios: `4:5` (standard portrait), `1:1` (square split), `9:16` (story/framed)
- **Wide Banners & Web Heroes**: See [references/banner_systems.md](references/banner_systems.md)
  - Aspect Ratio: `2.6:1` (60% light reading zone + 40% dark technical chamber)
- **Voice & Copy Tone Rules**: See [references/copy_tone_rules.md](references/copy_tone_rules.md)
  - Operational, factual, short imperative verbs. No marketing hype.

---

## 3. Workflow Procedures

When prompted with a GeneTind design request, follow the appropriate workflow:

### Mode A: Web UI / Frontend Component & Screen Design

To build or modify a GeneTind HTML/CSS/React interface:

1. **Initialize Stylesheet Dependencies**:
   - Reference `assets/css/theme.css` for CSS custom properties.
   - Ensure Google Fonts are loaded:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
     ```
2. **Structure the Layout**:
   - Wrap the main canvas in `max-w-6xl mx-auto px-6 sm:px-12 bg-[#FCFCFA] text-gray-900`.
   - Use `grid grid-cols-12 gap-4` for multi-column panels (e.g., 7 cols for primary view + 5 cols for spec rail).
   - Set panel containers to `bg-[#F7F7F4] border border-[#E7E5DE] rounded-2xl p-8`.
3. **Typography Styling**:
   - Section headers: `text-4xl font-light tracking-tight text-black leading-[1.2]`
   - Panel titles: `text-xl font-medium text-black`
   - Body prose: `text-sm leading-[1.65] text-gray-600`
   - System labels: `text-[10px] font-mono uppercase tracking-[0.18em] text-[#B4B4AE]`
4. **Deploy Buttons & Action Controls**:
   - Use Primary Ink (`bg-black text-white border border-black px-6 py-3 text-xs font-medium uppercase tracking-widest`) for the singular focal action.
   - Use Split Directional or Secondary Outline for secondary navigation.
5. **Verify Copy & States**:
   - Ensure labels are short and operational (`Run Check`, `View Details`, `Copy`).
   - Implement the `Copied` state with `#FBDD67` fill.

---

### Mode B: Social Media Graphics & Promotional Cards

To create an announcement card, social media image, or deck slide:

1. **Select ONE Strict Template** from [references/social_templates.md](references/social_templates.md):
   - **Template 1 (Dark Background / Portfolio Intro)**:
     - Pure black `#000000` canvas with 34px white hairline grid and concentric orbit rings.
     - Headline uses `#FBDD67` Tinos Italic keyword (e.g., `Portfolio <span class="font-accent-italic text-[#FBDD67]">Signals</span>`).
     - Bottom-anchored laptop device mockup.
   - **Template 2 (Framed Device Showcase)**:
     - Warm light `#F6F4EE` canvas with subtle watermark rings.
     - Centered headline with `#EA580C` Tinos Italic keyword (e.g., `Accelerate <span class="font-accent-italic text-[#EA580C]">Insight</span>`).
     - Device mockup wrapped in exactly **one hard black frame** (`border-[3px] border-black bg-white rounded-[12px]`).
   - **Template 3 (Soft UI / Product Promotion)**:
     - Light stone `#EFEFEB` canvas.
     - Headline has a solid **rectangular `#FBDD67` highlight block** directly behind the italic keyword (e.g., *Focus*).
     - Device mockup sits inside a soft rounded container (`rounded-[24px] bg-white/96`) with no hard borders.
     - Bottom pill CTA button (`View Mockups →`).
2. **Apply Header Brand Markers**:
   - Top-left: `GENETIND` (`text-[10px] font-semibold uppercase tracking-[0.18em]`)
   - Top-right: `@GENETIND` (`text-[10px] font-semibold uppercase tracking-[0.14em]`)
3. **Enforce Output Constraints**:
   - Do not invent custom layout hybrids.
   - Do not add random icons, stars, or speech bubbles.

---

### Mode C: Banner & LinkedIn Hero Generation

To create a wide-format banner (`2.6:1` aspect ratio):

1. Construct the dual-zone container according to [references/banner_systems.md](references/banner_systems.md).
2. Allocate the left 55%–60% to a light reading zone:
   - Small mono category label (e.g., `WEB / HORIZONTAL`).
   - 4xl~5xl font-light headline (max 2 lines).
   - 1 short sentence description.
   - Primary black CTA button.
3. Allocate the right 40%–45% to a dark technical graphic chamber:
   - `#0F0F0F` background with `border-l-2 border-black`.
   - Subtle 34px grid overlay and vignette.
   - Floating wireframe technical UI card with `-rotate-6 skew-y-3` elevation.

---

### Mode D: Design Audit & Brand Compliance Check

When auditing an interface or design for GeneTind compliance, evaluate against this checklist:

| Check Item | Acceptance Criteria | Fail Condition |
| :--- | :--- | :--- |
| **Typography** | Inter + Roboto Mono + Tinos Italic | Non-approved fonts, faux browser italic |
| **Italic Count** | Exactly 1 keyword italicized per title | 2+ words italicized, or full sentences |
| **Color Discipline** | Warm neutrals (`#FCFCFA` to `#111111`), `#FBDD67`, `#EA580C`, `#22C68D` | Neon purple, arbitrary blues, chaotic gradients |
| **Buttons** | Flat black/white uppercase tracking-widest | Rounded pill gradients, heavy drop-shadows |
| **Frames & Borders** | Single clean border (`#E7E5DE` or `3px black`) | Nested multi-frames, floating decorative boxes |
| **Mockup Ratio** | 100% native aspect ratio preserved | Stretched, squeezed, or distorted screens |
| **Copy Tone** | Objective, factual, concise operational verbs | Hype words (`Unlock`, `Magic`, `Supercharge`) |

---

## 4. Bundled Assets Directory Map

- `assets/media/genetind-mark.svg` — 100% official vector master mark (Peak Green `#22C68D`)
- `assets/media/genetind-logo-primary.svg` — Standard horizontal logo (light surface)
- `assets/media/genetind-logo-inverse.svg` — Standard horizontal logo (dark surface)
- `assets/media/genetind-logo-stacked.svg` — Vertical stacked logo
- `assets/media/H.svg` — Architectural grid origin and crosshair vector
- `assets/media/image-concentric-pattern.png` — Core concentric ring pattern asset
- `assets/backgrounds/genetind-background-01~12.png` — 12 pre-composed official background textures
- `assets/css/theme.css` — CSS custom properties and core tokens
- `assets/css/utilities.css` — Tailored utility classes
- `assets/css/overrides.css` — Accessibility and responsive overrides
