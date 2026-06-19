# Workflow Step Workspace Low-Code — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans.

**Goal:** Replace hardcoded `STEP_PANEL_MAP` with per-step low-code workspace JSON, Workspace Designer, Chat `workspace_*` tools, and `fe-dev` default template (architecture + component splitter + style tokens + code explorer).

**Architecture:** Zod-validated `*.workspace.json` under `.agentflow/workflows/{id}/workspaces/`; `WorkflowPanelRenderer` + component registry; Designer list UI; agent tools mirror topology pattern. Langflow stays agent-only; compile-to-pipeline deprecated.

**Spec:** `docs/superpowers/specs/2026-06-19-workflow-workspace-lowcode-design.md`

**Tech stack:** Desktop only (`desktop/`). Vue 3 + UnoCSS + Zod. No new npm dependencies for drag-reorder (HTML5 DnD). Tests: `cd desktop && pnpm test`.

**Do not auto-commit** unless the user explicitly requests commits.

---

### Task 1: Workspace schema + loader

**Files:**
- Create: `desktop/electron/workflow/workspaceSchema.ts`
- Create: `desktop/electron/workflow/workspaceLoader.ts`
- Create: `desktop/tests/workflow/workspaceSchema.test.ts`
- Create: `desktop/tests/workflow/workspaceLoader.test.ts`

- [ ] Zod `WorkspaceSchema` (`version`, `stepId`, `layout`, `components[]`)
- [ ] Per-type `COMPONENT_PROPS` for v1 types (at minimum: `code-explorer`, `markdown-doc`, `agent-run`, `cicd-config`, `fe-architecture-plan`, `component-splitter`, `style-tokens-editor`, `langflow-panel`, `architecture-docs`)
- [ ] `validateWorkspace(def)` runs base + per-component props validation
- [ ] `workspaceLoader`: `workspacePath(projectRoot, workflowId, stepId, isLegacy)`, `loadWorkspace`, `saveWorkspace`, `listWorkspaces`
- [ ] Legacy path: `.agentflow/workspaces/{stepId}.workspace.json`
- [ ] Modern path: `.agentflow/workflows/{workflowId}/workspaces/{stepId}.workspace.json`
- [ ] Tests for valid/invalid JSON and both path layouts (use `fs.mkdtemp`)

---

### Task 2: Workspace API routes

**Files:**
- Modify: `desktop/electron/agent/server.ts`
- Create: `desktop/tests/workflow/workspaceRoutes.test.ts` (or extend agent server tests)

- [ ] `GET /v1/workspace/registry` — return static registry metadata JSON (mirror `src/workspace/registry.ts` or import shared shape from electron)
- [ ] `GET /v1/workflows/{workflowId}/workspaces/{stepId}` — load; 404 if missing
- [ ] `PUT /v1/workflows/{workflowId}/workspaces/{stepId}` — validate + save; 400 on Zod errors
- [ ] `GET /v1/workflows/{workflowId}/workspaces` — list step ids with workspace files
- [ ] Resolve `workflowId` for legacy workflows (`isLegacy` from loader list)
- [ ] Tests via HTTP handler or route helpers

---

### Task 3: Registry + PanelRenderer + legacy fallback

**Files:**
- Create: `desktop/src/workspace/registry.ts`
- Create: `desktop/src/workspace/registryComponents.ts`
- Create: `desktop/src/workspace/WorkflowPanelRenderer.vue`
- Create: `desktop/src/workspace/legacyWorkspaces.ts` (bundled JSON mimicking STEP_PANEL_MAP)
- Create: `desktop/tests/workspace/WorkflowPanelRenderer.test.ts`
- Create: `desktop/src/composables/useWorkspaceConfig.ts`

- [ ] `WORKSPACE_REGISTRY` with `propsFields` for Designer
- [ ] `WIDGET_COMPONENTS` lazy map (stubs OK for new widgets until Task 8)
- [ ] `WorkflowPanelRenderer`: `tabs` and `stack` layouts; unknown type shows inline error
- [ ] `useWorkspaceConfig`: `fetchWorkspace`, `saveWorkspace`, `fetchRegistry`, `listWorkspaces`
- [ ] `legacyWorkspaces` keyed by stepId for fallback
- [ ] Component tests for tab switching and stack layout

---

### Task 4: Widget wrappers + WorkflowRun integration

**Files:**
- Create: `desktop/src/workspace/widgets/` wrappers as needed
- Modify: `desktop/src/pages/WorkflowRun.vue`
- Modify: `desktop/tests/pages/WorkflowRun.test.ts`

- [ ] Wrap existing panels: `MarkdownDocWidget`, `ArchitectureDocsWidget`, `CodeExplorerWidget`, `AgentRunWidget`, `CicdConfigWidget` — pass `api` + props from workspace JSON
- [ ] `WorkflowRun`: on step change, `fetchWorkspace(workflowId, stepId)`; render `WorkflowPanelRenderer` when found, else legacy fallback, else existing `stepPanelKind` as last resort
- [ ] Update WorkflowRun tests

---

### Task 5: Workspace Designer UI

**Files:**
- Create: `desktop/src/components/workflow/WorkspaceDesigner.vue`
- Modify: `desktop/src/components/workflow/WorkflowSidebar.vue` (or WorkflowRun header)
- Create: `desktop/tests/components/WorkspaceDesigner.test.ts`

- [ ] Step selector dropdown
- [ ] Component library from registry (grouped by category)
- [ ] Selected list with HTML5 drag reorder, remove, up/down buttons
- [ ] Schema-driven props form from `propsFields`
- [ ] Layout selector (`tabs` | `stack`)
- [ ] Save via `useWorkspaceConfig.saveWorkspace`
- [ ] Entry: "Design workspace" button in Workflow UI
- [ ] Tests: add component, reorder, save payload

---

### Task 6: FE workspace widgets

**Files:**
- Create: `desktop/src/workspace/widgets/FeArchitecturePlanWidget.vue`
- Create: `desktop/src/workspace/widgets/ComponentSplitterWidget.vue`
- Create: `desktop/src/workspace/widgets/StyleTokensEditorWidget.vue`
- Create: `desktop/src/workspace/widgets/LangflowPanelWidget.vue` (stub: message + flowId if flow missing)
- Register in `registryComponents.ts`

- [ ] `fe-architecture-plan`: layers checklist + markdown editor; read/write `props.output` via panel api
- [ ] `component-splitter`: tree/list UI; "Load from skill" uses skills list; writes `props.output`
- [ ] `style-tokens-editor`: form for colors/spacing; writes `props.target` or `themeFile` (minimal v1: JSON sidecar + optional uno.config patch)
- [ ] `langflow-panel`: embed or link to Langflow WebView when flow exists

---

### Task 7: Bundled templates + init copy

**Files:**
- Create: `desktop/templates/default-dev-cicd/workspaces/*.workspace.json` (prd, architecture, fe-dev, be-dev, test, review, test-2, cicd)
- Modify: `desktop/electron/workflow/loader.ts` (or project init) to copy workspaces dir when creating from template

- [ ] `fe-dev.workspace.json` per spec §9 (4 components)
- [ ] Other steps per spec table
- [ ] `createFromTemplate` / `initProject` copies `workspaces/` alongside `workflow.yaml`
- [ ] Remove or deprecate `STEP_PANEL_MAP` in `useWorkflow.ts` once fallback exists

---

### Task 8: Chat workspace tools

**Files:**
- Create: `desktop/electron/agent/workspaceTools.ts`
- Modify: `desktop/electron/agent/tools.ts`
- Modify: `desktop/electron/agent/prompt.ts`
- Create: `desktop/tests/agent/workspaceTools.test.ts`

- [ ] Tools: `workspace_get`, `workspace_list_registry`, `workspace_add_component`, `workspace_update_component`, `workspace_remove_component`, `workspace_reorder`, `workspace_set_layout`
- [ ] Mutating tools write via `workspaceLoader.saveWorkspace` (approval UI integration: document in tool responses; full PlanApprovalCard wiring if existing ops pattern allows)
- [ ] Wire into `buildDesktopLangChainTools` / read-only variants
- [ ] Prompt additions per spec §8.3
- [ ] Tests for tool mutations

---

### Task 9: Langflow decouple (minimal v1)

**Files:**
- Modify: `desktop/src/pages/LangflowEditor.vue` (save messaging)
- Modify: `desktop/electron/agent/server.ts` (`/v1/workflow/compile` response adds deprecation note)
- Optional: `desktop/electron/langflow/service.ts` — save flows to `.agentflow/langflow/flows/`

- [ ] Langflow Editor no longer claims primary pipeline authoring
- [ ] `POST /v1/workflow/compile` still works; response/header notes deprecated
- [ ] Document flows directory in README or spec cross-ref (no full migration required in v1)

---

### Task 10: Verification + spec sign-off

- [ ] `cd desktop && pnpm test` passes
- [ ] Update spec status to Approved and check success criteria §15
- [ ] Manual smoke: Workflow Run loads fe-dev tabs from workspace JSON
