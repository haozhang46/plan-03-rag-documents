# Theme Scale Editor (Tailwind-Compatible) — Design Spec

**Status:** Approved — 2026-06-19

**Builds on:**

- [2026-06-19 Workflow Step Workspace Low-Code](./2026-06-19-workflow-workspace-lowcode-design.md) — `style-tokens-editor` widget
- [2026-06-19 Workspace Designer Preview](./2026-06-19-workspace-designer-preview-design.md) — Preview column for in-Designer editing

## 1. Purpose

Upgrade **`style-tokens-editor`** from a 6-field brand token form into a **full Tailwind-compatible theme scale editor** for UnoCSS projects:

1. **Colors** — complete hue palettes (`slate`, `gray`, `blue`, …) with shades `50`–`950`
2. **Spacing** — numeric scale (`0`, `px`, `0.5`, `1`, … `96`) matching Tailwind v3 / `presetUno()` conventions

**User goal (confirmed):** Option **B** (full scale, not semantic-only) with v1 scope **A** (Colors + Spacing only).

**Not in scope (v1):**

- Preflight / `@tailwind base` / reset CSS editing
- Border radius, typography, shadows, breakpoints (v1.1+)
- True Tailwind CSS (`tailwind.config.js`) output — UnoCSS only
- `presetWind4` / Tailwind v4 `@theme` CSS-first mode
- New npm UI dependencies (Headless UI, Formily)
- Replacing external tools (SUI Theme Creator) — this is the embedded workspace widget

## 2. Problem Statement

Today `StyleTokensEditorWidget` edits six custom fields (`primary`, `secondary`, `accent`, three spacing strings) and regex-patches `uno.config.ts`. This does not match user expectation of a **Tailwind base/theme editor** where:

- Color palettes are edited per hue and shade (`blue-500`, not only `brand.primary`)
- Spacing follows the numeric utility scale (`p-4`, `gap-8`)
- Defaults come from Tailwind's standard theme, with project overrides layered on top

The `preset: "tailwind"` option in registry is a stub (JSON only, no config patch).

## 3. Approach

**Recommended: static Tailwind v3 default theme JSON + override merge (方案 1)**

| Layer | Source |
|-------|--------|
| Base defaults | `desktop/shared/tailwindDefaultTheme.json` — bundled Tailwind v3-compatible scale |
| Project config | Parse `theme` from target `uno.config.ts` (best-effort) |
| User overrides | Sidecar `themeFile` (e.g. `fe/app/assets/theme.json`) — **diff only** |

Save flow: `merged = deepMerge(defaults, unoTheme, themeJson)` → compute overrides vs defaults → write sidecar + patch `uno.config.ts`.

**Rejected alternatives:**

- Runtime `@unocss/preset-wind` merge in Desktop — heavier bundle, Wind3/Wind4 divergence
- External Theme Creator link-only — not embedded in workspace

## 4. Stack Constraints

- Target projects use **UnoCSS `presetUno()`** (Tailwind v3-compatible), per `fe/uno.config.ts` and AGENTS.md
- Editor runs in **Electron Desktop renderer**; file I/O via existing `panelApi.readWorkspaceFile` / `writeWorkspaceFile`
- Widget type remains **`style-tokens-editor`** — no workspace JSON migration for component type
- Registry props unchanged: `preset` (`unocss` \| `tailwind`), `target`, `themeFile?` — `tailwind` preset documented as future; v1 implements **unocss** path only

## 5. Data Model

### 5.1 Sidecar `theme.json` (overrides only)

```json
{
  "version": 1,
  "colors": {
    "blue": {
      "500": "#3b82f6",
      "600": "#2563eb"
    },
    "brand": {
      "primary": "#2563eb"
    }
  },
  "spacing": {
    "4": "1.25rem"
  }
}
```

- `version: 1` required
- Only keys differing from bundled defaults are persisted (diff on save)
- Empty `{}` sections omitted

### 5.2 Bundled defaults

`desktop/shared/tailwindDefaultTheme.json` contains at minimum:

**colors:** `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink`, `rose` — each with shades `50`, `100`, … `950` where applicable (Tailwind v3 palette)

**spacing:** `0`, `px`, `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, `3.5`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `14`, `16`, `20`, `24`, `28`, `32`, `36`, `40`, `44`, `48`, `52`, `56`, `60`, `64`, `72`, `80`, `96`

### 5.3 Legacy migration

Existing sidecar with flat keys (`primary`, `secondary`, `accent`, `spacingSm`, …):

| Legacy key | Maps to |
|------------|---------|
| `primary` | `colors.brand.primary` (custom group preserved) |
| `secondary` | `colors.brand.secondary` |
| `accent` | `colors.brand.accent` |
| `spacingSm` | `spacing.2` (override value from legacy field) |
| `spacingMd` | `spacing.4` |
| `spacingLg` | `spacing.8` |

On load, if `version` missing and flat keys detected, migrate in-memory before render; on first save, write v1 override format.

### 5.4 `uno.config.ts` patch

Replace regex-only `theme` block patch with structured serializer:

- Read existing `defineConfig({ ... })` file as text
- Merge `theme.colors` and `theme.spacing` from merged model
- Preserve other config keys (`presets`, `shortcuts`, `content`, …)
- If parse/patch fails, save sidecar only and show non-fatal message (same pattern as today)

## 6. UI Design

### 6.1 Layout

```text
┌─ Theme Scale Editor ─────────────────────────────────────────────┐
│ Colors | Spacing                          unocss → fe/uno.config  │
│                                              [Reset palette] [Save]│
├────────────────────────────┬─────────────────────────────────────┤
│ Palette nav (Colors tab)   │ Shade / key editor                  │
│  slate                     │  50  [color] [#hex]               │
│  gray                      │  100 [color] [#hex]               │
│  blue  ← selected          │  …                                │
│  …                         │  950 [color] [#hex]               │
├────────────────────────────┴─────────────────────────────────────┤
│ Preview strip: swatches + spacing bars (p-4, gap-8 samples)      │
└──────────────────────────────────────────────────────────────────┘
```

**Colors tab:**

- Left: scrollable list of hue names
- Right: 11 rows (50–950) with color input + hex text field
- "Reset palette" restores selected hue to defaults (removes overrides for that hue)

**Spacing tab:**

- Single table: columns `Key` | `Value` | `Reset`
- Keys sorted numerically (`0`, `px`, `0.5`, …)
- Reset per row restores default value

### 6.2 Preview strip

- **Colors:** horizontal swatches for selected palette shades
- **Spacing:** 3–4 boxes with inline `padding` / `gap` using merged spacing values (inline style from rem values, not live UnoCSS compile in v1)
- Class labels shown as hints (`bg-blue-500`, `p-4`) for developer reference

### 6.3 States

| State | Behavior |
|-------|----------|
| Loading | Read sidecar → parse uno.config → merge defaults |
| Dirty | Save enabled; optional indicator in header |
| Save success | Message: sidecar path + whether uno.config patched |
| Save partial | Sidecar saved; uno patch skipped with warning |
| Error | Red banner with message |

## 7. Module Layout

| File | Responsibility |
|------|----------------|
| `desktop/shared/tailwindDefaultTheme.json` | Bundled Tailwind v3 defaults |
| `desktop/src/workspace/theme/types.ts` | `ThemeOverrides`, `MergedTheme`, `ThemeVersion` |
| `desktop/src/workspace/theme/mergeTheme.ts` | `deepMerge`, `diffOverrides`, `migrateLegacyTokens` |
| `desktop/src/workspace/theme/parseUnoTheme.ts` | Best-effort extract `theme.colors` / `theme.spacing` from config text |
| `desktop/src/workspace/theme/patchUnoConfig.ts` | Serialize merged theme back into `uno.config.ts` |
| `desktop/src/workspace/widgets/StyleTokensEditorWidget.vue` | UI shell + tabs |
| `desktop/src/workspace/widgets/ThemeColorsPanel.vue` | Colors tab (optional split if widget grows) |
| `desktop/src/workspace/widgets/ThemeSpacingPanel.vue` | Spacing tab (optional split) |

Split panels into separate Vue files **only if** `StyleTokensEditorWidget.vue` exceeds ~350 lines after rewrite.

## 8. Integration

- **Workflow Run** and **Workspace Designer Preview** — unchanged; same widget type and props
- **fe-dev template** — keep `preset: "unocss"`, `target: "fe/uno.config.ts"`, `themeFile: "fe/app/assets/theme.json"`
- **Zod** — `style-tokens-editor` props schema unchanged; no backend route changes

## 9. Testing

Run: `cd desktop && pnpm test`

| Test | File |
|------|------|
| `deepMerge` / `diffOverrides` / legacy migration | `desktop/tests/workspace/mergeTheme.test.ts` |
| `parseUnoTheme` extracts colors/spacing | `desktop/tests/workspace/parseUnoTheme.test.ts` |
| `patchUnoConfig` preserves presets/shortcuts | `desktop/tests/workspace/patchUnoConfig.test.ts` |
| Widget loads defaults, edits blue-500, saves override JSON | `desktop/tests/workspace/feWidgets.test.ts` (update StyleTokensEditor tests) |
| Colors tab lists palettes; spacing tab lists keys | component test on widget or panel |

## 10. Success Criteria

- [ ] Colors: all bundled hue palettes editable per shade 50–950
- [ ] Spacing: full numeric scale editable
- [ ] Defaults loaded from `tailwindDefaultTheme.json`; overrides in sidecar only
- [ ] Legacy 6-field JSON migrates on load
- [ ] Save patches `uno.config.ts` `theme.colors` and `theme.spacing` without destroying other config
- [ ] Preview strip reflects current draft values
- [ ] No new npm dependencies
- [ ] Existing workspace schema and registry unchanged

## 11. Future (v1.1+)

- Border radius, fontSize, lineHeight, boxShadow namespaces
- Live UnoCSS preview (compile utilities in iframe/shadow DOM)
- `preset: tailwind` → `tailwind.config.ts` export
- Wind4 / CSS variable `@theme` alignment
- Import/export theme JSON file dialog
