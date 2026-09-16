# GeneTind UI Components & Interaction System

This reference defines the core UI component patterns, button variants, tags, cards, icons, and interaction states for GeneTind.

---

## 1. Logo Implementation Rules

The GeneTind logo is the primary brand identifier. It exists in three official lockups and one standalone vector mark.

### 1.1 Master Assets (in `assets/media/`)
- `genetind-mark.svg` / `.png`: The **100% Original Green Mark** (Peak Green `#22C68D`). Features the wave peak curve and right-side 4-step slice ladder geometry.
- `genetind-logo-primary.svg` / `.png`: Standard horizontal lockup on light backgrounds.
- `genetind-logo-inverse.svg` / `.png`: Standard horizontal lockup for dark surfaces (`#111111` or `#000000`).
- `genetind-logo-stacked.svg` / `.png`: Vertical stacked lockup for footer signatures.

### 1.2 Clear Space & Sizing
- **Clear Space (`1x`)**: Define `x` as the full rendered height of the logo. A clear margin of at least `1x` must surround the logo on all four sides. In tightly constrained UI, reduce to a strict minimum of `0.5x`.
- **Standard Heights**:
  - `32px`: Standard UI height for navigation headers, topbars.
  - `44px`: Larger interface displays, hero blocks.
  - `56px`: Prominent presentation screens.

### 1.3 Strict Logo Don'ts
- **DO NOT** stretch, squash, rotate, or distort the mark.
- **DO NOT** change logo colors outside the approved `#22C68D`, pure black, or inverse white lockups.
- **DO NOT** add dropshadows, blur, glow, or gradients to the logo.

---

## 2. Button Systems

GeneTind buttons are disciplined, flat, uppercase, and highly tactile.

### 2.1 Primary Ink Button
The primary call-to-action on light surfaces.
```html
<button class="bg-black text-white border border-black px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors inline-flex items-center gap-2">
  <span>View Details</span>
  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</button>
```

### 2.2 Secondary Outline Button
Used for neutral secondary operations.
```html
<button class="bg-white border border-black text-black px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-gray-50 transition-colors">
  Review Rules
</button>
```

### 2.3 Split Directional Button
Signature technical button pairing a black directional icon container with a white text segment.
```html
<button class="inline-flex items-stretch overflow-hidden border border-black hover:opacity-90 transition-opacity">
  <span class="flex items-center justify-center bg-black text-white px-3">
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </span>
  <span class="bg-white px-4 py-3 text-xs font-medium uppercase tracking-widest text-black">
    Open Module
  </span>
</button>
```

### 2.4 Download / Utility Pill Button
Used in technical toolbars and asset cards.
```html
<a class="border border-[#E7E5DE] bg-white px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.16em] text-gray-500 hover:bg-[#FBFAF7] hover:border-[#D8D3C8] hover:text-black transition-colors" download href="...">
  Download SVG
</a>
```

---

## 3. Tags & System Labels

### 3.1 Neutral Tag
```html
<span class="text-[10px] uppercase font-bold tracking-widest bg-white text-gray-600 px-3 py-1.5 rounded-sm border border-gray-300">
  Neutral Tag
</span>
```

### 3.2 Active Tag
```html
<span class="text-[10px] uppercase font-bold tracking-widest bg-[#FBDD67] text-black px-3 py-1.5 rounded-sm border border-black">
  Active Tag
</span>
```

### 3.3 System Label
```html
<span class="text-[10px] uppercase font-mono tracking-[0.18em] text-[#B4B4AE]">
  System Label / Ready
</span>
```

### 3.4 Interactive Copy State Button
```html
<!-- Idle -->
<button class="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-500 border border-gray-200 px-3 py-1.5 bg-white hover:bg-gray-50">
  Copy
</button>

<!-- Copied Confirmation -->
<button class="text-[10px] font-mono uppercase tracking-[0.12em] text-black border border-black bg-[#FBDD67] px-3 py-1.5">
  Copied
</button>
```

---

## 4. Icon System (Lucide Core)

- **Dimensions**: `24×24` frame (scalable via vector viewBox).
- **Stroke**: `2px` stroke width, outline only. Never filled icons.
- **Stroke properties**: `stroke-linecap="round" stroke-linejoin="round"`.
- **Approved catalog**: `Bot`, `Activity`, `Info`, `Github`, `Layout`, `Cpu`, `Finance`, `Copy`, `Search`, `Close`, `Check`, `Plus`, `Minus`, `ArrowRight`, `ArrowLeft`, `ChevronRight`, `ChevronDown`, `Settings`, `MoreHorizontal`, `ExternalLink`, `Edit`, `Trash`, `Download`, `Star`.

---

## 5. Interaction States & Motion Timing

1. **Hover State**:
   - Touch point feedback uses gentle warmth or border clarification (`border-color`, `box-shadow 0 6px 14px rgba(17, 17, 17, 0.04)`).
   - Never use dramatic scale transforms (>1.02x) or wild color shifts.
2. **Focus State**:
   - `outline: 1px solid #d8d3c8; outline-offset: 2px;`
   - Visible keyboard navigation compliance on all interactive elements.
3. **Motion Curves**:
   - **Direct UI response**: `300ms ease` for clicks, toggles, hover color shifts.
   - **Ambient settle**: `1000ms ease` for background settling and slow confirmations.
   - Respect `prefers-reduced-motion: reduce` by setting `transition: none`.
