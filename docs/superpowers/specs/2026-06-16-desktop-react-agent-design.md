# Desktop ReAct Agent — Design Spec

**Status:** Approved — 2026-06-16

## 1. Purpose

Deliver a **local Electron desktop app** where:

- **ReAct loop** runs in a Python sidecar (LangGraph) on `127.0.0.1`
- **LLM** uses **DeepSeek API** (user-provided key, no Ollama)
- **git / shell / read_file** execute on the user's machine via Electron executor HTTP (`127.0.0.1:17351`)
- **UI** reuses chat components from `fe/` via `packages/shared-ui`

Cloud `backend/` Agent Runtime remains for Debug Console and `finance-agent`; desktop is the primary local dev agent product.

## 2. Decisions

| Topic | Choice |
|-------|--------|
| Tool execution | User machine (Electron main) |
| ReAct orchestration | Local Python sidecar |
| LLM | DeepSeek API (`deepseek-chat`) |
| API Key | User enters in Settings; stored in OS keychain; injected into sidecar env |
| Default flow | `general-react` |
| Executor protocol | Sidecar sync `POST http://127.0.0.1:17351/v1/tool` |
| ReAct max iterations | 25 |
| V1 tools | `read_file`, `list_dir`, `git_status`, `git_diff`, `run_shell` (no ssh in V1) |

## 3. Architecture

```text
Electron App
├── Renderer (Vue + shared-ui) → POST sidecar /v1/chat (SSE)
├── Main: spawn sidecar, keychain, workspace picker
└── Executor HTTP :17351 ← sidecar local_proxy tools

Python Sidecar (LOCAL_MODE=1)
├── FastAPI minimal app
├── flow general-react (LangGraph ReAct)
└── DeepSeek via existing llm/factory.py
```

## 4. Sidecar API

### POST /v1/chat

```json
{
  "flow_id": "general-react",
  "thread_id": "uuid",
  "message": "..."
}
```

No JWT. `WORKSPACE_ROOT` and `DEEPSEEK_API_KEY` from sidecar env (set by Electron).

### SSE events

| event | data |
|-------|------|
| message | `{"content":"..."}` |
| tool_start | `{"call_id","name"}` |
| tool_end | `{"call_id","name","ok"}` |
| done | `{}` |

### GET /v1/health/deepseek

Probes DeepSeek key validity (minimal call or factory init).

## 5. Executor API

**POST /v1/tool**

```json
{
  "call_id": "uuid",
  "name": "read_file",
  "args": {"path": "src/main.ts"},
  "workspace_root": "/Users/hz/project"
}
```

Path sandbox: resolved path must stay under `workspace_root`. Destructive shell patterns require native confirm dialog.

## 6. Monorepo Layout

```text
packages/shared-ui/     # ChatMessage, ChatInput, useMessages, parseSseStream
fe/                     # imports shared-ui; cloud debug unchanged
desktop/                # electron-vite + Vue renderer
backend/app/desktop/    # LOCAL_MODE FastAPI entry
backend/app/agent/graphs/react_agent.py
backend/app/agent/tools/desktop/
```

## 7. Out of Scope (V1)

- `ssh_exec`, `git_commit`
- `debugger-agent` flow
- Cloud hybrid RAG from desktop
- Ollama

## 8. Testing

- Backend: ReAct routing, executor client mock, max_iterations, local chat route
- Desktop executor: path sandbox unit tests
- Manual: Electron dev + sidecar + DeepSeek key
