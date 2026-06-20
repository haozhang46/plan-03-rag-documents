# Workspace Designer — Props Fix & Live Preview — Design Spec

**Status:** Approved — 2026-06-19

**Builds on:**

- [2026-06-19 Workflow Step Workspace Low-Code](./2026-06-19-workflow-workspace-lowcode-design.md) — Workspace Designer v1 (layout + schema props only)

## 1. Purpose

Enhance **Workspace Designer** so users can:

1. **Correctly edit component props** — especially structured fields like `files: { path, label }[]` that currently render as `[object Object]` and corrupt on save.
2. **Edit widget content in-place** — mount the selected registry widget in a **Preview** column with the same `panelApi` used at run time, so markdown, style tokens, and code can be edited without leaving Designer.

**User goal (confirmed):** Option **C** — fix Properties panel first (**Phase B**), then add live Preview (**Phase A**).

**Not in scope:**

- Changing widget internal UI implementations
- Full agent execution inside Designer (`agent-run`, `langflow-panel` show placeholders in Preview v1)
- New npm dependencies (Headless UI, Formily, etc.)
- Replacing Run view — Designer becomes a second entry point for content editing, not a replacement
- Full-workspace Preview (tabs/stack layout simulation) — v1 previews **selected component only**

## 2. Problem Statement

### 2.1 Properties panel gaps

| Component | Prop | Registry type today | Actual shape | Symptom |
|-----------|------|---------------------|--------------|---------|
| `agent-rules-editor` | `files` | `string[]` | `{ path, label }[]` | Shows `[object Object]`; save corrupts data |
| `architecture-docs` | `files` | `string[]` | `{ path, label }[]` | Same |

Zod validation in `workspaceSchema.ts` already expects `{ path, label }[]` for both types.

### 2.2 No content editing in Designer

Designer v1 only edits workspace JSON (layout, component list, props metadata). Widgets that read/write project files (`AgentRulesEditorWidget`, `StyleTokensEditorWidget`, `FeArchitecturePlanWidget`, etc.) are **not mounted** in Designer. Users must close Designer and use Workflow Run tabs to edit content — confusing when configuring `fe-dev` workspace.

## 3. Approach

**Phased delivery (recommended):**

| Phase | Deliverable | User-visible outcome |
|-------|-------------|----------------------|
| **B** | `file-list` prop type + `WorkspacePropFields.vue` extract | Files props editable; no `[object Object]` |
| **A** | Preview column + `panelApi` wiring | Selected widget live in Designer |

Alternative approaches considered:

- **Single PR (layout + preview together)** — rejected as higher review risk; phases are independently testable.
- **Bottom split with full `WorkflowPanelRenderer`** — rejected; hard to focus on selected component; excessive vertical space in modal.

## 4. Phase B — Properties Panel

### 4.1 New prop field type: `file-list`

Add to `PropFieldType` in `desktop/shared/workspaceRegistryData.ts`:

```ts
| "file-list"
```

**Form UI:** repeatable rows, each with:

- `path` — text input (required)
- `label` — text input (required)
- Remove row button

Footer: **Add file** button appends `{ path: "", label: "" }`.

**Value shape:** `Array<{ path: string; label: string }>` — matches existing Zod schemas.

### 4.2 Registry updates

| Component | Field | New type |
|-----------|-------|----------|
| `agent-rules-editor` | `files` | `file-list` |
| `architecture-docs` | `files` | `file-list` |

No schema changes in `workspaceSchema.ts` — already correct.

### 4.3 Extract `WorkspacePropFields.vue`

Move prop form rendering from `WorkspaceDesigner.vue` into:

`desktop/src/components/workflow/WorkspacePropFields.vue`

**Props:**

```ts
{
  fields: PropField[];
  values: Record<string, unknown>;
  skills?: string[];
}
```

**Emits:** `update:values` with `{ key, value }` or full props patch.

Supports existing types: `string`, `boolean`, `select`, `string[]`, `skills`, `langflow-flow`, plus new `file-list`.

### 4.4 Designer integration

`WorkspaceDesigner` keeps:

- Component library, selected list, reorder, save
- Label field + `<WorkspacePropFields>` for registry `propsFields`

## 5. Phase A — Live Preview Column

### 5.1 Layout

Expand Designer modal from `max-w-5xl` to `max-w-7xl` (or `w-[95vw] max-w-7xl`).

```text
┌─ Design workspace ───────────────────────────────────────────────────┐
│ Step [fe-dev ▼]  Layout [tabs ▼]                                 [×] │
├──────────┬──────────────┬─────────────┬──────────────────────────────┤
│ Library  │ Selected     │ Properties  │ Preview                      │
│ ~w-52    │ flex-1       │ ~w-64       │ ~40% min-w-0                 │
│          │ drag reorder │ schema form │ live widget                  │
└──────────┴──────────────┴─────────────┴──────────────────────────────┘
```

Empty states:

- No component selected → Properties: "Select a component." / Preview: "Select a component to preview."
- Unknown widget type → Preview: error banner (same as `WorkflowPanelRenderer`)

### 5.2 Widget mounting

Reuse existing registry loader:

- `WIDGET_COMPONENTS` from `desktop/src/workspace/registryComponents.ts`
- `isRegisteredWidgetType(type)`

Bind props identically to `WorkflowPanelRenderer.bindProps()`:

```ts
{ api: panelApi, ...component.props }
```

Extract shared bind logic to `desktop/src/workspace/widgetBindProps.ts` (or inline helper used by both Renderer and Designer) to avoid drift.

### 5.3 `panelApi` injection

`WorkflowRun.vue` passes existing `panelApi` to `WorkspaceDesigner`:

```vue
<WorkspaceDesigner
  :panel-api="panelApi"
  ...
/>
```

Designer does **not** construct its own API — same `readWorkspaceFile` / `writeWorkspaceFile` as Run view.

### 5.4 Preview refresh on prop change

When selected component props change, remount Preview widget:

```vue
<component
  :is="resolvedWidget"
  :key="previewKey"
  v-bind="previewBindProps"
/>
```

`previewKey` derived from `selectedComponentId` + stable serialization of `props` (or increment counter on prop emit).

### 5.5 Runtime-only widgets

| Type | Preview behavior (v1) |
|------|------------------------|
| `agent-run` | Placeholder panel: "Runtime widget — configure props here; run step in Workflow Run." |
| `langflow-panel` | Placeholder: "Langflow panel — run in Workflow Run or Chat." |
| All others | Full widget mount with `panelApi` |

`agent-run` requires `stepId`, `status`, `running`, `liveOutput` from run state — not available in Designer; placeholder avoids mock complexity.

### 5.6 Save semantics (unchanged)

- **Save workspace** → `PUT *.workspace.json` (layout + component list + props only)
- **Widget content edits** in Preview → written immediately to project files via `panelApi.writeWorkspaceFile` (widget-owned save buttons), same as Run view
- Closing Designer without Save discards **layout/props draft** only; file writes from Preview persist (same as Run)

## 6. Data Flow

```text
Designer open
  → load workspace JSON for step
  → user selects component
  → Properties edits update in-memory components[]
  → Preview remounts widget with draft props + panelApi
  → user edits AGENTS.md / tokens in Preview → panelApi writes project files
  → user clicks Save → PUT workspace JSON
  → Run view hot-refreshes if same step active (existing onWorkspaceSaved)
```

## 7. Files

| File | Phase | Change |
|------|-------|--------|
| `desktop/shared/workspaceRegistryData.ts` | B | Add `file-list` type; update registry entries |
| `desktop/src/components/workflow/WorkspacePropFields.vue` | B | New — extracted prop form |
| `desktop/src/components/workflow/WorkspaceDesigner.vue` | B+A | Use PropFields; add Preview column; accept `panelApi` |
| `desktop/src/workspace/widgetBindProps.ts` | A | New — shared bind helper (optional if tiny inline) |
| `desktop/src/pages/WorkflowRun.vue` | A | Pass `panelApi` to Designer |
| `desktop/tests/components/WorkspacePropFields.test.ts` | B | New |
| `desktop/tests/components/WorkspaceDesigner.test.ts` | B+A | Extend |

No backend / Electron route changes.

## 8. Testing

**Phase B** (`cd desktop && pnpm test`):

- `file-list`: add row, edit path/label, remove row, emit correct array
- Designer loads `fe-dev` `agent-rules-editor` — files render as path/label inputs, not `[object Object]`
- Save payload preserves `{ path, label }[]` shape

**Phase A**:

- Preview mounts `style-tokens-editor` when selected (mock `panelApi` + fetch registry)
- Props change (e.g. `target`) updates Preview via remount
- `agent-run` selected → placeholder visible, no throw
- Preview + Save workspace — independent behaviors

## 9. Success Criteria

- [ ] `agent-rules-editor` and `architecture-docs` `files` props editable without corruption
- [ ] `WorkspacePropFields` unit-tested for `file-list`
- [ ] Preview column shows live widget for content-editable types (`agent-rules-editor`, `style-tokens-editor`, `code-explorer`, `fe-architecture-plan`, etc.)
- [ ] Runtime-only types show clear placeholder, no crash
- [ ] No new npm dependencies
- [ ] All existing `WorkspaceDesigner` tests pass; new tests added

## 10. Future (out of scope)

- Full workspace Preview (simulate tabs/stack layout in Designer)
- `langflow-panel` embed in Designer
- `agent-run` partial preview with mocked run state
- Designer diff view before save (Chat approval pattern)
