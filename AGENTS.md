# Repository Guidelines

## Project Overview

Collection of Claude Code / agent skills by Ringi (lilinji): AI-infrastructure illustration pipelines, visual design systems, writing engines, agent runtimes, and scientific data visualization. Seven skills:

- **`ringi-article-illustrator/`** — 6-step article→illustration workflow (Type × Style × IP matrix). Analyzes a markdown article, proposes illustration types, generates 16:9 images via the host's image tool.
- **`ringi-ip-article-illustrations/`** — IP-character-driven illustration pipeline. Manages reusable character assets (Ringi) with a draft→confirmed state machine, then auto-illustrates articles end-to-end.
- **`genetind-design/`** — GeneTind visual design system (color tokens, social card templates, banner masters).
- **`ringi-anthropic-art/`** — Anthropic/Claude-style hand-drawn concept illustration engine.
- **`ringi-writing-dna/`** — writing-style distillation & cloning engine for long-form technical articles.
- **`frontier-agent/`** — agent runtime + native TUI (Stateful ReAct, multi-agent teams, sandboxing).
- **`abundance-heatmap/`** — abundance table (KEGG/GO/OTU/species/gene/metabolite) → **single-file offline interactive D3 heatmap** (row clustering + row Z-score + dual thresholds). Python-stdlib builder; D3 vendored in `assets/` and inlined into the output.

Skills are distributed by copying each `SKILL.md` directory into a client skill dir (`~/.claude/skills`, Antigravity/Gemini, Codex). MIT licensed, copyright Ringi (lilinji).

## Architecture & Data Flow

No runtime services. Everything is markdown-driven skill definitions + stdlib Python utilities; image generation is performed by the **host agent's built-in image tool**, never by scripts.

```
article.md ──► SKILL.md workflow ──► illustrate_article.py (heading→type/metaphor/filename proposal)
                    │
                    ├── character_registry.py (character.json manifest → asset paths)
                    │
                    └── host image tool (16:9, retro flat-3D, reference images for identity)
                                   │
                                   ▼
                        <runtime-root>/illustrations/<article-slug>/NN-topic.png
```

Key data flow per skill (from SKILL.md + `references/article-workflow.md`):

1. Read article → generate structured outline (image count ≤ 8, anchor at headings)
2. `ringi-ip-article-illustrations`: resolve character via registry (must be `confirmed`)
3. Build prompt from `references/prompt-formulas.md` / `ai-infrastructure-templates.md`
4. Generate via host image tool with `referenced_image_paths` for identity consistency
5. Save to `illustrations/<slug>/NN-topic.png` (two-digit index, kebab-case, `-v2/-v3` on collision)
6. On API rate-limit/429: **never fabricate files** — emit full prompts + Mermaid/ASCII fallback so the article stays readable

## Key Directories

| Path | Purpose |
|---|---|
| `ringi-article-illustrator/` | Skill A: scripts + 7 reference docs |
| `ringi-article-illustrator/scripts/` | `illustrate_article.py` (analyzer), `character_registry.py` (minimal) |
| `ringi-article-illustrator/references/` | `types-and-styles.md`, `prompt-formulas.md`, `article-workflow.md`, `illustration-style.md`, `ai-infrastructure-templates.md`, `character-spec-v3.md`, `tool-workflow.md` |
| `ringi-ip-article-illustrations/` | Skill B: full pipeline |
| `ringi-ip-article-illustrations/scripts/` | `character_registry.py` (full versioned CLI) |
| `ringi-ip-article-illustrations/references/` | `character-package.md` (runtime layout + state machine — read first), `article-workflow.md`, `tool-workflow.md`, `ip-builder.md`, `illustration-style.md`, `ai-infrastructure-templates.md`, `character-spec.md` |
| `ringi-ip-article-illustrations/characters/` | Character manifests (`ringi/character.json`) + assets |
| `ringi-ip-article-illustrations/docs/` | Images only (gallery); reference prose lives in `references/` |
| `abundance-heatmap/` | Abundance table → offline interactive heatmap HTML |
| `abundance-heatmap/scripts/` | `build_heatmap.py` (stdlib-only builder, all CLI options), `run.sh` (one-shot entry), `demo_data.py` (fixtures), `selftest.sh` (21 checks) |
| `abundance-heatmap/assets/` | `template.html` / `style.css` / `app.js` (front-end engine) + `d3.v7.min.js` (vendored, inlined at build time) |
| `abundance-heatmap/references/` | `parameters.md` — threshold/normalization/clustering/export semantics + FAQ |

## Development Commands

All scripts are Python 3 stdlib-only; run from the skill directory.

```bash
# Skill B: register + confirm a character (required before use)
python scripts/character_registry.py --root . register --slug ringi --sheet path/to/sheet.png --clean path/to/clean.png --spec path/to/spec.md
python scripts/character_registry.py --root . confirm ringi

# Skill B: resolve active character to absolute asset paths
python scripts/character_registry.py --root . resolve

# Skill B: list/activate
python scripts/character_registry.py --root . list
python scripts/character_registry.py --root . activate ringi

# Skill A: analyze an article → illustration proposal (stdout)
python scripts/illustrate_article.py --article path/to/article.md

# Skill A: get active character
python scripts/character_registry.py
```

No build step, no package manager, no lint config, no test suite.

## Code Conventions & Common Patterns

- **Stdlib-only Python 3** scripts: `os`, `sys`, `argparse`, `re`, `json`. No third-party imports, no direct API calls in scripts — image generation stays in the host tool layer.
- **Registry pattern** (`character_registry.py`): manifests are `character.json` with `schema_version: 1`, fields `slug/name/status/revision/created_at/updated_at/confirmed_at/assets{sheet,clean_reference,spec}`.
- **State machine**: character `status` starts `draft`, must be `confirm`-ed before use (`resolve` requires confirmed unless `--allow-draft`).
- **Validation style**: runtime guards raising exceptions — `SLUG_RE` (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), manifest/asset existence → `FileNotFoundError`, confirmed-gate → `ValueError`, atomic JSON writes, exit code 1 + stderr on error.
- **Non-destructive writes**: on slug collision, never overwrite — create `-v2`/`-v3` copies.
- **Naming**: output files `NN-topic.png` (two-digit index + kebab slug); character sheets are 3:4/4:5 vertical, avatars square.
- **Style defaults** (see `references/illustration-style.md`): 16:9 1920×1080, pure-white canvas, retro flat-3D clay/vinyl matte, subject occupies 55–65%, contact shadows.

## Important Files

| File | Why it matters |
|---|---|
| `ringi-article-illustrator/SKILL.md` | Skill A entry: 6-step workflow, Type×Style×IP matrix, env/tool support, 429 fallback policy |
| `ringi-ip-article-illustrations/SKILL.md` | Skill B entry: phase routing, init/register/confirm commands |
| `ringi-ip-article-illustrations/references/character-package.md` | Runtime layout (`.punk-ip-assets/`), manifest schema, registry semantics — "每次开始时" read-first doc |
| `ringi-ip-article-illustrations/scripts/character_registry.py` | Full registry CLI — the canonical implementation |
| `ringi-article-illustrator/scripts/illustrate_article.py` | Article analyzer; heading→type/metaphor mapping (架构/分层, 内存/存储, RAII/生命周期, 扩展/PyBind/CUDA) |
| `README.md` | Repo index + per-client install commands |

## Runtime/Tooling Preferences

- **Python 3** (stdlib only); scripts assume execution from the skill's own directory (`os.path.dirname(__file__)` path resolution).
- No Node/npm, no third-party deps, no package.json/requirements.txt/pyproject. Exception: browser-side libraries under a skill's `assets/` are physical assets (e.g. `abundance-heatmap/assets/d3.v7.min.js`, ISC) that get inlined into the generated artifact for offline use; they are not runtime dependencies.
- Image generation requires a host tool supporting `referenced_image_paths` (identity anchoring). Supported envs: baoyu-image-gen, GenAI, OpenAI, DashScope, Replicate, local WebUI.
- Runtime character state lives in `<runtime-root>/.punk-ip-assets/` (project-scoped, not the repo).

## Testing & QA

- **No CI or coverage configs exist** in this repo. The only test script is `abundance-heatmap/scripts/selftest.sh` (21 checks); run it after touching that skill's scripts or assets.
- Validation is runtime-only: `character_registry.py` input guards (slug format, asset existence, confirmed status).
- QA policy lives in `ringi-article-illustrator/SKILL.md` step 5 (降级保障): on API 429, output prompts + Mermaid/ASCII fallbacks instead of fabricating image files.
- If adding tests: plain `unittest`/`pytest` scripts colocated in `scripts/` would match the stdlib-only convention; no existing runner config to extend.

## Known Gotchas (verified by repo audit)

- `ringi-article-illustrator/SKILL.md` references `scripts/generate_ai_infra_scenes.py` — **that file does not exist** (phantom command).
- `illustrate_article.py --output-outline` is parsed but **never used** — no file is written regardless of the flag.
- The two `character_registry.py` files **diverge** (minimal vs full CLI) — do not swap them between skills.
- Skill B's registry CLI requires `--root`; `resolve`/illustration fail for unconfirmed characters.
