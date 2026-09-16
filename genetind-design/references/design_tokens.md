# GeneTind Design Tokens & Color Architecture

This reference documents the exact color scales, Figma tokens, and CSS variables for the GeneTind Visual Design System. All designs and UI code must strictly adhere to these values without introducing arbitrary hex codes or rogue gradients.

---

## 1. CSS Custom Properties (`:root`)

Defined in `assets/css/theme.css`:

```css
:root {
    --font-sans: 'Inter', sans-serif;
    --font-mono: 'Roboto Mono', monospace;
    --font-accent: 'Tinos', serif;
    --color-accent-orange: #ea580c;
    --color-primary-highlight: #fbdd67;
    --color-canvas: #fcfcfa;
    --color-surface: #f7f7f4;
    --color-line: #e7e5de;
}
```

---

## 2. Figma Color Scheme (Source of Truth)

### 2.1 Primary / Highlight Scale (`color/primary/*`)
Restrained warm yellow scale used for emphasis, guided attention, and a single focal CTA per view.

| Step | Figma Token | Hex Value | Usage / Notes |
| :--- | :--- | :--- | :--- |
| `050` | `color/primary/050` | `#FFF9DE` | Subtle yellow highlight wash / tag background |
| `100` | `color/primary/100` | `#FFF4B8` | Soft active hover states |
| `200` | `color/primary/200` | `#FFEC8C` | Intermediate yellow tone |
| `300` | `color/primary/300` | `#FBDD67` | **Primary Brand Highlight** (`--color-primary-highlight`), keyword text highlight block, Copied state fill |
| `400` | `color/primary/400` | `#F6CC46` | High-visibility attention marker |
| `500` | `color/primary/500` | `#EDB732` | Darker yellow accent border |
| `600` | `color/primary/600` | `#D08D23` | Warm amber boundary |
| `700` | `color/primary/700` | `#A66B1C` | Deep amber text |
| `800` | `color/primary/800` | `#7A4D16` | High-contrast dark amber |
| `900` | `color/primary/900` | `#52320F` | Darkest amber shadow / contrast |

### 2.2 Neutral Scale (`color/neutral/*`)
Canvas, technical structure, typography, and clean border dividing roles across all interfaces.

| Step | Figma Token | Hex Value | Usage / Notes |
| :--- | :--- | :--- | :--- |
| `050` | `color/neutral/050` | `#FCFCFA` | **Canvas base** (`--color-canvas`), default page background |
| `100` | `color/neutral/100` | `#F7F7F4` | **Surface fill** (`--color-surface`), panels, code block backgrounds, diagram frames |
| `200` | `color/neutral/200` | `#E7E5DE` | **Line / Border** (`--color-line`), card borders, table dividers, structural grids |
| `300` | `color/neutral/300` | `#D9D7D0` | Subtle active borders, secondary strokes |
| `400` | `color/neutral/400` | `#B4B4AE` | Muted system labels, mono caption text (`text-[#B4B4AE]`) |
| `500` | `color/neutral/500` | `#8E8E87` | Secondary helper text, timestamp labels |
| `600` | `color/neutral/600` | `#6B6B66` | Standard body text (`text-gray-600` equivalent) |
| `700` | `color/neutral/700` | `#4E4E49` | Medium subheadings, prominent secondary text |
| `800` | `color/neutral/800` | `#2A2A28` | Charcoal high-contrast text |
| `900` | `color/neutral/900` | `#111111` | Primary headings, Primary Ink button fills, dark text (`#111827` / `#000000`) |

---

## 3. Semantic Status Scales

### 3.1 Semantic Success (`color/semantic/success/*`)
Positive workflow outcomes, confirmation states, and safe operational feedback.

| Step | Token | Hex Value | Role |
| :--- | :--- | :--- | :--- |
| `100` | `color/semantic/success/100` | `#E0EBE7` | Background badge |
| `300` | `color/semantic/success/300` | `#9FBFB4` | Border stroke |
| `500` | `color/semantic/success/500` | `#5A8876` | Core status icon / text |
| `700` | `color/semantic/success/700` | `#3E6B5A` | Dark container text |
| `900` | `color/semantic/success/900` | `#2C5348` | High contrast contrast text |

### 3.2 Semantic Warning (`color/semantic/warning/*`)
Attention states, validation prompts, and controlled caution surfaces.

| Step | Token | Hex Value | Role |
| :--- | :--- | :--- | :--- |
| `100` | `color/semantic/warning/100` | `#F6EEDC` | Caution background surface |
| `300` | `color/semantic/warning/300` | `#D8B96D` | Caution border |
| `500` | `color/semantic/warning/500` | `#C18E2A` | Core warning indicator |
| `700` | `color/semantic/warning/700` | `#8F6118` | Warning text |
| `900` | `color/semantic/warning/900` | `#5B3C0E` | High contrast dark warning text |

### 3.3 Semantic Error (`color/semantic/error/*`)
Blocking failures, destructive states, and critical system feedback.

| Step | Token | Hex Value | Role |
| :--- | :--- | :--- | :--- |
| `100` | `color/semantic/error/100` | `#F5E3E1` | Error container wash |
| `300` | `color/semantic/error/300` | `#D69A94` | Error stroke |
| `500` | `color/semantic/error/500` | `#B85E57` | Destructive icon / red state |
| `700` | `color/semantic/error/700` | `#8D4A44` | Error label |
| `900` | `color/semantic/error/900` | `#603733` | Critical dark error text |

---

## 4. Standalone Brand Identity Tokens

| Token Name | Hex Value | Visual Meaning & Approved Application |
| :--- | :--- | :--- |
| **Brand Mark Peak Green** | `#22C68D` | **GeneTind Official 1:1 Vector Mark**. Used exclusively for the wave peak and stepped sliced graphic of the official logo. Must never be swapped with random greens. |
| **Accent Orange** | `#EA580C` | `color/accent/orange` (`--color-accent-orange`). High-contrast brand callout used for approved keyword emphasis (e.g. *Insight*) and standout CTA accents. |
| **State Info** | `#4B6778` | `color/state/info`. Context, system guidance, research notes, and neutral status communication. |
| **Primary Highlight** | `#FBDD67` | `color/primary/300` (`--color-primary-highlight`). Keyword emphasis on dark backgrounds (e.g. *Signals*), highlight behind *Focus*, Copied button fill. |

---

## 5. Strict Color Discipline & Anti-Patterns

1. **NO Neon Purples or AI Gradients**: Pure magenta, electric violet, multi-color mesh gradients, and cyan-purple glows are strictly BANNED.
2. **NO Arbitrary Grays**: Use only the `#FCFCFA` to `#111111` warm neutral spectrum. Do not mix cool blue grays with warm neutrals in the same view.
3. **Restrained Color Presence**: 90% of the interface consists of `#FFFFFF`, `#FCFCFA`, `#F7F7F4`, `#E7E5DE`, and `#111111`. Color accents (`#FBDD67`, `#EA580C`) must be used as precise surgical highlights, never as massive full-screen flood fills (except for the approved pure-black social hero template).
