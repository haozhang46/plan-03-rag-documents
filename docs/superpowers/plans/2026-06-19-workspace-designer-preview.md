# Workspace Designer Preview — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Workspace Designer props editing (`file-list` for `{ path, label }[]`) and add a live Preview column that mounts registry widgets with `panelApi`.

**Architecture:** Extract `WorkspacePropFields.vue` for schema-driven forms; add Preview column in `WorkspaceDesigner` reusing `WIDGET_COMPONENTS` and shared `bindWidgetProps()` helper. Runtime-only widgets show placeholders.

**Spec:** `docs/superpowers/specs/2026-06-19-workspace-designer-preview-design.md`

**Tech stack:** Desktop only (`desktop/`). Vue 3 + UnoCSS + Vitest. No new npm dependencies. Tests: `cd desktop && pnpm test`.

**Do not auto-commit** unless the user explicitly requests commits.

---

### Task 1: `file-list` prop type + `WorkspacePropFields.vue`

**Files:**
- Modify: `desktop/shared/workspaceRegistryData.ts`
- Create: `desktop/src/components/workflow/WorkspacePropFields.vue`
- Create: `desktop/tests/components/WorkspacePropFields.test.ts`

- [ ] Add `"file-list"` to `PropFieldType` union in `workspaceRegistryData.ts`
- [ ] Change `agent-rules-editor` and `architecture-docs` `files` field type from `string[]` to `file-list`
- [ ] Create `WorkspacePropFields.vue` with props `{ fields: PropField[]; values: Record<string, unknown>; skills?: string[] }` and emit `update:prop` with `{ key: string; value: unknown }`
- [ ] Move all existing field renderers from `WorkspaceDesigner.vue` into `WorkspacePropFields` (string, boolean, select, string[], skills, langflow-flow)
- [ ] Add `file-list` UI: rows with path + label inputs, remove button, "Add file" button; value is `Array<{ path: string; label: string }>`
- [ ] Tests: mount `WorkspacePropFields` with a `file-list` field; verify existing rows render path/label; add row; edit; remove; emitted values are correct objects not `[object Object]`

Run: `cd desktop && pnpm test tests/components/WorkspacePropFields.test.ts`

---

### Task 2: Integrate `WorkspacePropFields` into Designer (Phase B)

**Files:**
- Modify: `desktop/src/components/workflow/WorkspaceDesigner.vue`
- Modify: `desktop/tests/components/WorkspaceDesigner.test.ts`

- [ ] Replace inline prop form in `WorkspaceDesigner` with `<WorkspacePropFields>` bound to `selectedComponent.props`
- [ ] Remove duplicated helpers now owned by `WorkspacePropFields` (`propStringArrayValue`, `onStringArrayInput`, `toggleSkillProp`, `skillSelected`, `fieldValue`) from Designer
- [ ] On `@update:prop`, call existing `updateSelectedProp(key, value)`
- [ ] Extend `WorkspaceDesigner.test.ts`: mock registry entry with `file-list` field; add component; assert path/label inputs visible (not `[object Object]`); save preserves object shape

Run: `cd desktop && pnpm test tests/components/WorkspaceDesigner.test.ts`

---

### Task 3: Shared bind helper + Preview column (Phase A)

**Files:**
- Create: `desktop/src/workspace/widgetBindProps.ts`
- Modify: `desktop/src/workspace/WorkflowPanelRenderer.vue`
- Modify: `desktop/src/components/workflow/WorkspaceDesigner.vue`
- Modify: `desktop/src/pages/WorkflowRun.vue`

- [ ] Create `bindWidgetProps(comp, api, runtime?)` exporting logic equivalent to `WorkflowPanelRenderer.bindProps` / `componentProps` for `agent-run`
- [ ] Refactor `WorkflowPanelRenderer` to use `bindWidgetProps`
- [ ] Add optional `panelApi: PanelApi` prop to `WorkspaceDesigner`
- [ ] Pass `:panel-api="panelApi"` from `WorkflowRun.vue`
- [ ] Expand modal to `w-[95vw] max-w-7xl`
- [ ] Add fourth column **Preview** (~40% width): lazy-load widget via `WIDGET_COMPONENTS`; `:key` includes component id + JSON.stringify(props) for remount on prop change
- [ ] Runtime-only types: `agent-run` and `langflow-panel` show placeholder text per spec (no widget mount)
- [ ] Empty state: "Select a component to preview."
- [ ] Unknown type: red banner like renderer

Run: `cd desktop && pnpm test`

---

### Task 4: Preview tests + spec approval

**Files:**
- Modify: `desktop/tests/components/WorkspaceDesigner.test.ts`
- Modify: `docs/superpowers/specs/2026-06-19-workspace-designer-preview-design.md`

- [ ] Test: select `agent-run` component → `[data-testid="preview-runtime-placeholder"]` visible
- [ ] Test: select content widget type (e.g. `code-explorer`) with mock `panelApi` → preview section mounts widget (check for widget-specific testid or root element)
- [ ] Test: changing a prop updates preview key (widget remounts — can assert via stub component or key attribute)
- [ ] Update spec **Status** to `Approved — 2026-06-19`
- [ ] Full suite: `cd desktop && pnpm test`
