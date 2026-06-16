# Desktop Dev→CI/CD Workflow — Design Spec

**Status:** Approved — 2026-06-16 (rev. 2 — Resource Server as config context)

## 1. Purpose

Extend **Agent Flow Desktop** from a single ReAct chat into a **standalone Dev→CI/CD auto-flow platform**:

- One project folder contains PRD, architecture docs, code, and workflow config
- Default pipeline template (global) with per-project local override
- Hybrid UX: workflow step panel + step-scoped chat + free chat within a step
- Pluggable coding executors (DeepSeek, Claude Code CLI)
- **Resource config** — declare project resources + optional Resource Server for connection details; inject into LLM context for backend config generation
- Langflow embedded as design-time editor; LangGraph.js as runtime

**Not in scope:** IDE plugins, remote skill git registry (v2), dynamic container provisioning.

## 2. Architecture

```text
Agent Flow Desktop (Electron)
  Renderer
    Project Home | Workflow Run | Langflow Editor | Settings
  Main — Workflow Engine
    workflowLoader    global template + local override
    workflowCompiler  Langflow JSON → workflow.yaml → StateGraph
    stepRunner        step orchestration + checkpoint
    executorRegistry  deepseek | claude-code
    skillLoader       built-in skills/
    resourceResolver  merge declarations + Server/local instances → LLM context
  Optional: Resource Server (read-only config API)
```

## 3. Project Folder Layout

```text
my-project/
├── .agentflow/
│   ├── workflow.yaml
│   ├── workflow.langflow.json   # optional design artifact
│   ├── resources.yaml           # what resources this project uses
│   ├── resource-instances.yaml  # optional local connection overrides
│   └── prompts/
├── docs/
│   ├── PRD.md
│   └── architecture.md
├── AGENTS.md
├── fe/
└── backend/
```

**Load priority:** `{project}/.agentflow/workflow.yaml` > `~/.agentflow/templates/{id}/workflow.yaml`

## 4. Default Workflow Template

Steps: `prd → architecture → fe-dev → be-dev → test → review → test-2 → cicd`

| Step | Executor (default) | Skills | Outputs |
|------|-------------------|--------|---------|
| prd | deepseek | brainstorming | docs/PRD.md |
| architecture | deepseek | writing-plans | docs/architecture.md, AGENTS.md |
| fe-dev | claude-code | — | fe/ |
| be-dev | deepseek | test-driven-development | backend/ |
| test | deepseek | — | test report |
| review | deepseek | receiving-code-review | review notes |
| test-2 | deepseek | — | regression report |
| cicd | deepseek | — | .github/workflows/, Dockerfile |

Steps `be-dev`, `cicd`, and optionally `test` receive **resource context** in system prompt.

## 5. workflow.yaml Schema

```yaml
version: 1
id: default-dev-cicd
title: Dev to CI/CD Pipeline
steps:
  - id: prd
    title: PRD
    executor: deepseek
    agents_md: null
    skills: [brainstorming]
    prompt_template: prompts/prd.md
    outputs: [docs/PRD.md]
    gate: manual
edges:
  - { from: prd, to: architecture }
resources:
  - { type: mysql, name: app-db }
  - { type: redis, name: cache }
```

**Gate values:** `manual` (user continues) | `auto` (outputs exist → advance)

## 6. Langflow Integration

- **Design-time:** Langflow WebView in Desktop; save → `.agentflow/workflow.langflow.json`
- **Compile:** `workflowCompiler.compile(json)` → `workflow.yaml`
- **Runtime:** LangGraph.js reads `workflow.yaml` only (not Langflow API)
- Langflow native LLM nodes are **not** executed in v1

## 7. Executor Registry

```typescript
interface StepExecutor {
  id: string;
  run(ctx: StepContext): AsyncIterable<StepEvent>;
}
```

**v1 executors:**
- `deepseek` — LangGraph.js ReAct + git/shell/read tools
- `claude-code` — spawn `claude` CLI subprocess, stream stdout/stderr

System prompt = AGENTS.md + skill SKILL.md bodies + **resource context** + rendered prompt_template.

## 8. Resources (Config for LLM)

Resource Server is **configuration**, not infrastructure provisioning. It tells the LLM what server resources exist so it can generate or replace backend config files (`application.yml`, `.env`, `docker-compose.yml`, etc.).

### 8.1 Declaration (`.agentflow/resources.yaml`)

```yaml
resources:
  - { type: mysql, name: app-db, version: "8.0" }
  - { type: redis, name: cache }
  - { type: kafka, name: events, optional: true }
```

### 8.2 Instance config (connection details)

**Local override** (`.agentflow/resource-instances.yaml`):

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

**Resource Server** (optional, Settings URL): read-only HTTP/RPC `GetResourceConfig` returns the same `instances` map for the team/environment. Desktop merges Server config over local override.

### 8.3 Resolve flow

```text
1. Read resources.yaml (what resources the project needs)
2. If RESOURCE_SERVER_URL set → fetch instance config from Server
3. Merge with .agentflow/resource-instances.yaml (local wins per instance name)
4. formatResourceContext() → markdown block injected into system prompt
```

**LLM prompt fragment example:**

```markdown
## Available Server Resources
Use these when generating or updating backend configuration files.

- mysql/app-db: host=db.example.com port=3306 database=myapp user=app
- redis/cache: host=redis.example.com port=6379 dsn=redis://...
```

### 8.4 Resource Server v1 API (read-only)

| Method | Purpose |
|--------|---------|
| `GET /v1/resources/config` or gRPC `GetResourceConfig` | Return `{ instances: { ... } }` |
| `GET /health` | Health check |

**No** `Provision`, `Teardown`, or automatic `docker compose up`.

## 9. Skills (v1)

- Built-in only: ship with desktop from repo `skills/`
- `skillLoader.load(names[])` reads `SKILL.md` content
- Chat and workflow steps can override skill list per session
- v2: global git registry + project `.agentflow/skills.yaml`

## 10. UI

| Page | Purpose |
|------|---------|
| Project Home | New / open / recent projects |
| Workflow Run | Step progress + Step Chat + outputs panel |
| Langflow Editor | Visual workflow design |
| Settings | API key, Resource Server URL (config source), templates |

**Workflow Run actions:** Continue, Skip, Retry, Free Chat (within step context).

## 11. Checkpoint

Key: `{projectHash}:{workflowId}:{stepId}:{threadId}` via MemorySaver.

## 12. API Extensions

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/workflows/current` | Load workflow for workspace |
| GET | `/v1/workflow/state` | Current run state |
| POST | `/v1/workflow/run` | Start/resume step (SSE) |
| POST | `/v1/workflow/advance` | Continue / skip step |
| GET | `/v1/skills` | Built-in skill list |
| GET | `/v1/resources/context` | Resolved resource context for workspace |
| POST | `/v1/workflow/compile` | Langflow JSON → yaml |

Existing `POST /v1/chat` remains for free chat (`flow_id: general-react`).

## 13. Error Handling

| Scenario | Behavior |
|----------|----------|
| Step failure | Mark failed; offer retry / skip / free chat |
| Resource Server unreachable | Use local `resource-instances.yaml` only; UI toast |
| Missing instance config | Inject declaration-only context (type + name, no host) |
| Claude Code not installed | Clear error in step UI |
| Workspace switch | Rebuild graph + load project checkpoint |

## 14. Testing

- `workflowCompiler` — JSON/yaml → graph unit tests
- `executorRegistry` — mock LLM / mock spawn
- `resourceResolver` — merge declaration + Server + local override; format prompt
- `stepRunner` — integration with fake project
- UI — Vitest component tests for step states

## 15. v1 Scope

**In:** project model, global/local workflow, 8-step template, executors, resource config context, hybrid UI, built-in skills, Langflow embed + compile.

**Out:** skill git pull, IDE plugin, Langflow runtime execution, dynamic resource provisioning, multi-project parallel runs.
