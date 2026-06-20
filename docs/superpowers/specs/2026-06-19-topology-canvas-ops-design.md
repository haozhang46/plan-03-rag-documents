# Topology Canvas & Workspace Ops — Design Spec

**Status:** Approved — 2026-06-19

**Builds on:**

- [2026-06-19 Topology Resource Server](./2026-06-19-topology-resource-server-design.md) — neutral topology + instances
- [2026-06-16 Desktop Dev→CI/CD Workflow](./2026-06-16-desktop-dev-cicd-workflow-design.md) — `.agentflow/` project layout

## 1. Purpose

Ship a **Topology Canvas** in Agent Flow Desktop: per-workspace visual orchestration (nodes/edges), edit config in-place, **manual CI/CD** (deploy without running the workflow `cicd` step), and **application/service logs** as the primary observability surface.

**User goals (confirmed):**

1. Each **workspace** (project folder) has its own ops config — **auto-created on first enter** if missing.
2. Canvas **reads/edits** that config; supports **manual deploy** from the graph.
3. **Log strategy A1:** primary focus on **application/service logs** (stdout/stderr, `docker compose logs`), not ES/Loki replacement; **local persistence** under `.agentflow/ops-logs/`.
4. **Node access model C (hybrid):** compute nodes (`gateway` / `service` / `worker`) → VPS SSH; managed `database` / `cache` → instance connection (no SSH into DB).

**Not in scope (v1.2–v1.3):**

- Self-hosted Elasticsearch/Loki (optional external link only)
- DockGraph/Portainer as primary UI (auxiliary links remain from v1.1)
- Silent production deploy without user confirmation
- SSH private keys in Resource Server or git

## 2. Architecture

```text
┌──────────────── Agent Flow Desktop ─────────────────────────────┐
│  Topology Canvas (new page/tab)                                  │
│    Graph ← topology.yaml + merge Server                          │
│    Node Drawer: Logs (primary) | Status | Terminal | Deploy      │
│    Log Panel: live tail + client filter + history files          │
│  Electron main: SSH (ssh2), read/write .agentflow/, keychain     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ optional merge/sync
┌───────────────────────────▼─────────────────────────────────────┐
│  Resource Server — topology + instances (team defaults)           │
│  NO ops.yaml / NO SSH keys / NO ops-logs                        │
└─────────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
         VPS (host-ssh)            Managed RDS/Redis
    docker compose logs            TCP ping + instances.yaml
```

**Principles:**

1. **Workspace-local ops truth:** `topology.yaml` + `ops.yaml` + `ops-logs/` live in `{project}/.agentflow/`.
2. **Resource Server** holds shareable topology/instances only; secrets and SSH stay on Desktop.
3. **Logs first (A1):** Node Drawer defaults to **Logs** tab; Status is lightweight (up/down badge on graph).
4. **Manual CI/CD** complements (does not replace) workflow `cicd` step — Canvas executes runtime deploy; workflow generates artifacts.

## 3. Workspace Config Layout

```text
my-project/
├── .agentflow/
│   ├── workflow.yaml              # existing
│   ├── resources.yaml             # existing
│   ├── resource-instances.yaml    # existing — managed DB/Redis connections
│   ├── topology.yaml              # nodes, edges, targets, node.access
│   ├── ops.yaml                   # hosts, deploy profiles, log policy
│   ├── ops-audit.jsonl            # append-only deploy/log session audit
│   └── ops-logs/                  # gitignored — persisted log snapshots
│       └── {nodeId}-{action}-{iso}.log
├── docker-compose.yml
└── k8s/
```

Add to project `.gitignore` (or template): `.agentflow/ops-logs/`, `ops-audit.jsonl` optional (may contain hostnames).

### 3.1 Merge priority

| Layer | Priority (highest first) |
|-------|--------------------------|
| Topology graph | local `topology.yaml` → Resource Server store |
| Instances | local `resource-instances.yaml` → Server `/v1/resources/config` |
| Ops (hosts, deploy, log policy) | **local `ops.yaml` only** |
| SSH keys | Desktop keychain (`identityRef`) |

Opening a workspace loads all files; switching workspace reloads Canvas entirely.

### 3.2 Bootstrap — auto-create on first enter

**Trigger:** User opens **Topology Canvas** (or navigates to Topology tab) for the current workspace.

**Rule:** Missing files are **created automatically**. Existing files are **never overwritten**.

| Path | If missing | Action |
|------|------------|--------|
| `.agentflow/` | yes | `mkdir -p` |
| `.agentflow/topology.yaml` | yes | Write scaffold (see below) |
| `.agentflow/ops.yaml` | yes | Write default `logPolicy` + empty `hosts` / `deployProfiles` |
| `.agentflow/ops-logs/` | yes | Create empty directory |
| `.agentflow/ops-audit.jsonl` | yes | Create empty file (or omit until first session) |
| `.agentflow/resources.yaml` | yes | **Out of scope here** — unchanged; workflow template may already create it |
| `.agentflow/resource-instances.yaml` | yes | **Do not auto-create** — optional; empty `{}` only if Canvas needs managed nodes |

**Bootstrap order** (single `ensureWorkspaceOpsConfig(workspaceRoot)` in Electron main):

```text
1. Ensure .agentflow/ + ops-logs/
2. If topology.yaml missing:
     a. Try import docker-compose.yml / compose.yaml (project root) → nodes + edges
     b. Else merge Resource Server GET /v1/topology?project= (if URL configured)
     c. Else merge resources.yaml declarations → placeholder nodes (app-db, cache, …)
     d. Else write minimal empty graph (project id + zero nodes)
3. If ops.yaml missing → write defaults (logPolicy A1, no hosts)
4. Return merged in-memory config → Canvas renders immediately
```

**Default `topology.yaml`** (when no compose / server / resources hints):

```yaml
version: 1
project: <folderName>
nodes: []
edges: []
targets:
  - id: dev
    type: docker-compose
    env: dev
```

**Default `ops.yaml`:**

```yaml
version: 1
hosts: []
deployProfiles: []
logPolicy:
  strategy: A1
  persist: true
  defaultTailLines: 200
  maxFilesPerNode: 30
  clientFilter: true
  externalLogUrl: null
```

**Compose import heuristic** (when `docker-compose.yml` exists):

- One node per `services.*` → `kind: service` (or `database`/`cache` if image/name matches mysql/redis/postgres)
- `depends_on` → edges
- Nodes get `access.mode: host-ssh`, `hostRef: vps-dev` (placeholder), `service: <compose service name>`
- `ops.yaml` gets placeholder host `vps-dev` with empty `host:` — user fills in Canvas or Settings

**UX:**

- First enter: Canvas opens with graph (imported or empty); toast **「已创建 .agentflow/topology.yaml」** (one-time, non-blocking).
- Empty graph: centered hint — *拖入节点或从 Compose 导入*; toolbar **Import from compose** if file exists but was skipped.
- Bootstrap errors (disk permission): show error banner; Canvas read-only with in-memory empty config (no silent fail).

**Idempotency:** Second visit reads existing files only; bootstrap skipped.

**Git:** New files are normal project files (except `ops-logs/` gitignored). User may commit `topology.yaml` / `ops.yaml` without secrets (hosts have no keys).

## 4. Data Model

### 4.1 `topology.yaml` extensions

```yaml
version: 1
project: my-app
nodes:
  - id: nginx
    kind: gateway
    access:
      mode: host-ssh
      hostRef: vps-prod
      deployRef: compose-prod
      service: nginx          # compose service name for logs/deploy
  - id: api
    kind: service
    access:
      mode: host-ssh
      hostRef: vps-prod
      deployRef: compose-prod
      service: api
  - id: app-db
    kind: database
    engine: mysql
    access:
      mode: managed-instance
      instanceRef: app-db
  - id: cache
    kind: cache
    engine: redis
    access:
      mode: managed-instance
      instanceRef: cache
edges: [...]
targets:
  - { id: prod, type: docker-compose, env: prod }
```

**Access modes:**

| `access.mode` | Node kinds | SSH | Logs source | Deploy |
|---------------|------------|-----|-------------|--------|
| `host-ssh` | gateway, service, worker | Yes | `docker compose logs` via SSH | Yes (confirm) |
| `managed-instance` | database, cache (hosted) | No | No tail; optional `logUrl` external | No |

Self-hosted DB on same VPS uses `host-ssh` with `service: app-db`.

### 4.2 `ops.yaml`

```yaml
version: 1
hosts:
  - id: vps-prod
    host: 203.0.113.10
    port: 22
    user: deploy
    identityRef: keychain:vps-prod

deployProfiles:
  - id: compose-prod
    type: docker-compose
    workdir: /opt/my-app
    commands:
      status: "docker compose ps {{service}}"
      deploy: "docker compose pull {{service}} && docker compose up -d {{service}}"
      deployAll: "docker compose pull && docker compose up -d"
      logs: "docker compose logs -f --tail={{tailLines}} {{service}}"
      logsSnapshot: "docker compose logs --tail={{tailLines}} {{service}}"

logPolicy:
  strategy: A1                    # application logs primary
  persist: true                   # write snapshots to ops-logs/
  defaultTailLines: 200
  maxFilesPerNode: 30
  clientFilter: true              # in-panel text filter (not ES)
  externalLogUrl: null            # optional per-node override → Grafana/Loki
```

### 4.3 Pydantic / TS types (Desktop + optional Server read model)

Extend existing `Node` with optional `access: NodeAccess`. `ops.yaml` parsed only in Desktop main process.

## 5. Topology Canvas UI

**Route:** new Desktop page `TopologyCanvas` (sidebar entry: **Topology**), scoped to current workspace.

### 5.1 Graph view

- Render nodes/edges from merged topology (Vue Flow or equivalent).
- Node badge: **log health hint** — green if last log tail had no error pattern in last N lines (heuristic); amber/red if container exited or unreachable (from last Status poll).
- Toolbar: **Save**, **Sync to Server** (optional), **Deploy All** (confirm modal), **Refresh**.

### 5.2 Node Drawer (click node)

| Tab | Order | `host-ssh` | `managed-instance` |
|-----|-------|------------|---------------------|
| **Logs** | 1 (default) | Live `docker compose logs -f` over SSH; client filter; Save snapshot | Message + link to `instanceRef` / optional `logUrl` |
| **Status** | 2 | `docker compose ps {{service}}` one-shot | TCP connect + instance fields from `resource-instances.yaml` |
| **Terminal** | 3 | Interactive SSH (xterm) | Hidden |
| **Deploy** | 4 | Run deploy profile (confirm) | Disabled — "Managed service" |

### 5.3 Log Panel (A1 — application logs)

**Primary UX:** bottom dock or full-width panel tied to selected node.

**Live stream:**

- SSH exec `logs` command from deploy profile; stream stdout to renderer via IPC.
- **Client-side filter** (regex/substring) on rolling buffer (e.g. last 5000 lines in memory).
- Actions: **Pause**, **Clear**, **Save snapshot** → `.agentflow/ops-logs/{nodeId}-logs-{iso}.log`.

**History:**

- List files in `ops-logs/` for current node; open in read-only viewer with same filter.
- Append audit line to `ops-audit.jsonl` on session start/end.

**External deep search (optional v1.3):**

- Per-node or global `externalLogUrl` in `ops.yaml` → "Open in Grafana/Loki" button.
- Agent Flow does **not** embed ES/Loki API in v1.2.

**Not primary in A1:**

- Server CPU/memory dashboards (DockGraph link optional in Status tab footer).
- Full-text search across all historical logs (defer to external system).

## 6. Manual CI/CD

**Distinction from Workflow `cicd` step:**

| | Workflow `cicd` | Canvas manual CI/CD |
|---|-----------------|---------------------|
| Purpose | Generate compose/k8s/Actions files | Apply deploy to **existing** runtime |
| Executor | LLM + gates | User button + SSH |
| Output | repo files | remote containers + ops-logs |

**Flows:**

1. **Deploy node:** Drawer → Deploy → confirm → SSH `deploy` command → stream log to Log Panel → audit entry.
2. **Deploy All:** Toolbar → confirm → SSH `deployAll` → same logging.
3. **Chat (v1.4):** `ops_deploy_node`, `ops_logs_tail` tools wrapping same SSH layer.

All deploy actions require explicit confirmation (aligned with v1 read-only infra policy evolving to confirmed mutations).

## 7. SSH & Secrets

- Private keys: Electron safe storage / keychain via `identityRef: keychain:{id}`.
- Settings UI: manage host identities (add key, test connection).
- SSH implementation: main process (`ssh2`); renderer never sees key material.
- `ops.yaml` may reference `host`/`user`/`port` but never private key PEM.

## 8. Resource Server role

| Data | Server | Desktop local |
|------|--------|---------------|
| topology nodes/edges/targets | Optional team store | `topology.yaml` |
| instances | Optional team store | `resource-instances.yaml` |
| ops hosts/deploy/log policy | **No** | `ops.yaml` |
| ops logs | **No** | `ops-logs/` |

Optional: `PUT /v1/topology` sync from Canvas **Save to Server** (topology only, strip `access` secrets if any).

v1.1 ops adapters (Portainer, Meshery, DockGraph URL) remain **supplementary links** in Settings — not Canvas primary.

## 9. Phased Delivery

| Phase | Deliverables |
|-------|--------------|
| **v1.2** | `ensureWorkspaceOpsConfig` bootstrap; `topology.yaml`/`ops.yaml` auto-create; load/merge; Canvas read-only graph; Logs tab snapshot (non-follow); local ops-logs |
| **v1.3** | Canvas edit + save; SSH terminal; live log follow; Deploy node/All with confirm; Status tab |
| **v1.4** | Chat `ops_*` tools; externalLogUrl; audit history UI; optional Server topology sync |
| **v2** | K8s bastion + kubectl logs; deploy plan preview via Resource Server |

## 10. Testing

| Area | Approach |
|------|----------|
| Config loader | Vitest: parse sample topology.yaml + ops.yaml; merge priority |
| Bootstrap | Vitest: missing files → created; existing files untouched; compose import |
| Log snapshot | Mock SSH stream → verify ops-logs file written |
| Canvas | Component test: node click opens Logs tab by default |
| Deploy confirm | E2E: deploy button disabled until confirm |
| managed-instance | No SSH mock; shows instance panel only |

## 11. Success Criteria

- [x] First enter Topology Canvas auto-creates missing `topology.yaml` + `ops.yaml` without overwriting existing files (v1.2)
- [x] Each workspace loads its own `.agentflow/topology.yaml` + `ops.yaml` in Canvas (v1.2)
- [x] User can edit and save topology/ops config from Canvas (v1.3)
- [x] Click `host-ssh` node → **Logs** tab shows snapshot fetch + history (v1.2; live follow v1.3)
- [x] Log snapshots persist under `.agentflow/ops-logs/` (gitignored) (v1.2)
- [x] Manual deploy from node/toolbar runs over SSH with confirmation and log capture (v1.3)
- [x] `managed-instance` nodes show connection status, not SSH logs (v1.3)
- [x] Optional external Grafana/Loki link configurable without bundling ES (v1.4)

## 12. Open Decisions (resolved)

| Question | Decision |
|----------|----------|
| Node SSH target | **C hybrid** — host SSH for compute; managed instance for hosted DB/cache |
| Log primary type | **A1** — application/service logs (`docker logs`), local persist |
| DockGraph | Optional Status footer link only |
| ES/Loki | External URL only; no built-in search index |
| Missing config | **Auto-create on Canvas enter** — compose → server → resources → empty scaffold |
