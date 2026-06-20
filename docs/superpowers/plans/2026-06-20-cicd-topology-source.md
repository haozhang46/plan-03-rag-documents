# CI/CD Workspace, Topology Source & FE Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add topology `source`/`dockerfile` mapping with compose export, expand cicd workspace (Scheme C), and add fe-dev dataflow + read-only API context.

**Architecture:** Extend topology node schema in desktop + resource-server; update compose export to use per-service build context; add `cicd-readiness` and `topology-context` widgets; update workspace JSON templates. Topology editing SSOT remains be-dev only.

**Tech Stack:** TypeScript, Vue 3, Python/FastAPI (resource-server), Vitest, pytest, YAML.

**Spec:** `docs/superpowers/specs/2026-06-20-cicd-topology-source-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `desktop/electron/resources/topology.ts` | TS topology types + `source`/`dockerfile` |
| `resource-server/app/models/topology.py` | Python topology Node model |
| `resource-server/app/adapters/compose.py` | export/import with build context |
| `desktop/src/utils/topologySourceDefaults.ts` | id → default source helper |
| `desktop/src/components/topology/TopologyNodeForm.vue` | source/dockerfile form fields |
| `desktop/src/workspace/widgets/TopologyContextWidget.vue` | fe-dev read-only slice |
| `desktop/src/workspace/widgets/CicdReadinessWidget.vue` | cicd gate/file checks |
| `desktop/.agentflow/workspaces/cicd.workspace.json` | 6-tab layout |
| `desktop/.agentflow/workspaces/fe-dev.workspace.json` | +dataflow, +topology-context |
| `desktop/templates/default-dev-cicd/**` | mirror workspace + seed docs |

---

### Task 1: Topology types — `source` and `dockerfile`

**Files:**
- Modify: `desktop/electron/resources/topology.ts`
- Modify: `resource-server/app/models/topology.py`
- Test: `desktop/tests/resources/topology.test.ts`
- Test: `resource-server/tests/test_topology_models.py` (create if missing)

- [ ] **Step 1: Write failing TS test**

Add to `desktop/tests/resources/topology.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import type { TopologyNode } from "../../electron/resources/topology";

describe("TopologyNode source fields", () => {
  it("accepts source and dockerfile on service nodes", () => {
    const node: TopologyNode = {
      id: "api",
      kind: "service",
      source: "backend",
      dockerfile: "Dockerfile",
    };
    expect(node.source).toBe("backend");
  });
});
```

- [ ] **Step 2: Run test**

Run: `cd desktop && pnpm test tests/resources/topology.test.ts`  
Expected: PASS (structural) or add fields first if type errors

- [ ] **Step 3: Extend TS interface**

In `desktop/electron/resources/topology.ts`:

```typescript
export interface TopologyNode {
  id: string;
  kind: "service" | "database" | "cache" | "gateway" | "worker";
  runtime?: string;
  engine?: string;
  image?: string | null;
  source?: string;
  dockerfile?: string;
  ports?: TopologyPort[];
}
```

- [ ] **Step 4: Extend Python model**

In `resource-server/app/models/topology.py`:

```python
class Node(BaseModel):
    id: str
    kind: NodeKind
    runtime: str | None = None
    engine: str | None = None
    image: str | None = None
    source: str | None = None
    dockerfile: str | None = None
    ports: list[PortMapping] = Field(default_factory=list)
```

- [ ] **Step 5: Run tests**

Run: `cd desktop && pnpm test tests/resources/topology.test.ts`  
Run: `cd resource-server && pytest tests/ -v -k topology` (or full suite)

---

### Task 2: Compose export with build context

**Files:**
- Modify: `resource-server/app/adapters/compose.py`
- Test: `resource-server/tests/test_compose_adapter.py`

- [ ] **Step 1: Write failing test**

Add to `resource-server/tests/test_compose_adapter.py`:

```python
def test_export_compose_uses_source_build_context():
    topology = Topology(
        project="demo",
        nodes=[
            Node(id="api", kind="service", source="backend", dockerfile="Dockerfile"),
            Node(id="app-db", kind="database", engine="postgres"),
        ],
        edges=[Edge.model_validate({"from": "api", "to": "app-db", "env": {}})],
        targets=[],
    )
    doc = yaml.safe_load(export_compose(topology))
    assert doc["services"]["api"]["build"] == {
        "context": "backend",
        "dockerfile": "Dockerfile",
    }
    assert "build" not in doc["services"]["app-db"]
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `cd resource-server && pytest tests/test_compose_adapter.py::test_export_compose_uses_source_build_context -v`

- [ ] **Step 3: Implement export**

In `export_compose`, replace generic `build: .`:

```python
        elif node.kind in ("service", "worker") and not node.image:
            if node.source:
                dockerfile = node.dockerfile or "Dockerfile"
                svc["build"] = {"context": node.source, "dockerfile": dockerfile}
            else:
                svc["build"] = "."
```

- [ ] **Step 4: Run test — expect PASS**

Run: `cd resource-server && pytest tests/test_compose_adapter.py -v`

---

### Task 3: Source defaults helper + TopologyNodeForm

**Files:**
- Create: `desktop/src/utils/topologySourceDefaults.ts`
- Modify: `desktop/src/components/topology/TopologyNodeForm.vue`
- Test: `desktop/tests/utils/topologySourceDefaults.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, expect, it } from "vitest";
import { defaultSourceForNodeId } from "../../src/utils/topologySourceDefaults";

describe("defaultSourceForNodeId", () => {
  it("maps api to backend", () => {
    expect(defaultSourceForNodeId("api")).toBe("backend");
  });
  it("maps fe-web to fe", () => {
    expect(defaultSourceForNodeId("fe-web")).toBe("fe");
  });
  it("returns empty for unknown", () => {
    expect(defaultSourceForNodeId("custom-svc")).toBe("");
  });
});
```

- [ ] **Step 2: Implement helper**

```typescript
const SOURCE_BY_ID: Record<string, string> = {
  api: "backend",
  backend: "backend",
  "fe-web": "fe",
  web: "fe",
  fe: "fe",
  desktop: "desktop",
  electron: "desktop",
  nginx: "deploy/nginx",
};

export function defaultSourceForNodeId(id: string): string {
  return SOURCE_BY_ID[id.trim().toLowerCase()] ?? "";
}
```

- [ ] **Step 3: Add form fields**

In `TopologyNodeForm.vue`:
- Add `source` and `dockerfile` refs
- On `id` watch (create mode), set `source` from `defaultSourceForNodeId`
- Show inputs when `kind` is `service`, `worker`, or `gateway`
- Include in `buildNode()` return object

- [ ] **Step 4: Run tests**

Run: `cd desktop && pnpm test tests/utils/topologySourceDefaults.test.ts`

---

### Task 4: Update seed topology + formatTopologyContextForPrompt

**Files:**
- Modify: `desktop/.agentflow/topology.yaml`
- Modify: `desktop/electron/resources/topology.ts` (`formatTopologyContextForPrompt`)
- Test: extend `desktop/tests/resources/topology.test.ts`

- [ ] **Step 1: Add source to seed yaml**

```yaml
  - id: api
    kind: service
    runtime: python
    source: backend
    dockerfile: Dockerfile
```

- [ ] **Step 2: Include source in prompt formatter**

In loop over nodes, append ` [source: backend]` when `node.source` set.

- [ ] **Step 3: Test formatter output**

```typescript
it("formatTopologyContextForPrompt includes source", () => {
  const md = formatTopologyContextForPrompt({
    version: 1,
    project: "x",
    nodes: [{ id: "api", kind: "service", source: "backend" }],
    edges: [],
    targets: [],
  });
  expect(md).toContain("source: backend");
});
```

---

### Task 5: `topology-context` widget (fe-dev)

**Files:**
- Create: `desktop/src/workspace/widgets/TopologyContextWidget.vue`
- Modify: `desktop/src/workspace/registryComponents.ts`
- Modify: `desktop/shared/workspaceRegistryData.ts`
- Modify: `desktop/electron/workflow/workspaceSchema.ts`
- Test: `desktop/tests/workspace/topologyContextWidget.test.ts`

- [ ] **Step 1: Write failing test**

Mount widget with mock api returning topology nodes; expect text contains `api` and `source: backend`.

- [ ] **Step 2: Implement widget**

- Props: `focusNodes?: string[]`, `envKeys?: string[]`
- Call `api.fetchTopology()` + `api.readWorkspaceFile('.agentflow/topology.yaml')` fallback
- Display table: node id | kind | source | dockerfile | env from edges
- Read-only, no save button
- Register as `topology-context`

- [ ] **Step 3: Update fe-dev.workspace.json**

Add tabs for `dataflow` (markdown-doc → `docs/fe-dataflow.md`) and `api-context` (topology-context).

Add template: `desktop/templates/default-dev-cicd/docs/fe-dataflow.md` with Electron→API sequenceDiagram.

- [ ] **Step 4: Run tests**

Run: `cd desktop && pnpm test tests/workspace/topologyContextWidget.test.ts`

---

### Task 6: `cicd-readiness` widget

**Files:**
- Create: `desktop/src/workspace/widgets/CicdReadinessWidget.vue`
- Create: `desktop/src/utils/cicdReadinessChecks.ts`
- Modify: registry + schema
- Test: `desktop/tests/utils/cicdReadinessChecks.test.ts`
- Test: `desktop/tests/workspace/cicdReadinessWidget.test.ts`

- [ ] **Step 1: Write failing pure function tests**

```typescript
import { describe, expect, it } from "vitest";
import { buildReadinessReport } from "../../src/utils/cicdReadinessChecks";

describe("buildReadinessReport", () => {
  it("fails when Dockerfile missing", () => {
    const report = buildReadinessReport({
      files: { dockerfile: false, workflows: true, compose: false },
      topology: { nodes: [{ id: "api", kind: "service", source: "backend" }] },
      sourcesExist: { backend: false },
      gates: [],
    });
    expect(report.items.some((i) => i.id === "dockerfile" && !i.pass)).toBe(true);
  });
});
```

- [ ] **Step 2: Implement `buildReadinessReport`**

Return `{ ready: boolean, items: { id, label, pass, detail? }[] }`.

Checks:
- dockerfile file exists
- workflows dir has yaml
- topology has service node
- each node with source → sourcesExist[source]
- gate results all pass

- [ ] **Step 3: Widget loads data via PanelApi**

`fetchDeploymentConfig`, `fetchTopology`, `fetchGates('cicd')`, `listWorkspace`, `readWorkspaceFile` as needed.

- [ ] **Step 4: Run tests**

Run: `cd desktop && pnpm test tests/utils/cicdReadinessChecks.test.ts tests/workspace/cicdReadinessWidget.test.ts`

---

### Task 7: cicd workspace + templates

**Files:**
- Modify: `desktop/.agentflow/workspaces/cicd.workspace.json`
- Modify: `desktop/templates/default-dev-cicd/workspaces/cicd.workspace.json`
- Create: `desktop/templates/default-dev-cicd/docs/cicd-pipeline.md`
- Create: `desktop/templates/default-dev-cicd/docs/fe-dataflow.md`
- Modify: `desktop/templates/default-dev-cicd/prompts/cicd.md`
- Test: `desktop/tests/workflow/workspaceSchema.test.ts`

- [ ] **Step 1: cicd.workspace.json tabs**

```json
{
  "layout": "tabs",
  "components": [
    { "id": "pipeline", "type": "markdown-doc", "label": "部署流水线", "props": { "mode": "file-list", "files": [{ "path": "docs/cicd-pipeline.md", "label": "Pipeline" }] } },
    { "id": "dockerfile", "type": "markdown-doc", "label": "Dockerfile", "props": { "mode": "file-list", "files": [{ "path": "Dockerfile", "label": "Dockerfile" }] } },
    { "id": "workflows", "type": "markdown-doc", "label": "GitHub Actions", "props": { "docsDir": ".github/workflows" } },
    { "id": "compose", "type": "markdown-doc", "label": "Compose", "props": { "mode": "file-list", "files": [{ "path": "docker-compose.yml", "label": "docker-compose.yml" }] } },
    { "id": "readiness", "type": "cicd-readiness", "label": "就绪检查", "props": { "gatesStepId": "cicd" } },
    { "id": "deploy", "type": "cicd-config", "label": "部署概览", "props": {} }
  ]
}
```

- [ ] **Step 2: Seed cicd-pipeline.md** with Mermaid flowchart template

- [ ] **Step 3: Update cicd.md prompt** per spec §6

- [ ] **Step 4: Extend workspaceSchema** for `cicd-readiness` and `topology-context` props

- [ ] **Step 5: Validate workspace loads**

Run: `cd desktop && pnpm test tests/workflow/workspaceSchema.test.ts tests/workflow/workspaceLoader.test.ts`

---

### Task 8: WorkflowCicdPanel — Topology Canvas link

**Files:**
- Modify: `desktop/src/components/workflow/WorkflowCicdPanel.vue`

- [ ] **Step 1: Add link button**

In header, add router-link or button: "Open Topology Canvas" → `/topology` (match existing Settings.vue pattern).

- [ ] **Step 2: Manual smoke**

No unit test required if link uses existing route; optional snapshot test.

---

### Task 9: Full test suite

- [ ] **Step 1: Desktop**

Run: `cd desktop && pnpm test`  
Expected: all pass

- [ ] **Step 2: Resource server**

Run: `cd resource-server && pytest -v`  
Expected: all pass

---

## Spec coverage checklist

| Spec § | Task |
|--------|------|
| §2 source/dockerfile fields | Task 1, 2, 3, 4 |
| §3 step responsibilities | Task 5, 7 |
| §4 fe-dev | Task 5 |
| §5 cicd workspace | Task 6, 7, 8 |
| §6 prompts | Task 7 |
| §8 success criteria | Task 9 |

## Execution handoff

Plan saved to `docs/superpowers/plans/2026-06-20-cicd-topology-source.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, spec then quality review between tasks  
2. **Inline Execution** — execute tasks in this session with checkpoints

Which approach?
