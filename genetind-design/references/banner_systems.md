# GeneTind Banner Systems & Web Hero Architectures

This reference details the specifications for wide-format banners, LinkedIn cover graphics, and full-width website hero headers.

---

## 1. Banner Dimensional Specs

- **Standard Aspect Ratio**: `2.6:1` (ideal for LinkedIn Company Cover, Twitter Header, and Desktop Hero Banners).
- **Minimum Canvas Resolution**: `1584×609 px` (LinkedIn standard) or `2400×923 px` (retina).
- **Base Structure**: Dual-zone split container:
  - **Left Zone (55%–60%)**: Light reading zone (`#FFFFFF` or `#FCFCFA`), calm typography, high contrast CTA.
  - **Right Zone (40%–45%)**: Dark graphic chamber (`#0F0F0F` or `#111111`), technical grid texture, angled floating UI elevation.

---

## 2. Structural Implementation

```html
<div class="w-full aspect-[2.6/1] bg-white border border-gray-300 overflow-hidden flex relative rounded-lg">
  <!-- Left Layout (Content & Action) -->
  <div class="w-1/2 md:w-[60%] p-10 lg:p-16 flex flex-col justify-center bg-white z-10 relative">
    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">
      Web / Horizontal
    </span>
    <h2 class="text-4xl lg:text-5xl font-light tracking-tight text-black mb-4 leading-[1.1]">
      The new standard for clinical data agents.
    </h2>
    <p class="text-sm text-gray-500 max-w-sm mb-8">
      Deploy fully verified medical AI skills in seconds. Completely private.
    </p>
    <button class="bg-black text-[10px] lg:text-xs text-white px-6 py-3 uppercase tracking-widest font-medium w-max">
      Experience V2
    </button>
  </div>

  <!-- Right Layout (Technical Graphic Chamber) -->
  <div class="w-1/2 md:w-[40%] bg-[#0f0f0f] relative overflow-hidden flex items-center justify-center border-l-2 border-black">
    <!-- Grid Overlay -->
    <div class="absolute inset-0 grid-bg opacity-20"></div>
    <div class="absolute inset-0 bg-gradient-to-l from-transparent to-[#0f0f0f]/80"></div>
    
    <!-- Floating Technical Mock Card -->
    <div class="bg-[#1a1a1a] border border-[#333] p-4 text-white w-2/3 skew-y-3 -rotate-6 transform transition-transform duration-1000 hover:rotate-0 hover:skew-y-0 rounded shadow-2xl">
      <div class="w-20 h-2 bg-white/20 rounded mb-4"></div>
      <div class="w-full h-1 bg-white/10 rounded mb-2"></div>
      <div class="w-4/5 h-1 bg-white/10 rounded"></div>
    </div>
  </div>
</div>
```

---

## 3. Banner Layout Guidelines

1. **Clear Division**: A decisive vertical boundary line (`border-l-2 border-black`) separates the prose realm from the abstract technical realm.
2. **Safe Zones for Profile Overlays**: For platform banners like LinkedIn or Twitter, keep critical typography and buttons in the center-right of the left zone to prevent avatar badge collision on mobile.
3. **Typography Restraint**: Headline is max 2 lines; helper prose is max 2 sentences.
