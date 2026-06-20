# CI/CD Workspace, Topology Source Mapping & FE Context — Design Spec

**Status:** Approved — 2026-06-20  
**Builds on:** [be-dev workspace design](./2026-06-20-be-dev-workspace-mermaid-design.md), [topology canvas ops](./2026-06-19-topology-canvas-ops-design.md), [dev-cicd workflow](./2026-06-16-desktop-dev-cicd-workflow-design.md)

## 1. Purpose

Close three gaps discovered during be-dev/cicd brainstorming:

1. **CI/CD workspace** is a read-only dashboard — needs artifact editing + pipeline doc + readiness (Scheme C).
2. **Topology → code mapping** — `topology.yaml` does not record which directory each service builds from.
3. **FE deployment context** — fe-dev needs API/nginx/CDN context without duplicating topology editor (SSOT stays in be-dev).

## 2. Topology source mapping (SSOT)

### 2.1 New node fields

```yaml
nodes:
  - id: api
    kind: service
    runtime: python
    source: backend              # repo-relative code directory
    dockerfile: Dockerfile       # relative to source, default Dockerfile
    ports: [{ container: 8000, host: 8000 }]
  - id: fe-web
    kind: service
    runtime: node
    source: fe
    dockerfile: Dockerfile
  - id: nginx
    kind: gateway
    engine: nginx
    source: deploy/nginx         # config dir, optional
    image: nginx:alpine
  - id: db
    kind: database
    engine: postgres
    # no source — uses image only
```

| Field | Applies to | Meaning |
|-------|------------|---------|
| `source` | service, worker, gateway | Repo path for build context or config |
| `dockerfile` | service, worker | Dockerfile path relative to `source` (default `Dockerfile`) |

### 2.2 Default source inference (UI helper)

When creating a node in be-dev topology panel:

| Node id pattern | Default `source` |
|-----------------|------------------|
| `api`, `backend` | `backend` |
| `fe-web`, `web`, `fe` | `fe` |
| `desktop`, `electron` | `desktop` |
| `nginx` | `deploy/nginx` |

### 2.3 Compose export behavior

`export_compose(topology)` must emit:

```yaml
services:
  api:
    build:
      context: backend
      dockerfile: Dockerfile
```

Not `build: .` for all services. Database/cache/gateway with `image` unchanged.

## 3. Step responsibilities

| Step | Topology | Artifacts |
|------|----------|-----------|
| **be-dev** | Edit `topology.yaml` (SSOT) | backend code, schema, dataflow |
| **fe-dev** | Read-only `topology-context` | fe code, fe-dataflow, styles |
| **cicd** | Read-only + readiness checks | Dockerfile, compose, GH Actions, pipeline md |

## 4. fe-dev workspace additions

Add tabs (keep existing):

- **数据流** — `docs/fe-dataflow.md` (Mermaid sequenceDiagram / flowchart for Electron→API, CDN)
- **API 连接** — `topology-context` widget (read-only): shows focused nodes (`api`), edges, env keys (`NUXT_PUBLIC_API_BASE`), source map

No `topology-panel` on fe-dev.

## 5. cicd workspace (Scheme C)

Tabs:

| Tab | Widget | SSOT file |
|-----|--------|-----------|
| 部署流水线 | `markdown-doc` | `docs/cicd-pipeline.md` |
| Dockerfile | `markdown-doc` file-list | `Dockerfile` |
| GitHub Actions | `markdown-doc` directory | `.github/workflows/` |
| Compose | `markdown-doc` file-list | `docker-compose.yml` |
| 就绪检查 | `cicd-readiness` | — (aggregates gates + files + topology) |
| 部署概览 | `cicd-config` | read-only existing panel + link to Topology Canvas |

### 5.1 cicd-readiness checks

- `Dockerfile` exists (workflow gate)
- `.github/workflows/` has ≥1 yaml
- `topology.yaml` has ≥1 service node
- Each service/worker with `source`: directory exists
- Optional: `docker-compose.yml` exists when target is docker-compose
- Workflow gates for step `cicd` (from API)

### 5.2 Pipeline template

`docs/cicd-pipeline.md` with Mermaid flowchart: push → CI → build → test → deploy → health.

## 6. Prompt updates

`templates/default-dev-cicd/prompts/cicd.md`:

```markdown
Read .agentflow/topology.yaml (source mapping per service).
Generate Dockerfile per service source, docker-compose.yml, .github/workflows/.
Update docs/cicd-pipeline.md if flow changes.
```

## 7. Out of scope (v1)

- CDN as topology node kind (document in fe-dataflow only)
- One-click deploy from cicd tab (use Topology Canvas)
- Auto-generate Dockerfile content from source (Agent in cicd step only)

## 8. Success criteria

- User sees which code directory each topology service maps to in be-dev UI
- Compose export uses per-service `build.context`
- cicd workspace has 6 tabs; readiness shows pass/fail
- fe-dev shows API connection summary without topology editor
- `cd desktop && pnpm test` and `cd resource-server && pytest -v` pass
