# Topology Resource Server — Implementation Plan (v1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1 AgentFlow Resource Server (topology + instances gateway, compose adapter, REST API, minimal Web UI) and integrate with Desktop cicd/resource context.

**Architecture:** New `resource-server/` FastAPI package with SQLite persistence, compose import/export adapter, read APIs matching existing Desktop contract plus topology endpoints. Desktop `resolver.ts` merges local/server topology; `stepRunner` injects topology markdown into prompts; `WorkflowCicdPanel` renders graph.

**Tech Stack:** Python 3.11, FastAPI, Pydantic v2, SQLite, pytest; Desktop: TypeScript, Vitest, Vue 3.

**Spec:** `docs/superpowers/specs/2026-06-19-topology-resource-server-design.md`

---

## File Map

| Path | Responsibility |
|------|----------------|
| `resource-server/pyproject.toml` | Package + deps |
| `resource-server/app/main.py` | FastAPI app, mount UI static |
| `resource-server/app/config.py` | Settings (port, db path, auth token) |
| `resource-server/app/models/topology.py` | Pydantic models: Node, Edge, Target, Topology |
| `resource-server/app/store/sqlite.py` | Per-project topology + instances persistence |
| `resource-server/app/adapters/compose.py` | compose ↔ Topology import/export |
| `resource-server/app/services/topology.py` | Markdown formatter, deployment summary |
| `resource-server/app/api/routes/health.py` | GET /health |
| `resource-server/app/api/routes/resources.py` | GET /v1/resources/config |
| `resource-server/app/api/routes/topology.py` | topology CRUD read + import/export |
| `resource-server/ui/` | Minimal Vue 3 topology panel (v1: list + edge editor) |
| `resource-server/tests/` | pytest contract + adapter tests |
| `desktop/electron/resources/topology.ts` | Types, fetch, merge, format for prompt |
| `desktop/electron/resources/resolver.ts` | Wire topology into resolve flow |
| `desktop/electron/workflow/stepRunner.ts` | Append topology markdown to resourceContext |
| `desktop/electron/workflow/workflowService.ts` | Expose topology in getResourceContext |
| `desktop/electron/agent/server.ts` | GET /v1/topology proxy route for renderer |
| `desktop/src/composables/useWorkflow.ts` | fetchTopology client |
| `desktop/src/components/workflow/WorkflowCicdPanel.vue` | Topology section |
| `desktop/src/pages/Settings.vue` | Open Topology Panel link |
| `desktop/tests/resources/topology.test.ts` | Merge + format tests |

---

### Task 1: Resource Server Scaffold + Models + Health

**Files:**
- Create: `resource-server/pyproject.toml`
- Create: `resource-server/app/__init__.py`
- Create: `resource-server/app/config.py`
- Create: `resource-server/app/models/topology.py`
- Create: `resource-server/app/main.py`
- Create: `resource-server/app/api/routes/health.py`
- Create: `resource-server/tests/test_health.py`

- [ ] **Step 1: Write failing health test**

```python
# resource-server/tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `cd resource-server && pip install -e ".[dev]" && pytest tests/test_health.py -v`
Expected: FAIL — module not found

- [ ] **Step 3: Implement scaffold**

`pyproject.toml` — name `agent-flow-resource-server`, deps: fastapi, uvicorn, pydantic-settings, pyyaml; dev: pytest, httpx.

`app/models/topology.py` — Pydantic models matching spec §3.1 (`Topology`, `Node`, `Edge`, `Target`, `PortMapping`).

`app/main.py` — FastAPI app, include health router.

- [ ] **Step 4: Run test — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add resource-server/
git commit -m "feat(resource-server): scaffold FastAPI app with topology models"
```

---

### Task 2: SQLite Store

**Files:**
- Create: `resource-server/app/store/sqlite.py`
- Create: `resource-server/tests/test_store.py`

- [ ] **Step 1: Write failing store tests**

Test `get_topology(project_id)` returns None initially; `save_topology` + `get_topology` round-trip; same for `instances`.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement SQLite store**

Tables: `projects(id TEXT PRIMARY KEY)`, `topology_json TEXT`, `instances_json TEXT`.
Use `:memory:` or temp file in tests via `Settings(db_path=...)`.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(resource-server): SQLite store for topology and instances"
```

---

### Task 3: Compose Adapter

**Files:**
- Create: `resource-server/app/adapters/compose.py`
- Create: `resource-server/tests/fixtures/sample-compose.yml`
- Create: `resource-server/tests/test_compose_adapter.py`

- [ ] **Step 1: Write failing round-trip test**

Import sample compose with `api`, `app-db` (mysql image), `cache` (redis), `depends_on`.
Assert nodes/edges. Export back; assert services keys preserved.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement adapter**

`import_compose(content: str) -> Topology` — map services to nodes (image mysql→database, redis→cache); `depends_on` → edges.
`export_compose(topology: Topology) -> str` — generate valid docker-compose YAML.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(resource-server): compose topology import/export adapter"
```

---

### Task 4: REST API v1 (resources + topology + import/export)

**Files:**
- Create: `resource-server/app/api/routes/resources.py`
- Create: `resource-server/app/api/routes/topology.py`
- Create: `resource-server/app/services/topology.py`
- Modify: `resource-server/app/main.py`
- Create: `resource-server/tests/test_api.py`

- [ ] **Step 1: Write failing API tests**

```python
def test_resources_config_empty():
    r = client.get("/v1/resources/config?project=demo")
    assert r.status_code == 200
    assert r.json() == {"instances": {}}

def test_topology_put_and_get():
    body = {"version": 1, "project": "demo", "nodes": [...], "edges": [], "targets": []}
    client.put("/v1/topology?project=demo", json=body)
    r = client.get("/v1/topology?project=demo")
    assert r.json()["nodes"][0]["id"] == "api"

def test_topology_import_compose():
    r = client.post("/v1/topology/import?project=demo", json={"format": "compose", "content": "..."})
    assert r.status_code == 200
```

Also test `GET /v1/topology/markdown` and `GET /v1/deployment/summary`.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement routes**

`format_topology_markdown(topology) -> str` per spec §7.2.
`deployment_summary(topology, instances)` → platform from targets or compose default.

Optional `X-Resource-Token` check when configured.

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(resource-server): v1 REST API for resources and topology"
```

---

### Task 5: Minimal Topology Web UI

**Files:**
- Create: `resource-server/ui/index.html` (v1: vanilla JS + fetch, no build step)
- Modify: `resource-server/app/main.py` — `StaticFiles` at `/ui`

- [ ] **Step 1: Manual smoke test script**

`tests/test_ui_static.py` — GET `/ui/` returns 200 and contains "Topology".

- [ ] **Step 2: Implement minimal UI**

Single page: project id input, node list (add/remove), edge list (from/to), Save → PUT `/v1/topology`, Import compose textarea → POST import, Export → POST export display.

- [ ] **Step 3: Run tests — PASS**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(resource-server): minimal topology web UI at /ui"
```

---

### Task 6: Desktop Topology Resolver + Prompt Injection

**Files:**
- Create: `desktop/electron/resources/topology.ts`
- Modify: `desktop/electron/resources/resolver.ts`
- Modify: `desktop/electron/workflow/stepRunner.ts`
- Modify: `desktop/electron/workflow/workflowService.ts`
- Create: `desktop/tests/resources/topology.test.ts`

- [ ] **Step 1: Write failing topology tests**

Test `resolveTopology` merges local `.agentflow/topology.yaml` over server fetch.
Test `formatTopologyContextForPrompt` output matches spec §7.2.

- [ ] **Step 2: Run — FAIL**

Run: `cd desktop && pnpm test tests/resources/topology.test.ts`

- [ ] **Step 3: Implement**

`fetchServerTopology(url, projectId?)` → GET `/v1/topology?project=...`
`loadLocalTopology(projectRoot)` → parse yaml
`resolveTopology(projectRoot, serverUrl, projectId?)` — local wins
`formatTopologyContextForPrompt(topology)` 

In `stepRunner.ts`, when `stepNeedsResourceContext`:
```typescript
const topology = await resolveTopology(...);
const parts = [formatResourceContextForPrompt(resolved)];
if (topology) parts.push(formatTopologyContextForPrompt(topology));
resourceContext = parts.filter(Boolean).join("\n\n");
```

Extend `getResourceContext` to return `{ markdown, resources, topologyMarkdown? }`.

- [ ] **Step 4: Run desktop tests — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(desktop): topology resolver and LLM prompt injection"
```

---

### Task 7: Desktop CicdPanel + Settings + API Route

**Files:**
- Modify: `desktop/electron/agent/server.ts`
- Modify: `desktop/src/composables/useWorkflow.ts`
- Modify: `desktop/src/components/workflow/WorkflowCicdPanel.vue`
- Modify: `desktop/src/pages/Settings.vue`
- Create: `desktop/tests/pages/WorkflowCicdTopology.test.ts` (optional component test)

- [ ] **Step 1: Write failing test for fetchTopology in composable**

- [ ] **Step 2: Add server route** `GET /v1/resources/topology` proxying resolver

- [ ] **Step 3: CicdPanel** — section "Service Topology" listing nodes and edges when present

- [ ] **Step 4: Settings** — when URL set, show link `<a :href="resourceServerUrl + '/ui'">Open Topology Panel</a>`

- [ ] **Step 5: Run tests — PASS**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(desktop): topology in CicdPanel and Settings panel link"
```

---

### Task 8: Root Scripts + Integration Verification

**Files:**
- Modify: `package.json` (root)
- Modify: `resource-server/README.md`

- [ ] **Step 1: Add scripts**

```json
"dev:resource-server": "cd resource-server && uvicorn app.main:app --reload --port 9000",
"test:resource-server": "cd resource-server && pytest -v"
```

- [ ] **Step 2: Run full test suites**

```bash
cd resource-server && pytest -v
cd desktop && pnpm test
```

- [ ] **Step 3: Commit + update plan checkboxes**

```bash
git commit -m "chore: resource-server dev scripts and README"
```

---

## Spec Coverage (v1)

| Spec § | Task |
|--------|------|
| §3 Neutral model | Task 1, 3 |
| §4.1 v1 API | Task 4 |
| §4.2 import/export | Task 3, 4 |
| §5 compose adapter v1 | Task 3 |
| §6 Web UI | Task 5 |
| §7 Desktop integration | Task 6, 7 |
| §8 package layout | Task 1–5 |
| §10 testing | All tasks |
| §12 success criteria | Task 8 verification |

**Deferred to v1.1/v2:** k8s adapter, meshery, coolify, deploy plan/execute (spec §4.3, §5).
