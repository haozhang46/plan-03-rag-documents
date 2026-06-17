# Desktop Dev→CI/CD Workflow — Design Spec

**Status:** Approved — 2026-06-16 (rev. 3 — Harness alignment: dispatcher, gates, intent×risk, eval)

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
    dispatcher        read state.json + workflow.yaml → route next step
    gateRunner        deterministic file/shell checks (fail-closed)
    phaseStore        step handoff via .agentflow/phases/*.md
    stepRunner        step orchestration + checkpoint
    harnessEval       A/B score workflow runs (deterministic, no LLM judge)
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
│   ├── state.json               # dispatcher state (intent, risk, step statuses)
│   ├── phases/                  # step handoff artifacts (readable markdown)
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

# intent × risk → required steps (others skipped)
profiles:
  QUERY/NA:        { required_steps: [] }
  BUG_FIX/LOW:     { required_steps: [be-dev, test, cicd] }          # FAST_PATH
  FEATURE/MEDIUM:  { required_steps: [prd, architecture, fe-dev, be-dev, test, review, cicd] }
  FEATURE/HIGH:    { required_steps: [prd, architecture, fe-dev, be-dev, test, review, test-2, cicd] }

steps:
  - id: prd
    title: PRD
    executor: deepseek
    agents_md: null
    skills: [brainstorming]
    prompt_template: prompts/prd.md
    outputs: [docs/PRD.md]
    phase_output: phases/prd.md
    advance: manual
    gates:
      - id: prd-file
        type: file
        path: docs/PRD.md
        min_bytes: 200
  - id: be-dev
    title: Backend Development
    executor: deepseek
    skills: [test-driven-development]
    prompt_template: prompts/be-dev.md
    outputs: [backend/]
    phase_output: phases/be-dev.md
    advance: manual
    gates:
      - id: backend-dir
        type: file
        path: backend/
      - id: backend-tests
        type: shell
        command: pytest -q
        cwd: backend
        expect_exit: 0
edges:
  - { from: prd, to: architecture }
resources:
  - { type: mysql, name: app-db }
  - { type: redis, name: cache }
```

### 5.1 Intent × Risk

Set at run start (UI or `POST /v1/workflow/intent`). Dispatcher resolves **active steps** from `profiles`:

| Intent × Risk | Path | Required steps |
|---------------|------|----------------|
| `QUERY` / `NA` | — | 0 (no workflow) |
| `BUG_FIX` / `LOW` | FAST_PATH | be-dev → test → cicd |
| `FEATURE` / `MEDIUM` | standard | prd → … → cicd (no test-2) |
| `FEATURE` / `HIGH` | full | all 8 steps |

Skipped steps are marked `skipped` in `state.json`; dispatcher never routes to them.

### 5.2 Deterministic Gates

Gates run **after** executor finishes and **before** advance. Fail-closed: any `FAIL` blocks `continue`.

| Type | Fields | Checks |
|------|--------|--------|
| `file` | `path`, `min_bytes?` | Path exists; optional minimum size |
| `shell` | `command`, `cwd?`, `expect_exit?` (default 0) | Real subprocess exit code |

Results written to `.agentflow/phases/{stepId}.gates.json`. **Do not trust LLM self-report** — only gate results and exit codes count.

Legacy `gate: manual | auto` still parsed: mapped to `advance` + implicit `file` gates on `outputs`.

### 5.3 Phase Handoff

Each step may declare `phase_output` (relative to `.agentflow/`). On completion, executor summary is written there. Next step's prompt receives `{{prior_phase}}` from the previous active step's phase file.

### 5.4 Advance

`advance: manual` — gates must pass, then user clicks Continue.  
`advance: auto` — gates pass → dispatcher advances automatically.

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

## 11. Checkpoint & state.json

**Memory checkpoint key:** `{projectHash}:{workflowId}:{stepId}:{threadId}` via MemorySaver.

**Persistent dispatcher state** (`.agentflow/state.json`):

```json
{
  "workflowId": "default-dev-cicd",
  "intent": "FEATURE",
  "risk": "HIGH",
  "currentStepId": "be-dev",
  "activeStepIds": ["prd", "architecture", "fe-dev", "be-dev", "test", "review", "test-2", "cicd"],
  "stepStatuses": { "prd": "done", "be-dev": "running" },
  "lastGateResults": { "prd": [{ "id": "prd-file", "status": "PASS" }] },
  "threadId": "..."
}
```

Survives session restarts; dispatcher reads this file to route.

## 12. API Extensions

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/workflows/current` | Load workflow for workspace |
| GET | `/v1/workflow/state` | Current run state |
| POST | `/v1/workflow/run` | Start/resume step (SSE) |
| POST | `/v1/workflow/advance` | Continue / skip step (runs gates on continue) |
| POST | `/v1/workflow/intent` | Set intent + risk; rebuild active steps |
| POST | `/v1/workflow/gates` | Re-run gates for current step |
| GET | `/v1/workflow/dispatch` | Dispatcher decision (next step, phase input path) |
| POST | `/v1/eval/run` | Score current harness run (deterministic) |
| POST | `/v1/eval/compare` | A/B compare two eval reports |
| GET | `/v1/skills` | Built-in skill list |
| GET | `/v1/resources/context` | Resolved resource context for workspace |
| POST | `/v1/workflow/compile` | Langflow JSON → yaml |

Existing `POST /v1/chat` remains for free chat (`flow_id: general-react`).

## 13. Error Handling

| Scenario | Behavior |
|----------|----------|
| Gate failure | Mark `gate_failed`; block advance; offer retry / skip |
| LLM claims tests passed | Ignored; only gate `shell` exit codes count |
| Resource Server unreachable | Use local `resource-instances.yaml` only; UI toast |
| Missing instance config | Inject declaration-only context (type + name, no host) |
| Claude Code not installed | Clear error in step UI |
| Workspace switch | Rebuild graph + load project checkpoint |

## 14. Testing

- `workflowCompiler` — JSON/yaml → graph unit tests
- `executorRegistry` — mock LLM / mock spawn
- `resourceResolver` — merge declaration + Server + local override; format prompt
- `gateRunner` — file/shell pass-fail; fail-closed
- `dispatcher` — intent×risk profiles; skip inactive steps
- `phaseStore` — write/read `.agentflow/phases/`
- `harnessEval` — 7-dim simplified scoring; 3-run hash stability
- `stepRunner` — integration with fake project
- UI — Vitest component tests for step states

## 15. v1 Scope

**In:** project model, global/local workflow, 8-step template, executors, resource config context, hybrid UI, built-in skills, Langflow embed + compile, **dispatcher + deterministic gates + phase handoff + intent×risk + harness eval (v1 prototype)**.

**Out:** skill git pull, IDE plugin, Langflow runtime execution, dynamic resource provisioning, multi-project parallel runs, hook-level tool interception.

## 16. Reference / Alignment — Harness Engineering

Aligned with [AI 不缺智商缺纪律：我的 Harness 工程化实践](https://mp.weixin.qq.com/s/2kWi0Fld09fNMVIUg9ddKQ) (阿里云开发者, 2026).

### 16.1 Core thesis

| Article concept | Agent Flow Desktop mapping |
|-----------------|---------------------------|
| Harness = structural constraint, not prompt stuffing | `workflow.yaml` + `gates` + `dispatcher` |
| Thin main session; dispatcher routes | `stepRunner` delegates to `dispatcher.getNextStep()` |
| State externalized (survives compaction) | `.agentflow/state.json` + `phases/*.md` |
| G1–G8 fail-closed gates | Per-step `gates[]` with `file` / `shell` checks |
| Intent × risk dynamic pruning | `profiles` in workflow.yaml |
| File handoff between agents | `phase_output` + `{{prior_phase}}` in prompts |
| Eval platform (deterministic scorer) | `harnessEval` — no LLM judge; A/B via `/v1/eval/compare` |
| Rules/skills layered loading | Existing `skills/` + `prompts/`; v2: `rules/` layer |

### 16.2 Adopted patterns (v1 prototype)

1. **Deterministic gates** — compile/test/file checks via code; LLM self-report ignored.
2. **Phase handoff** — each step writes `.agentflow/phases/{stepId}.md`; next step reads prior phase only.
3. **Dispatcher state machine** — reads `state.json`, returns next active step; skips profile-excluded steps.
4. **FAST_PATH** — `BUG_FIX/LOW` runs be-dev → test → cicd only.
5. **Harness eval** — simplified 4-dim score (completeness, artifacts, code, gates) for workflow A/B.

### 16.3 Deferred from article

- Hook-enforced tool interception (Claude Code hooks)
- 19-node enterprise pipeline; we keep 8-step Dev→CI/CD template
- Headless eval farm / containerized batch runs
- Lesson → pattern → instinct auto-learn loop
- Multi-agent parallel review subgraphs
