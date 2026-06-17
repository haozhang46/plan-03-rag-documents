# Multi-Workflow Sidebar & Config — Design Spec

**Status:** Approved — 2026-06-17

**Extends:** `docs/superpowers/specs/2026-06-16-desktop-dev-cicd-workflow-design.md`

## 1. Purpose

Extend Agent Flow Desktop **Workflow Run** with:

- **Multiple workflows per project** (configurable pipeline steps each)
- **Global template import** (built-in `desktop/templates/` + user `~/.agentflow/templates/`)
- **2-level left sidebar:** Level 1 = workflow list + config icon; Level 2 = selected workflow's pipeline steps (current step list)
- **Unified config drawer:** workflow metadata + steps editor (drag reorder, add/remove)

**Not in scope (v1):** Langflow as config entry, parallel multi-workflow runs, step custom panel kind UI, template git registry.

## 2. Decisions (brainstorming)

| Dimension | Choice |
|-----------|--------|
| Workflow scope | Project-local multiple + global templates |
| Config icon | Unified drawer (metadata + steps) |
| Run model | Single **active** workflow; states preserved per workflow |
| Sidebar UX | Level 1 select workflow → Level 2 area shows its steps (not nested accordion) |
| Storage | Legacy compat: root `workflow.yaml` + `state.json`; new workflows under `workflows/{id}/` |

## 3. Project Folder Layout

```text
my-project/
├── .agentflow/
│   ├── workflow.yaml              # legacy default (id from yaml)
│   ├── state.json                 # legacy state for that workflow
│   ├── active-workflow.json       # { "workflowId": "default-dev-cicd" }
│   ├── workflows/
│   │   ├── hotfix/
│   │   │   ├── workflow.yaml
│   │   │   └── state.json
│   │   └── docs-only/
│   │       ├── workflow.yaml
│   │       └── state.json
│   ├── phases/
│   │   ├── {workflowId}/{stepId}.md   # new writes
│   │   └── {stepId}.md                # legacy read fallback
│   └── prompts/
```

**Load rules**

1. Enumerate: root `workflow.yaml` (if exists) + each `workflows/*/workflow.yaml`
2. `active-workflow.json` → active id; missing → root yaml id → template fallback
3. Legacy projects: single row in sidebar; behavior unchanged

**Templates**

- Built-in: `desktop/templates/{templateId}/`
- User: `~/.agentflow/templates/{templateId}/`
- Import: copy template → `.agentflow/workflows/{newId}/`; auto-suffix on id conflict

## 4. Sidebar UI

```text
┌─────────────────────────┐
│ WORKFLOWS          [+]  │
├─────────────────────────┤
│ ● Dev to CI/CD    [⚙]   │  ← selected + active badge
│ ○ Hotfix          [⚙]   │
├─────────────────────────┤
│ PIPELINE STEPS          │  ← selected workflow only
│   PRD            Done   │
│ ▶ Backend Dev   Running │
└─────────────────────────┘
```

| Action | Behavior |
|--------|----------|
| Click workflow row | Set `selectedWorkflowId`; refresh level-2 steps |
| Click [⚙] | Open config drawer for that workflow (`stopPropagation`) |
| Click [+] | Template picker → create under `workflows/` |
| Click step | Set `viewingStepId`; main panel + chat follow step |
| Active indicator | Badge/dot on active workflow row |

**Selected ≠ active**

- Header Continue/Skip/Retry applies to **active** workflow only
- When `selectedWorkflowId !== activeWorkflowId`: steps viewable; run/chat **disabled** with hint to activate or switch

## 5. Config Drawer

Right drawer (~480–560px). Sections:

**Metadata:** id (read-only if exists), title, profiles table, resources list, edges table

**Steps editor:** ordered list, drag reorder, add/delete step cards (id, title, executor, skills, prompt_template, outputs, phase_output, advance, gates)

**Footer:** Save | Set as Active | Delete (non-legacy only) | Cancel

Save validates via `WorkflowSchema`. Structural changes with existing state: unknown steps → skipped on next run.

## 6. Backend

**loader.ts extensions**

- `listWorkflows(projectRoot)` → `{ id, title, isLegacy, path }[]`
- `loadWorkflow(projectRoot, workflowId?)` → active or specified
- `getActiveWorkflowId` / `setActiveWorkflowId`
- `saveWorkflow(projectRoot, workflowId, definition)`
- `createWorkflowFromTemplate(projectRoot, templateId, newId?)`
- `deleteWorkflow(projectRoot, workflowId)`
- `listTemplates()` → built-in + user templates

**stateFile.ts:** path per workflow (`state.json` legacy vs `workflows/{id}/state.json`)

**phases.ts:** write `phases/{workflowId}/{stepId}.md`; read with legacy fallback

**workflowService.ts:** runner cache key `` `${workspaceRoot}:${workflowId}` ``; all operations accept optional `workflowId` (default active)

## 7. API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/workflows` | List + mark active |
| GET | `/v1/workflows/templates` | Global templates |
| GET | `/v1/workflows/current?workflowId=` | Definition |
| PUT | `/v1/workflows/:id` | Save yaml |
| POST | `/v1/workflows/from-template` | `{ templateId, newId? }` |
| POST | `/v1/workflows/:id/activate` | Set active |
| DELETE | `/v1/workflows/:id` | Delete non-legacy |
| existing `/v1/workflow/*` | optional `workflowId` query/body | Scope to workflow |

## 8. Frontend

**New components**

- `WorkflowSidebar.vue` — 2-level nav
- `WorkflowTemplatePicker.vue` — [+] dialog
- `WorkflowConfigDrawer.vue` — config panel

**useWorkflow.ts:** `fetchWorkflowList`, `activateWorkflow`, `saveWorkflow`, `createFromTemplate`, `deleteWorkflow`; scoped fetch helpers

## 9. Edge Cases

| Scenario | Behavior |
|----------|----------|
| Legacy-only project | One workflow; no migration required |
| Delete active | Block; activate another first |
| Template id conflict | Suffix `-2`, `-3` |
| Switch active while other has running step | Preserve state; UI disables concurrent run |
| Save edited legacy | Write root `workflow.yaml` |

## 10. Testing

- `loader`: list, active, legacy, template import, save, delete
- `stateFile`: per-workflow paths
- `phases`: workflow-scoped paths + fallback
- API routes in `server.test.ts`
- `WorkflowSidebar` / `WorkflowRun` component tests
