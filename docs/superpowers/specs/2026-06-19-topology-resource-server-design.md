# Topology Resource Server — Design Spec

**Status:** Approved — 2026-06-19

## 1. Purpose

Extend Agent Flow Desktop's optional **Resource Server** from connection-details-only into a **deployment-agnostic topology + instances gateway**:

- Visual panel to configure server / microservice topology (nodes, edges, deployment targets)
- Neutral schema that works across Docker Compose, Kubernetes, and PaaS (Coolify, Dokploy, Meshery)
- Read-only v1 API consumed by Desktop `cicd` step and `WorkflowCicdPanel`
- Pluggable import/export adapters; no lock-in to VPS or K8s

**Builds on:** [2026-06-16 Desktop Dev→CI/CD Workflow](./2026-06-16-desktop-dev-cicd-workflow-design.md) §8 Resource Config.

**Not in scope (v1):** Dynamic provisioning, automatic `docker compose up`, writing secrets to git, IDE plugins.

## 2. Architecture

```text
┌──────────────── Agent Flow Desktop ─────────────────┐
│  WorkflowRun | WorkflowCicdPanel | cicd step        │
│       ↓ HTTP (Settings → Resource Server URL)       │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│         AgentFlow Resource Server (new package)      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ Topology    │  │ Instances    │  │ Targets     │ │
│  │ Store       │  │ Store        │  │ Registry    │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘ │
│         └────────────────┼───────────────────┘       │
│                    Adapter Layer                      │
│   compose │ k8s │ meshery │ coolify │ dokploy        │
└───────────────────────────────────────────────────────┘
         ↑ Topology Web UI / import          ↓ v2 deploy
   Meshery Kanvas (v1.1)              Coolify / kubectl
```

**Principles:**

1. Desktop talks **only** to Resource Server APIs — never directly to Meshery, Coolify, etc.
2. Topology, instances, and deployment targets are **three separate layers**.
3. v1 is **read-only** for mutations on remote infrastructure (aligned with existing Desktop spec).
4. Local project files remain the source of truth when present; Server provides team/environment defaults.

**Repository location:** `resource-server/` at repo root (sibling to `desktop/`, `backend/`, `fe/`).

## 3. Neutral Data Model

### 3.1 Topology (`topology.yaml`)

```yaml
version: 1
project: my-app
nodes:
  - id: api
    kind: service          # service | database | cache | gateway | worker
    runtime: node          # optional: node | python | go | static
    image: null            # null → cicd step generates Dockerfile
    ports:
      - { container: 8000, host: 8000 }
  - id: app-db
    kind: database
    engine: mysql
  - id: cache
    kind: cache
    engine: redis
edges:
  - from: api
    to: app-db
    env:
      DATABASE_URL: "mysql://app:${APP_DB_PASSWORD}@app-db:3306/myapp"
  - from: api
    to: cache
    env:
      REDIS_URL: "redis://cache:6379/0"
targets:
  - id: dev
    type: docker-compose    # docker-compose | kubernetes | paas
    env: dev
  - id: prod
    type: kubernetes
    env: prod
```

### 3.2 Instances (unchanged contract)

Same shape as existing Resource Server v1:

```yaml
instances:
  app-db:
    host: db.example.com
    port: 3306
    database: myapp
    user: app
    password: "***"
    dsn: mysql://app:***@db.example.com:3306/myapp
  cache:
    host: redis.example.com
    port: 6379
    dsn: redis://redis.example.com:6379/0
```

### 3.3 Project folder extensions

```text
my-project/
├── .agentflow/
│   ├── resources.yaml           # declarations (existing)
│   ├── resource-instances.yaml  # local override (existing)
│   └── topology.yaml            # NEW optional local copy
├── docker-compose.yml           # cicd output / compose adapter export
└── k8s/                         # cicd output / k8s adapter export
```

### 3.4 Merge priority

| Layer | Priority (highest first) |
|-------|--------------------------|
| Instances | local `resource-instances.yaml` → Server `instances` → topology-derived placeholders (host empty) |
| Topology | local `topology.yaml` → Server topology store |

Desktop `resourceResolver` behavior unchanged for instances; topology merge is additive.

## 4. Resource Server API

### 4.1 v1 (read + store)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/v1/resources/config` | `{ instances: { ... } }` — **existing contract** |
| GET | `/v1/topology` | `{ version, project, nodes, edges, targets }` |
| GET | `/v1/topology/markdown` | LLM-ready topology summary |
| GET | `/v1/deployment/summary` | Platform hint + service list (superset of Desktop `DeploymentConfig`) |

Query param `?project=<id>` scopes all endpoints when Server holds multiple projects.

### 4.2 v1.1 (import/export, no deploy)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/topology/import` | Body: `{ format: compose \| k8s \| meshery, content \| url }` |
| POST | `/v1/topology/export` | Body: `{ format: compose \| k8s, target_id?: string }` → generated YAML |

Export writes artifacts to a configured export directory or returns inline YAML; does **not** apply to clusters.

### 4.3 v2 (optional, approval-gated)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/deploy/plan` | Preview changes from topology → target |
| POST | `/v1/deploy/execute` | Execute after explicit approval token |

All v2 mutating calls require `X-Approval-Token` from a prior plan step.

## 5. Adapter Layer

| Adapter | Import → neutral topology | Export ← topology | External UI |
|---------|---------------------------|-------------------|-------------|
| **compose** | Parse `services`, `depends_on`, ports, env | Generate `docker-compose.yml` | — |
| **k8s** | Parse Deployment/Service/Ingress | Generate `k8s/*.yaml` | — |
| **meshery** | REST design import | Export design YAML | Kanvas Web UI (v1.1) |
| **coolify** | List apps + databases via API | Compose compatible with Coolify | Coolify dashboard |
| **dokploy** | Same pattern as coolify | Same | Dokploy dashboard |

**v1 ships:** `compose` adapter only (import + export).

**v1.1 ships:** `k8s` export, `meshery` import.

**v2 ships:** `coolify` / `dokploy` deploy triggers with approval gate.

Adapter interface (conceptual):

```typescript
interface TopologyAdapter {
  id: string;
  import(input: ImportRequest): Promise<Topology>;
  export(topology: Topology, opts: ExportOptions): Promise<string>;
}
```

## 6. Topology Web UI (Resource Server)

Minimal v1 panel — does not depend on Meshery:

| Area | Function |
|------|----------|
| Left rail | Component palette: service, mysql, redis, nginx, worker |
| Center | Canvas: drag nodes, draw edges |
| Right rail | Selected node: ports, env keys, linked instance name |
| Actions | Save, Sync from project (compose import), Export compose |

**Stack:** Vue 3 + `@vue-flow/core` (or equivalent), UnoCSS to align with Desktop. Served at `{server}/ui`.

Desktop **Settings** adds link: **Open Topology Panel** → `{RESOURCE_SERVER_URL}/ui?project=<hash>`.

## 7. Desktop Integration

### 7.1 Changes (small, additive)

| Module | Change |
|--------|--------|
| `electron/resources/resolver.ts` | Optional fetch `/v1/topology`; merge local `topology.yaml` |
| `electron/resources/resolver.ts` | `formatTopologyContextForPrompt()` for cicd/be-dev/test |
| `electron/workspace/service.ts` | Prefer Server `/v1/deployment/summary` when URL set |
| `src/components/workflow/WorkflowCicdPanel.vue` | Render topology nodes/edges alongside compose preview |
| `src/pages/Settings.vue` | Link to Topology Panel |

### 7.2 LLM context injection (cicd step)

```markdown
## Service Topology
- api (service) → app-db (mysql), cache (redis)
- targets: dev=docker-compose, prod=kubernetes

## Available Server Resources
- mysql/app-db: host=... port=3306 ...
- redis/cache: host=... port=6379 ...
```

Steps receiving context: `be-dev`, `cicd`, `test` (unchanged step set).

### 7.3 Error handling

| Scenario | Behavior |
|----------|----------|
| Resource Server unreachable | Use local files only; toast in Settings / CicdPanel |
| Topology missing | CicdPanel falls back to compose file parse (current behavior) |
| Import validation failure | 422 with field errors; UI shows inline |
| Adapter not configured | Skip adapter; other sources still work |

## 8. Resource Server Package Layout

```text
resource-server/
├── pyproject.toml              # or package.json — FastAPI preferred (reuse backend patterns)
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/routes/             # health, resources, topology, deploy
│   ├── models/                 # Topology, Node, Edge, Target Pydantic models
│   ├── store/                  # file or sqlite persistence per project
│   └── adapters/
│       ├── compose.py
│       ├── k8s.py              # v1.1
│       ├── meshery.py          # v1.1
│       └── coolify.py          # v2
├── ui/                         # Vue 3 topology panel
└── tests/
```

**Persistence v1:** SQLite per Server instance, keyed by `project_id` (hash of workspace path or explicit id from Desktop).

**Auth v1:** Optional API key header `X-Resource-Token`; localhost default allows open access for dev.

## 9. Phased Delivery

| Phase | Resource Server | Desktop |
|-------|-----------------|---------|
| **v1** | Neutral schema, compose adapter, SQLite store, REST read APIs, minimal Web UI | Fetch topology; CicdPanel graph; prompt injection |
| **v1.1** | k8s export, meshery import adapter | No breaking changes |
| **v2** | Deploy plan/execute + coolify/dokploy adapters | Optional Deploy button with approval modal |

## 10. Testing

| Area | Approach |
|------|----------|
| Resource Server | pytest: compose round-trip import/export; API contract tests |
| Adapters | Golden files: sample compose ↔ expected topology JSON |
| Desktop | Vitest: resolver merge priority; CicdPanel with mocked topology API |
| Integration | Desktop E2E: Settings URL → fetch topology → cicd prompt contains edges |

## 11. Open Source References

Tools evaluated for adapter/UI integration (not vendored):

| Project | License | Role |
|---------|---------|------|
| [Meshery / Kanvas](https://meshery.io/) | Apache-2.0 | Visual topology designer (v1.1 adapter) |
| [Coolify](https://coolify.io/) | Apache-2.0 | PaaS deploy target (v2 adapter) |
| [Dokploy](https://github.com/Dokploy/dokploy) | Apache-2.0 | PaaS deploy target (v2 adapter) |
| [OpenSRE](https://github.com/Tracer-Cloud/opensre) | Apache-2.0 | Production incident ops — out of scope for this spec |
| [HolmesGPT](https://github.com/HolmesGPT/holmesgpt) | Apache-2.0 | Runtime troubleshooting — out of scope for this spec |

## 12. Success Criteria (v1)

- [x] Operator can define api → mysql → redis topology in Web UI without editing YAML by hand
- [x] Desktop `cicd` step receives topology + instances in system prompt when Resource Server URL is set
- [x] Compose file in project can be imported to Server and re-exported without data loss (services, depends_on, ports)
- [x] Works with Resource Server URL empty (local-only fallback unchanged)
- [x] No automatic production mutations in v1

## 13. Ops Visualization Integration (v1.1)

**Direction:** Primary ops visualization uses external tools, not the self-built `/ui` form editor.

| Environment | Tool | Role |
|-------------|------|------|
| Docker VPS | [Portainer](https://www.portainer.io/) | Container/stack ops console |
| Kubernetes | [Meshery / Kanvas](https://meshery.io/) | Cluster design + live ops |

Resource Server remains the **adapter gateway** for Desktop and Chat:

- Env-configured `RESOURCE_SERVER_PORTAINER_URL`, `RESOURCE_SERVER_PORTAINER_API_TOKEN`, `RESOURCE_SERVER_MESHERY_URL`
- `GET /v1/ops/config` — public panel URLs (no tokens) for Desktop Settings links
- `GET /v1/ops/summary?project=` — read-only aggregated runtime (stacks, connections) + intent topology node count
- Adapters fail gracefully when unconfigured or unreachable

**Desktop:**

- CicdPanel **Runtime Ops** section shows Docker VPS + K8s summary cards
- Settings links: Open Portainer, Open Meshery (when server reports URLs)
- Self-built `/ui` link demoted to "Topology Editor (dev)" — not primary ops panel

**Chat (v1 follow-up):** LangChain `topology_*` tools for intent topology; `ops_*` tools deferred to v1.2.

### 13.1 Success Criteria (v1.1)

- [x] Resource Server exposes `/v1/ops/config` and `/v1/ops/summary` with Portainer/Meshery adapters
- [x] Desktop CicdPanel shows runtime ops summary when Resource Server URL is set
- [x] Settings shows external ops panel links when configured on Resource Server
- [x] Unconfigured ops adapters return `{ configured: false }` without breaking Desktop
- [x] Chat `topology_*` tools work when Resource Server URL is set (Option B)
