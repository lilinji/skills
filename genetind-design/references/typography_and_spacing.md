# GeneTind Typography & Spacing Architecture

This reference defines the typographic hierarchy, font stacks, single-keyword italic rules, spacing intervals, and 12-column desktop grid.

---

## 1. Font Family Stack

Loaded via Google Fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap');
```

| Role | Family Name | CSS Variable / Utility | Purpose |
| :--- | :--- | :--- | :--- |
| **Primary Sans** | `Inter`, sans-serif | `var(--font-sans)` | Interface headings, body prose, component labels |
| **Technical Mono** | `Roboto Mono`, monospace | `var(--font-mono)` / `.font-mono` | System labels, code tokens, data values, steps, handles |
| **Editorial Accent** | `Tinos`, serif (Italic) | `var(--font-accent)` / `.font-accent-italic` | **Single-keyword emphasis** in titles and hero cards |

---

## 2. Typographic Scale & Hierarchy

### 2.1 H1 Hero Display
- **Specs**: `text-5xl lg:text-7xl font-normal tracking-tight text-black leading-[1.1]`
- **Font**: Inter
- **Usage**: Main page titles, top-level hero claims.
- **Example**: `Structured interfaces create research confidence.`

### 2.2 H2 Section Title
- **Specs**: `text-4xl font-light tracking-tight text-black leading-[1.2]`
- **Font**: Inter
- **Usage**: Primary section headers.
- **Example**: `Technical modules must feel calm, precise, and legible.`

### 2.3 Panel / Card Title
- **Specs**: `text-xl font-medium text-black`
- **Font**: Inter
- **Usage**: Component headers, module cards.

### 2.4 Social Headline & Title Accent (**CRITICAL RULE**)
- **Specs**: `font-accent-italic` with `font-synthesis: none; font-style: italic;`
- **Font**: **Tinos Italic** (Never use browser-synthesized italic or faux-italic).
- **Hard Rule**:
  - **ONE italic keyword only** per title/headline. Never italicize two words or entire sentences.
  - Approved accent colors may apply to the italic keyword only when the template specifies:
    - Dark template: `color: var(--color-primary-highlight)` (`#FBDD67`) e.g. `Portfolio <span class="font-accent-italic" style="color: var(--color-primary-highlight);">Signals</span>`
    - Framed template: `color: var(--color-accent-orange)` (`#EA580C`) e.g. `Accelerate <span class="font-accent-italic" style="color: var(--color-accent-orange);">Insight</span>`
    - Soft promotion template: Black Tinos Italic with rectangular highlight `#FBDD67` behind it e.g. `Product <span class="relative inline-block font-accent-italic"><span class="absolute inset-x-[-0.08em] inset-y-[0.14em] bg-[#FBDD67] -z-10"></span>Focus</span>`

### 2.5 Social Brand Markers (Top Corners)
- **Brand name**: `text-[10px] font-semibold uppercase tracking-[0.18em]` (e.g. `GeneTind`)
- **Handle**: `text-[10px] font-semibold uppercase tracking-[0.14em]` (e.g. `@GeneTind`)
- **Font**: Inter SemiBold
- **Usage**: Top left/right corners of marketing/social media cards.

### 2.6 Body Text
- **Specs**: `text-sm leading-[1.65] text-gray-600 max-w-2xl`
- **Font**: Inter
- **Tone**: Calm, factual, low-drama. Sentences are concise and informative.

### 2.7 Caption / System Label
- **Specs**: `text-[10px] font-mono uppercase tracking-[0.18em] text-[#B4B4AE]`
- **Font**: Roboto Mono
- **Usage**: Status badges, module identifiers, metadata tags (`System Label / Ready`).

### 2.8 Inline Code
- **Specs**: `text-[10px] font-mono inline-flex border border-[#E7E5DE] bg-[#F7F7F4] px-2 py-1 text-black`
- **Font**: Roboto Mono
- **Usage**: CLI flags, file paths, variables (e.g., `--dry-run`, `/workspace/config`).

---

## 3. Spacing & Rhythm System

All spacing follows an architectural mathematical rhythm:

```
4px (Micro Note) ── 12px (Micro Stack) ── 24px (Section Rhythm) ── 32px (Panel Padding) ── 48px (Major Gap)
```

| Token / Spacing | Value | Purpose & Placement |
| :--- | :--- | :--- |
| **Panel Padding** | `32px` (`p-8` / `32px`) | Default internal padding for technical panels, cards, and divided modules |
| **Major Gap** | `48px` (`gap-12` / `48px`) | Space between primary columns, major sections, or distinct visual blocks |
| **Section Rhythm** | `24px` (`gap-6` / `24px`) | Vertical spacing between stacked content groups inside a single column |
| **Micro Spacing** | `12px` (`gap-3` / `12px`) | Spacing for compact button groups, form rows, meta items |
| **Micro Note** | `4px` (`gap-1` / `4px`) | Spacing for tightly coupled label + error, icon + text, footnote lines |

---

## 4. Grid Architecture: 12-Column Desktop Grid

- **Container Constraint**: `max-w-6xl mx-auto w-full px-6 sm:px-12`
- **Grid Setup**: `grid grid-cols-12 gap-4`
- **Standard Split Ratios**:
  - **7:5 Engineering Layout**: `col-span-12 lg:col-span-7` (Primary interaction workspace) + `col-span-12 lg:col-span-5` (Indexed support rail / specifications)
  - **8:4 Asymmetric Layout**: `col-span-12 lg:col-span-8` (Main view) + `col-span-12 lg:col-span-4` (Meta rail)
  - **Symmetric 6:6**: Used only for balanced comparisons (Do vs. Don't, Input vs. Output)
