# be-dev Workspace & Mermaid Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend desktop `be-dev` workflow step with layered architecture, Mermaid dataflow preview, schema summary, topology panel, and backend rules — symmetric with `fe-dev`.

**Architecture:** Reuse existing widgets where possible (`markdown-doc`, `agent-rules-editor`, `code-explorer`); add `be-architecture-plan`, `schema-migrations`, `topology-panel`; enhance `MarkdownPreview` with Mermaid rendering.

**Tech Stack:** Vue 3, Electron, Vitest, marked, mermaid, existing TopologyCanvas components.

**Spec:** `docs/superpowers/specs/2026-06-20-be-dev-workspace-mermaid-design.md`

---

### Task 1: Mermaid Markdown Preview

**Files:**
- Modify: `desktop/package.json` (add `mermaid`)
- Create: `desktop/src/utils/mermaidMarkdown.ts`
- Modify: `desktop/src/components/workflow/MarkdownPreview.vue`
- Create: `desktop/tests/components/MarkdownPreview.test.ts`

- [ ] Add `mermaid` dependency
- [ ] Utility: transform markdown HTML, replace mermaid fences with `.mermaid` divs
- [ ] MarkdownPreview: init mermaid, run on content change, error fallback
- [ ] Tests: mermaid block extraction; mount with mocked `mermaid.run`

### Task 2: be-architecture-plan Widget

**Files:**
- Create: `desktop/src/workspace/widgets/BeArchitecturePlanWidget.vue`
- Modify: `desktop/src/workspace/registryComponents.ts`
- Modify: `desktop/shared/workspaceRegistryData.ts`
- Modify: `desktop/electron/workflow/workspaceSchema.ts`
- Modify: `desktop/tests/workspace/feWidgets.test.ts` (add be widget tests)

- [ ] Copy FeArchitecturePlanWidget pattern; title "Backend Architecture Plan"
- [ ] Register widget type `be-architecture-plan`
- [ ] Schema + registry entry

### Task 3: be-dev Workspace Config (P0 tabs)

**Files:**
- Modify: `desktop/.agentflow/workspaces/be-dev.workspace.json`
- Modify: `desktop/templates/default-dev-cicd/workspaces/be-dev.workspace.json` (if exists)
- Modify: `desktop/src/workspace/widgets/MarkdownDocWidget.vue`
- Modify: `desktop/electron/workflow/workspaceSchema.ts` (markdown-doc file-list props)
- Create: `desktop/templates/default-dev-cicd/docs/be-dataflow.md` (seed template)

- [ ] Extend MarkdownDocWidget to support `mode: file-list` + `files` props
- [ ] Update be-dev.workspace.json with tabs (arch, dataflow, rules, code for P0)
- [ ] Seed be-dataflow.md with sequenceDiagram template

### Task 4: schema-migrations Widget

**Files:**
- Create: `desktop/src/utils/parseSqlMigrations.ts`
- Create: `desktop/src/workspace/widgets/SchemaMigrationsWidget.vue`
- Modify: registry + schema + registryData
- Create: `desktop/tests/utils/parseSqlMigrations.test.ts`
- Modify: `desktop/tests/workspace/feWidgets.test.ts`

- [ ] Parse CREATE TABLE from SQL files (regex)
- [ ] Generate docs/be-schema.md summary with erDiagram mermaid
- [ ] Read-only UI: file list + regenerate button

### Task 5: topology-panel Widget

**Files:**
- Create: `desktop/src/workspace/widgets/TopologyPanelWidget.vue`
- Modify: registry + schema + registryData
- Modify: `desktop/.agentflow/topology.yaml`, `desktop/.agentflow/resources.yaml`
- Modify: `desktop/.agentflow/workspaces/be-dev.workspace.json` (add schema + topology tabs)

- [ ] Embed TopologyGraph + save via useTopologyOps (compact workspace tab)
- [ ] Seed postgres topology + fix resources.yaml

### Task 6: Prompt & Integration

**Files:**
- Modify: `desktop/templates/default-dev-cicd/prompts/be-dev.md`
- Run: `cd desktop && pnpm test`

- [ ] Update be-dev prompt with doc references
- [ ] Full test suite passes
