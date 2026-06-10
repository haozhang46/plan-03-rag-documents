# Multi-Flow Agent Platform — Design Spec

**Status:** Approved — implemented 2026-06-02

## 1. Purpose

Transform **agentFlowContainer** from a single-graph chat demo into an **Agent Runtime** that external applications call over HTTP. This repository is primarily for:

1. **Debugging** LangGraph agent flows (topology, routing, RAG, skills).
2. **Serving** different compiled graphs per `flow_id` based on API parameters.

External apps (personal knowledge, ticketing, code assistants, etc.) own UI and business logic; they sync data (e.g. local Markdown) and invoke agent reasoning via API.

The bundled **Nuxt `fe/`** app is a **debug console**, not the end-user product UI.

## 2. Integration Model

- **Pure HTTP API** — no required SDK in v1.
- External app responsibilities: UI, local files, when to sync documents, client `thread_id`, optional client-side embeddings (existing `query_embedding` path).
- Platform responsibilities: LangGraph orchestration, RAG store/search, SSE streaming, Langfuse traces, skill injection.

## 3. Flow Selection (`flow_id`)

### 3.1 Approach

**Python registry + pre-compiled graphs** (not YAML DSL, not dynamic graph in request body).

### 3.2 Directory Layout

```text
backend/app/flows/
├── __init__.py
├── specs.py           # FlowSpec dataclass
├── registry.py        # FLOW_REGISTRY, GraphRegistry
└── builders/
    ├── default.py     # env-based (backward compatible)
    ├── linear_rag.py
    ├── supervisor.py
    ├── parallel.py
    └── knowledge.py   # v1 alias of supervisor; room for RAG-biased planner later
```

### 3.3 FlowSpec

```python
@dataclass(frozen=True)
class FlowSpec:
    flow_id: str
    title: str
    description: str
    builder: Callable[[Checkpointer | None], CompiledGraph]
    default_skill_names: list[str] = field(default_factory=list)
```

### 3.4 Built-in `flow_id` Values (v1)

| flow_id | Title | Graph |
|---------|-------|-------|
| `default` | Default (env) | Existing `build_graph()` — `SUPERVISOR_MODE`, `DISPATCH_MODE`, etc. |
| `linear-rag` | Linear RAG | `prepare → summarize? → rag → chat` |
| `supervisor` | Supervisor | `route ⇄ rag \| code → chat` |
| `parallel` | Parallel Map-Reduce | `build_parallel_graph()` |
| `knowledge-rag` | Knowledge / notes | v1: same compiled graph as `supervisor`; distinct id for external apps |

### 3.5 Lifecycle

- On startup: `GraphRegistry.load_all(checkpointer)` compiles each flow → `app.state.graphs: dict[str, CompiledGraph]`.
- `POST /v1/chat` resolves `flow_id` (default `"default"`).
- Unknown `flow_id` → HTTP 400 `{"detail": "unknown flow_id: ..."}`.

### 3.6 Checkpoint Isolation

LangGraph `configurable.thread_id` MUST be:

```text
{flow_id}:{client_thread_id}
```

So the same client `thread_id` used with different `flow_id` values does not share incompatible checkpoint state.

## 4. Skills

### 4.1 Sources (two paths)

1. **Request (external app / debug console)** — `skill_names: string[]` on `POST /v1/chat`.
2. **Flow / agent defaults** — `FlowSpec.default_skill_names` or skills hard-coded in a specific builder/wrapped node (e.g. code-assistant flow always attaches TDD skill inside `code_agent` wrapper).

### 4.2 Resolution Priority

```text
skill_names in request  >  FlowSpec.default_skill_names  >  SkillRouter auto-match
```

**Rule A (confirmed):** If the request includes a non-empty `skill_names`, use **only** that list — ignore flow defaults and auto-router.

If `skill_names` is omitted or empty:

- Use `FlowSpec.default_skill_names` when non-empty.
- Else run existing `SkillRouter.select(message)` in `prepare_node`.

### 4.3 Loading Behavior

- Reuse `load_l2`, `skills/registry.yaml`, existing `<skills>...</skills>` SystemMessage injection in `prepare_node`.
- State fields unchanged: `selected_skills`, `skill_context` (for spawn_subagent / code_agent L3).
- Invalid skill name in request → HTTP 400 with list of unknown names (optional: warn in debug, strict in prod).

### 4.4 API Shape

```json
POST /v1/chat
{
  "flow_id": "knowledge-rag",
  "thread_id": "user-session-1",
  "message": "总结这篇笔记",
  "skill_names": ["test-driven-development"],
  "document_ids": ["uuid-..."],
  "query_embedding": [0.01, ...]
}
```

### 4.5 Out of Scope (v1)

- Inline skill body overrides in JSON (`skill_overrides`).
- Per-tenant skill registry partitions.
- Hot-reload skills without process restart.

## 5. RAG & Documents

- Document APIs remain **global** (`POST /v1/documents`, chunks, upload, list, delete).
- Scope per request: caller passes `document_ids` (and optional `query_embedding`).
- Knowledge app pattern: sync local MD → obtain `document_id`s → chat with `flow_id: "knowledge-rag"` + those ids.
- No automatic pull from client filesystem by the platform in v1.

## 6. API Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/flows` | List registered flows (id, title, description) |
| POST | `/v1/chat` | SSE chat; adds `flow_id`, `skill_names` |
| POST | `/v1/documents` | Metadata + client chunks (unchanged) |
| GET | `/v1/documents` | List documents (unchanged) |
| GET | `/v1/skills` | List skills for debug UI (existing) |

### ChatRequest (extended)

```python
class ChatRequest(BaseModel):
    flow_id: str = "default"
    thread_id: str
    message: str
    skill_names: list[str] | None = None
    document_ids: list[str] | None = None
    query_embedding: list[float] | None = None
```

## 7. Debug Console (`fe/`)

- Label as **Agent Flow Debug Console**.
- **Flow selector** — `GET /v1/flows`, persist `debug:flow_id` in localStorage.
- **Skills multi-select** — `GET /v1/skills`, persist `debug:skill_names`, send as `skill_names` on chat (overrides flow defaults per rule A).
- Keep: thread list, RAG knowledge panel, citations, streaming chat.
- `useChat` passes `flow_id` and `skill_names`.

## 8. Multi-App & Auth (v1 vs later)

**v1:** No mandatory `app_id`; any client with network access can call API (same as today).

**Later:** `app_id` + API key → allowed `flow_id` list; optional document namespace per tenant (existing `tenant_mode` hooks).

## 9. Example: Personal Knowledge App

```text
1. App reads local *.md
2. Client embed (Ollama) → POST /v1/documents + /chunks
3. User asks question → POST /v1/chat
   {
     "flow_id": "knowledge-rag",
     "thread_id": "<app-session>",
     "message": "...",
     "document_ids": ["..."],
     "query_embedding": [...]
   }
4. Optional: pass skill_names: ["summarize-notes"] when user picks a mode
```

## 10. Acceptance Criteria

- [x] `GraphRegistry` registers ≥4 flows; unit tests for known/unknown `flow_id`.
- [x] Chat routes to correct compiled graph per `flow_id`.
- [x] Checkpoint key uses `{flow_id}:{thread_id}`.
- [x] `skill_names` in request overrides flow defaults and auto-router.
- [x] Flow defaults apply when `skill_names` omitted.
- [x] `GET /v1/flows` returns metadata.
- [x] Debug console: flow dropdown + optional skills + chat works.
- [x] README section: external integration + knowledge-app example.

## 11. Migration / Compatibility

- Omitting `flow_id` → `"default"` preserves current env-driven single graph.
- Omitting `skill_names` → current auto-router behavior when flow has no defaults.
- `app.state.graph` may remain as alias to `graphs["default"]` during transition for tests.

## 12. Non-Goals (this spec)

- YAML-defined graphs.
- Request-body graph DSL.
- Platform-side filesystem watch / pull for MD files.
- Official TypeScript/Python SDK (can follow after API stabilizes).
- Per-app API key enforcement (deferred).
