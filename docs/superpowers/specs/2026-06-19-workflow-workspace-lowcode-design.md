# Workflow Step Workspace Low-Code — Design Spec

**Status:** Approved — 2026-06-19

**Builds on:**

- [2026-06-16 Desktop Dev→CI/CD Workflow](./2026-06-16-desktop-dev-cicd-workflow-design.md) — project execution pipeline, Workflow Run UI
- [2026-06-19 Topology Canvas & Ops](./2026-06-19-topology-canvas-ops-design.md) — parallel pattern: workspace-local config + agent tools

## 1. Purpose

Replace hardcoded workflow step panels (`STEP_PANEL_MAP` in `useWorkflow.ts`) with a **low-code, per-step workspace** that any project execution workflow can configure independently.

**User goals (confirmed):**

1. **Project Execution Workflow** (prd → fe-dev → cicd) is **not** an LLM agent graph; it describes human/agent-assisted **project phases**.
2. **Langflow** remains for **agent orchestration** (Chat, tool chains); a Langflow flow may be **referenced** as a step executor or workspace widget — it does **not** define the project pipeline.
3. Each workflow **step** has a configurable **run workspace** assembled from registered UI widgets (tabs/stack layout).
4. **`fe-dev`** is the pilot default template: layered FE architecture, component splitting (skills), style tokens (UnoCSS/Tailwind-like), code explorer — not special-cased in code.
5. **Three channels** edit the same workspace JSON: Workspace Designer (visual), Chat (`workspace_*` tools), bundled templates.
6. Chat can **generate and modify** workspace components (registry types only in v1; no arbitrary Vue codegen).

**Not in scope (v1):**

- Free-form canvas layout (pixel grid); v1 uses ordered list + `tabs` | `stack`
- Chat generating new widget Vue components at runtime
- Replacing Langflow Editor; it stays for agent flow design
- Langflow compile → `workflow.yaml` as the default pipeline path (deprecated, kept for migration)
- `live-preview` widget (v1.1 follow-up)
- Resource Server involvement in workspace config

## 2. Two-Layer Model

```text
┌─────────────────────────────────────────────────────────────┐
│  Layer 1 — Project Execution Workflow                        │
│  Dev pipeline phases: prd → architecture → fe-dev → cicd …   │
│  Config: workflow.yaml (steps, edges, gates, executor)      │
│  Run UI: Workflow Run + Step Workspace (low-code widgets)   │
└───────────────────────────┬─────────────────────────────────┘
                            │ step may reference
┌───────────────────────────▼─────────────────────────────────┐
│  Layer 2 — Langflow Agent Flow                               │
│  Agent orchestration for Chat and in-step agent panels       │
│  Config: .agentflow/langflow/flows/*.json                   │
│  Run: Langflow runtime / Chat SSE                            │
└─────────────────────────────────────────────────────────────┘
```

| Concept | Is | Is not |
|---------|-----|--------|
| Project Workflow | Project execution stages | Langflow LLM node graph |
| Langflow Flow | Agent orchestration (chat, tools, sub-agents) | Entire dev pipeline definition |
| Step Workspace | Per-step run panel layout (low-code widgets) | Workflow topology |

**Langflow integration (three modes, may coexist):**

1. **Step executor** — `workflow.yaml`: `executor: langflow`, `langflow_flow_id: <id>`
2. **Workspace widget** — `type: langflow-panel`, `props: { flowId, mode: run }`
3. **Chat standalone** — existing Chat page uses Langflow flows without binding to a project step

**Migration from today:** Stop treating Langflow compile → `workflow.yaml` as the primary pipeline authoring path. `POST /v1/workflow/compile` remains but is **deprecated**; project workflows are authored via YAML/templates/Designer; Langflow flows live under `langflow/flows/`.

## 3. File Layout

```text
my-project/
├── .agentflow/
│   ├── workflow.yaml                    # legacy single workflow (optional)
│   ├── workflows/
│   │   └── default-dev-cicd/
│   │       ├── workflow.yaml            # project execution: steps, edges, gates
│   │       └── workspaces/
│   │           ├── fe-dev.workspace.json
│   │           ├── prd.workspace.json
│   │           └── ...
│   ├── langflow/
│   │   ├── flows/
│   │   │   ├── chat-default.json
│   │   │   └── fe-component-split.json
│   │   └── langflow.json                # active flow metadata
│   └── state.json
├── fe/
└── docs/
```

| File | Describes |
|------|-----------|
| `workflow.yaml` | Workflow topology + step metadata (executor, skills, gates, outputs) |
| `workspaces/{stepId}.workspace.json` | Step run UI: layout + component list + props |
| `langflow/flows/*.json` | Agent graphs; referenced by executor or `langflow-panel` widget |

**Legacy path:** `.agentflow/workspaces/{stepId}.workspace.json` when using legacy `.agentflow/workflow.yaml` (`isLegacy: true`).

## 4. Workspace Schema (v1)

```json
{
  "version": 1,
  "stepId": "fe-dev",
  "layout": "tabs",
  "components": [
    {
      "id": "arch",
      "type": "fe-architecture-plan",
      "label": "分层架构",
      "props": {
        "output": "docs/fe-architecture.md",
        "layers": ["pages", "components", "composables", "stores", "api"]
      }
    },
    {
      "id": "split",
      "type": "component-splitter",
      "label": "组件拆分",
      "props": {
        "output": "docs/fe-components.md",
        "skills": ["frontend-design"],
        "editable": true
      }
    },
    {
      "id": "style",
      "type": "style-tokens-editor",
      "label": "基础样式",
      "props": {
        "preset": "unocss",
        "target": "fe/uno.config.ts",
        "themeFile": "fe/app/assets/theme.json"
      }
    },
    {
      "id": "code",
      "type": "code-explorer",
      "label": "代码",
      "props": { "root": "fe", "writable": false }
    }
  ]
}
```

| Field | Type | Notes |
|-------|------|-------|
| `version` | `1` | Schema version |
| `stepId` | string | Must match parent step id |
| `layout` | `tabs` \| `stack` | v1 implements both; `grid` deferred |
| `components` | array | Ordered; each tab/stack slot |
| `components[].id` | string | Unique within workspace |
| `components[].type` | string | Registry type key |
| `components[].label` | string? | Tab title / section heading |
| `components[].props` | object | Validated per type |

Validation: Zod `WorkspaceSchema` + per-type `COMPONENT_PROPS[type]` in `electron/workflow/workspaceSchema.ts`. Invalid props → HTTP 400 with field errors.

## 5. Component Registry (v1)

Desktop ships a built-in registry. Each entry: `type`, `label`, `description`, `category`, `defaultProps`, `propsFields` (for Designer forms).

| type | Source / notes | Purpose |
|------|----------------|---------|
| `markdown-doc` | `WorkflowMarkdownPanel` | Single doc edit/preview |
| `architecture-docs` | `WorkflowArchitecturePanel` | Multi architecture doc tabs |
| `code-explorer` | `WorkflowCodeExplorer` | File tree + view/edit |
| `agent-run` | `WorkflowAgentRunPanel` | Gates, phase, run status |
| `cicd-config` | `WorkflowCicdPanel` | Deploy + ops summary |
| `langflow-panel` | new | Embed Langflow flow (`flowId`, `mode: run`) |
| `fe-architecture-plan` | new | FE layered architecture planner |
| `component-splitter` | new | Component tree + skill load / manual edit |
| `style-tokens-editor` | new | UnoCSS/Tailwind-like token editor |
| `live-preview` | new (v1.1) | Dev server WebView |

**New widget props (summary):**

- `fe-architecture-plan`: `output`, `layers[]`
- `component-splitter`: `output`, `skills[]`, `editable`
- `style-tokens-editor`: `preset` (`unocss` \| `tailwind`), `target`, `themeFile?`
- `langflow-panel`: `flowId`, `mode` (`run` only in v1)

Registry exposed to Designer via `GET /v1/workspace/registry`. Renderer maps `type` → Vue component via `WIDGET_COMPONENTS` lazy imports.

## 6. Runtime Rendering

```text
WorkflowRun.vue
  └─ resolveWorkspace(workflowId, stepId)
       ├─ workspaces/*.workspace.json found → WorkflowPanelRenderer
       └─ missing → LEGACY_PANEL_MAP fallback (bundled defaults mimicking STEP_PANEL_MAP)
```

`WorkflowPanelRenderer.vue`:

- Reads `layout` → tab bar or vertical stack
- For each component → `<component :is="WIDGET_COMPONENTS[type]" v-bind="props" :api="panelApi" />`
- Subscribes to `workspace:updated` (IPC/event) for hot refresh after Chat or Designer save

Remove hardcoded `stepPanelKind` branching once bundled workspaces ship with `default-dev-cicd` template.

## 7. Workspace Designer (design-time)

New UI entry: Workflow Sidebar — **Design workspace** (alongside Configure workflow), or tab inside config drawer.

```text
┌──────────────── Workspace Designer ──────────────────────────┐
│ Step: [fe-dev ▼]                                              │
├──────────────┬─────────────────────────┬────────────────────┤
│ Component    │ Selected (drag reorder) │ Properties         │
│ library      │ 1. 分层架构  [↑↓ ✕]     │ output: ...        │
│ (registry)   │ 2. 组件拆分  [↑↓ ✕]     │ skills: ...        │
│              │ …                       │                    │
│ double-click │ layout: [tabs ▼]        │ schema-driven form │
│ to add       │                         │                    │
└──────────────┴─────────────────────────┴────────────────────┘
```

v1 interactions:

- Add component from library (double-click or +)
- Reorder via HTML5 drag-and-drop on list items (no new dependencies)
- Edit props via `propsFields` metadata (string, boolean, select, skills multiselect, langflow-flow picker)
- Save → `PUT /v1/workflows/{workflowId}/workspaces/{stepId}`

## 8. Chat-Generated Components

Chat (Step Chat, Free Chat, Chat page) can modify workspace config via agent tools — same JSON as Designer.

### 8.1 Tools (`workspaceTools.ts`)

| Tool | Mutates? | Description |
|------|----------|-------------|
| `workspace_get` | no | Read workspace for workflowId + stepId |
| `workspace_list_registry` | no | List valid component types + prop hints |
| `workspace_add_component` | yes | Add registry component with props |
| `workspace_update_component` | yes | Update label or props by component id |
| `workspace_remove_component` | yes | Remove by id |
| `workspace_reorder` | yes | Set order via id array |
| `workspace_set_layout` | yes | `tabs` or `stack` |

**Context binding:**

- Step Chat: defaults to current `workflowId` + active `stepId`
- Free Chat: requires explicit `stepId` or discovery via `workspace_get`
- Chat page: any step via parameters

### 8.2 Approval gate

Mutating tools require user approval via existing `PlanApprovalCard` pattern (same as ops deploy):

1. Agent proposes change (diff preview: added/removed components, prop changes)
2. User approves
3. Tool writes `*.workspace.json`
4. Renderer hot-refreshes

Read-only tools skip approval.

### 8.3 Agent prompt additions

- Step UI is defined in `workspaces/*.workspace.json`; use `workspace_*` to change layout
- Do not modify `workflow.yaml` step order via workspace tools
- Call `workspace_list_registry` before adding components
- Langflow agent flows use `langflow-panel` or `executor: langflow`; do not compile Langflow into project pipeline

### 8.4 v1 limits

Chat may only add/configure **registry** component types. Chat does **not** generate new Vue widget implementations in v1.

## 9. Default Templates (`default-dev-cicd`)

Bundled under `desktop/templates/default-dev-cicd/workspaces/`:

| stepId | workspace summary |
|--------|-------------------|
| `prd` | `markdown-doc` |
| `architecture` | `architecture-docs` |
| `fe-dev` | `fe-architecture-plan` + `component-splitter` + `style-tokens-editor` + `code-explorer` |
| `be-dev` | `code-explorer` (root: backend) |
| `test`, `review`, `test-2` | `agent-run` |
| `cicd` | `cicd-config` |

`fe-dev` UI/UX sub-capabilities are workspace widgets, not separate pipeline steps. Gates still check `fe/` directory per existing `workflow.yaml`.

## 10. Implementation Modules

```text
desktop/
├── electron/
│   ├── workflow/
│   │   ├── workspaceSchema.ts      # Zod schemas
│   │   └── workspaceLoader.ts      # read/write/list paths
│   ├── agent/
│   │   ├── workspaceTools.ts         # LangChain tools
│   │   └── server.ts                 # + workspace API routes
├── src/
│   ├── workspace/
│   │   ├── registry.ts
│   │   ├── registryComponents.ts
│   │   ├── WorkflowPanelRenderer.vue
│   │   └── widgets/                  # new FE widgets + wrappers
│   ├── components/workflow/
│   │   └── WorkspaceDesigner.vue
│   └── composables/
│       └── useWorkspaceConfig.ts
└── templates/default-dev-cicd/workspaces/
```

No heavy low-code engine (Formily, etc.). Pattern: **JSON schema + registry + list-based Designer**.

## 11. API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/workflows/{workflowId}/workspaces/{stepId}` | Load workspace; 404 if missing |
| PUT | `/v1/workflows/{workflowId}/workspaces/{stepId}` | Validate + save |
| GET | `/v1/workspace/registry` | Component library metadata |
| GET | `/v1/workflows/{workflowId}/workspaces` | List step ids with workspace files |

Legacy workflow: `workflowId` may be omitted or resolved from active/legacy id; loader uses `.agentflow/workspaces/` path.

## 12. Error Handling

| Case | Behavior |
|------|----------|
| No workspace file | Fallback to `LEGACY_PANEL_MAP` bundled JSON |
| Unknown `type` in JSON | Renderer shows inline error for that slot; other components render |
| Invalid props on save | 400 + Zod errors; Designer/Chat shows field errors |
| Langflow flow missing for `langflow-panel` | Widget shows "Flow not found" + link to Langflow Editor |
| Concurrent edit (Designer + Chat) | Last write wins; optional file watcher refresh |

## 13. Testing

| Area | Tests |
|------|-------|
| `workspaceSchema.ts` | Valid/invalid JSON, per-type props |
| `workspaceLoader.ts` | Legacy vs `workflows/{id}/workspaces/` paths |
| `workspaceTools.ts` | Tool mutations, approval payload |
| `WorkflowPanelRenderer.vue` | tabs/stack, unknown type degradation |
| `WorkspaceDesigner.vue` | add, reorder, save payload |
| API routes | GET/PUT round-trip via agent server |
| `WorkflowRun.vue` | workspace path vs fallback |

Run: `cd desktop && pnpm test`

## 14. Implementation Order

1. Schema + loader + API routes
2. Registry + `WorkflowPanelRenderer` + legacy fallback
3. Wrap existing panels as widgets
4. `WorkspaceDesigner` UI
5. FE widgets: `fe-architecture-plan`, `component-splitter`, `style-tokens-editor`
6. Bundled `workspaces/*.json` + remove `STEP_PANEL_MAP` hardcoding
7. `workspaceTools.ts` + Chat approval integration
8. Langflow decouple (flows dir, deprecate compile-as-pipeline)
9. `live-preview` widget (v1.1)

## 15. Success Criteria (v1)

- [x] Any workflow step run panel driven by `*.workspace.json` when present
- [x] Workspace Designer can add/reorder/configure registry components and save
- [x] Chat can add/configure components via `workspace_*` tools with approval
- [x] `fe-dev` default template includes architecture + splitter + style + code widgets
- [x] Langflow flows referenced as `langflow-panel` or executor, not as pipeline compile source
- [x] Existing workflows without workspace files still work via fallback
- [x] `cd desktop && pnpm test` passes
