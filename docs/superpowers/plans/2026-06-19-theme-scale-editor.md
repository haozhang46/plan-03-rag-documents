# Theme Scale Editor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade `style-tokens-editor` to a full Tailwind v3-compatible Colors + Spacing scale editor with bundled defaults, override sidecar, and `uno.config.ts` patch.

**Architecture:** Static `tailwindDefaultTheme.json` + `mergeTheme`/`diffOverrides`/`migrateLegacyTokens`; best-effort parse/patch for `uno.config.ts`; tabbed Vue UI (Colors | Spacing) with preview strip.

**Spec:** `docs/superpowers/specs/2026-06-19-theme-scale-editor-design.md`

**Tech stack:** Desktop only (`desktop/`). Vue 3 + UnoCSS + Vitest. No new npm dependencies. Tests: `cd desktop && pnpm test`.

**Do not auto-commit** unless the user explicitly requests commits.

---

### Task 1: Theme types, defaults JSON, merge utilities

**Files:**
- Create: `desktop/shared/tailwindDefaultTheme.json`
- Create: `desktop/src/workspace/theme/types.ts`
- Create: `desktop/src/workspace/theme/mergeTheme.ts`
- Create: `desktop/tests/workspace/mergeTheme.test.ts`

- [ ] Define types: `ThemeOverrides` (`version: 1`, optional `colors`, `spacing`), `MergedTheme`, `ColorPalette`, `SpacingScale`
- [ ] Add `tailwindDefaultTheme.json` with Tailwind v3 colors (22 hues × shades 50–950) and full spacing scale per spec §5.2
- [ ] Export `DEFAULT_THEME` from JSON import in `mergeTheme.ts`
- [ ] Implement `deepMergeTheme(base, ...layers)` for colors (nested) and spacing (flat keys)
- [ ] Implement `diffOverrides(merged, defaults)` → minimal override object (omit keys equal to defaults)
- [ ] Implement `migrateLegacyTokens(raw: unknown)` — flat `primary`/`spacingSm` → v1 shape per spec §5.3
- [ ] Implement `COLOR_SHADES = ['50','100',...,'950']` and `listColorPalettes(theme)` helper
- [ ] Implement `sortSpacingKeys(keys)` — order: `0`, `px`, then numeric ascending
- [ ] Tests: deepMerge, diffOverrides, legacy migration, sortSpacingKeys

Run: `cd desktop && pnpm test tests/workspace/mergeTheme.test.ts`

---

### Task 2: Parse and patch `uno.config.ts`

**Files:**
- Create: `desktop/src/workspace/theme/parseUnoTheme.ts`
- Create: `desktop/src/workspace/theme/patchUnoConfig.ts`
- Create: `desktop/tests/workspace/parseUnoTheme.test.ts`
- Create: `desktop/tests/workspace/patchUnoConfig.test.ts`

- [ ] `parseUnoTheme(content: string)` — best-effort extract `theme.colors` and `theme.spacing` from config text (regex/structured; handle nested `brand: { primary: "..." }`)
- [ ] Return `{}` on failure (non-throwing)
- [ ] `patchUnoConfig(content, merged: MergedTheme)` — replace or insert `theme: { colors, spacing }` block; preserve `presets`, `shortcuts`, `content`, imports
- [ ] Serialize colors/spacing as valid TS object literal (quoted keys where needed)
- [ ] Tests: parse sample matching `fe/uno.config.ts`; patch updates theme without removing shortcuts

Run: `cd desktop && pnpm test tests/workspace/parseUnoTheme.test.ts tests/workspace/patchUnoConfig.test.ts`

---

### Task 3: Theme UI panels + widget rewrite

**Files:**
- Create: `desktop/src/workspace/widgets/ThemeColorsPanel.vue`
- Create: `desktop/src/workspace/widgets/ThemeSpacingPanel.vue`
- Modify: `desktop/src/workspace/widgets/StyleTokensEditorWidget.vue`

- [ ] Rewrite widget: tabs **Colors** | **Spacing**; load flow = sidecar → migrate → parse uno.config → deepMerge with defaults
- [ ] `ThemeColorsPanel`: palette list left, shade rows (color input + hex) right; emit updates; "Reset palette" button
- [ ] `ThemeSpacingPanel`: table Key | Value | Reset per row
- [ ] Preview strip: color swatches for selected palette; spacing boxes with inline padding/gap from values
- [ ] Save: diffOverrides → write sidecar JSON; if `preset === 'unocss'`, patch `target` via `patchUnoConfig`
- [ ] data-testid: `theme-tab-colors`, `theme-tab-spacing`, `palette-{name}`, `shade-{shade}`, `spacing-row-{key}`, `save-tokens`, `reset-palette`
- [ ] Remove old 6-field form UI

Run: manual smoke via existing Designer Preview optional; unit tests in Task 4

---

### Task 4: Widget tests + full suite

**Files:**
- Modify: `desktop/tests/workspace/feWidgets.test.ts`
- Optionally create: `desktop/tests/workspace/StyleTokensEditorWidget.test.ts` if feWidgets gets too large

- [ ] Update StyleTokensEditor tests: loads defaults; legacy JSON migrates; edit blue-500 saves v1 override sidecar
- [ ] Test Colors tab shows palette list; Spacing tab shows spacing keys
- [ ] Test save calls `writeWorkspaceFile` with version 1 override shape (not flat primary)
- [ ] Full suite: `cd desktop && pnpm test`

---
