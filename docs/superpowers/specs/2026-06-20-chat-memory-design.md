# Chat Memory — Design Spec

**Status:** Approved — 2026-06-20

**Goal:** Persist WorkflowRun (Step / Free) and standalone Chat page history under `{projectRoot}/.agentflow/chatMemory/`, with LangGraph checkpoint continuity so threads survive app restart.

## 1. Problem

| Surface | Today | After reload |
|---------|-------|--------------|
| WorkflowRun Step Chat | In-memory `stepMessages` | Lost |
| WorkflowRun Free Chat | Random `threadId` + partial localStorage | Lost |
| Standalone Chat page | `localStorage` (`desktop:threads`, `messages:*`) | UI survives browser cache; not in project dir |
| Agent backend | `MemorySaver` everywhere | No multi-turn continuity |

Users need project-local chat history and true resume on old threads.

## 2. Decisions (brainstorming)

| Topic | Choice |
|-------|--------|
| Storage root | `{projectRoot}/.agentflow/chatMemory/` |
| Thread scope | Step: multiple threads per step (list = current step only). Free: multiple threads per **active workflow** |
| Persistence depth | UI messages **+** LangGraph SQLite checkpoint |
| Surfaces | WorkflowRun Step/Free **and** standalone Chat page |
| Free Chat isolation | Per `workflowId` |

## 3. Directory layout

```text
.agentflow/chatMemory/
├── checkpoints.db                 # SqliteSaver — all checkpoint thread_ids
├── _app/
│   └── threads/{threadId}/
│       ├── meta.json
│       └── messages.json
└── workflows/{workflowId}/
    ├── free/
    │   └── threads/{threadId}/
    │       ├── meta.json
    │       └── messages.json
    └── steps/{stepId}/
        └── threads/{threadId}/
            ├── meta.json
            └── messages.json
```

### 3.1 `meta.json`

```typescript
type ChatThreadMeta = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  checkpointThreadId: string;
  // App chat only:
  mode?: "ask" | "plan" | "agent";
  skills?: string[];
};
```

### 3.2 `messages.json`

Array of `ChatMessage` from `@agent-flow/shared-ui` (`role`, `content`, `attachments?`, `toolRuns?`, `citations?`).

### 3.3 Checkpoint `thread_id` mapping

| Surface | `checkpointThreadId` |
|---------|---------------------|
| App Chat (Ask/Plan/Agent) | `app:{mode}:{threadId}` |
| Free Chat | `free:{workflowId}:{threadId}` |
| Step File Chat | `file:{workflowId}:{stepId}:{threadId}` |

**Step Chat without attachments** continues to call `POST /v1/workflow/run` (full step execution). UI messages persist per thread; **agent checkpoint continuity does not apply** to run-mode sends (each send is an independent workflow run). File-mode step threads and Free/App chats get full checkpoint resume.

## 4. Backend

### 4.1 `chatMemoryService` (`desktop/electron/chatMemory/`)

- Resolve paths from `projectRoot` + scope (`app` | `free` | `step`)
- `listThreads`, `createThread`, `getThread`, `saveMessages`, `updateMeta`, `deleteThread`
- Sort list by `updatedAt` desc
- On `deleteThread`: remove thread directory; optionally delete checkpoint rows for `checkpointThreadId` (best-effort via checkpointer API if available; else leave orphan rows — acceptable v1)

### 4.2 Checkpointer (`desktop/electron/chatMemory/checkpointer.ts`)

- Lazy singleton `SqliteSaver.fromConnString(path.join(chatMemoryRoot, "checkpoints.db"))`
- Created when project opens; path keyed on `workspaceRoot`
- Replace `MemorySaver` in:
  - `agentService.ts`
  - `fileChatService.ts` (accept injected saver; stop creating per-request agent with new MemorySaver)
  - `deepseek.ts` executor (shared saver; existing `workflow:{runThreadId}:{stepId}` ids unchanged)

Install `@langchain/langgraph-checkpoint-sqlite` version compatible with `@langchain/langgraph@0.2.x` (pin after install test).

### 4.3 HTTP API (sidecar `server.ts`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/chat-memory/threads?scope=app` | List app threads |
| GET | `/v1/chat-memory/threads?scope=free&workflowId=` | List free threads |
| GET | `/v1/chat-memory/threads?scope=step&workflowId=&stepId=` | List step threads |
| POST | `/v1/chat-memory/threads` | Create thread (body: scope + ids + optional title/mode/skills) |
| GET | `/v1/chat-memory/threads/:id?scope=...` | meta + messages |
| PUT | `/v1/chat-memory/threads/:id/messages` | Replace messages array |
| PATCH | `/v1/chat-memory/threads/:id` | Update title / meta |
| DELETE | `/v1/chat-memory/threads/:id?scope=...` | Delete thread |

All routes use `getWorkspaceRoot()`; 400 if project not open.

### 4.4 Chat send changes

- **`POST /v1/chat`**: `thread_id` remains client-facing id; server maps to `app:{mode}:{thread_id}` (unchanged pattern) with SqliteSaver.
- **`POST /v1/workspace/file-chat`**: add `threadId` in body (chat memory thread id). `checkpointThreadId = file:{workflowId}:{stepId}:{threadId}`. Stop using workflow run `state.threadId` for file chat.
- **Free Chat** (`WorkflowRun`): uses `POST /v1/chat` with `thread_id = checkpointThreadId` suffix uuid part OR pass `threadId` + server builds id — prefer client sends memory thread id; server builds `free:{workflowId}:{threadId}`.

## 5. Frontend

### 5.1 `useChatMemory` composable

Wraps fetch to `/v1/chat-memory/*`; exposes `threads`, `activeThreadId`, `messages`, `load`, `create`, `select`, `saveMessages`, `updateTitle`, `remove`.

Replace `useMessages` + `useDesktopThreads` localStorage in Chat.vue; replace in-memory step/free chat state in WorkflowRun.

### 5.2 `ChatThreadSidebar.vue`

- Collapsible narrow strip on the **left edge of the right chat panel** (inside `<aside>`, before Step/Free toggle)
- Collapsed: ~28px chevron strip; expanded: ~160px thread list + “+ New Chat”
- Persist collapsed state in `localStorage` key `workflow-chat-list-collapsed`
- Props: `threads`, `activeId`, `collapsed`, `@select`, `@create`, `@delete` (optional v1: skip delete UI)

### 5.3 `WorkflowRun.vue`

- Step mode: scope `step` + `activeWorkflowId` + `activeStepId`
- Free mode: scope `free` + `activeWorkflowId`
- Watch step/workflow/mode → reload thread list; auto-create thread if none selected
- On send: append messages via API; pass `threadId` to file-chat / chat endpoints
- Remove `stepMessages` ref and random `freeThreadId`

### 5.4 `Chat.vue`

- Scope `_app`; persist mode/skills in thread `meta.json`
- Left sidebar replaced by same `ChatThreadSidebar` pattern (or reuse component in left column — keep existing layout width)

### 5.5 localStorage migration (one-time)

On project open, if `desktop:threads` exists and `_app/threads` empty, import threads + messages into chatMemory via API; clear localStorage keys after success.

## 6. Gitignore

Add to project template / document: `.agentflow/chatMemory/` (or entire folder) should not be committed.

## 7. Testing

- Unit: `chatMemoryService` path resolution, CRUD, list ordering
- Unit: checkpoint factory returns same instance for same project root
- HTTP: list/create/get/save messages round-trip
- Component: `ChatThreadSidebar` collapse + select
- Integration: file-chat accepts `threadId`; second message on same thread sees prior checkpoint (mock LLM / stub checkpointer in unit test)

## 8. Out of scope

- Checkpoint continuity for Step Chat **run-mode** (no attachments → workflow run)
- Cross-workflow Free Chat
- Cloud sync / export UI
- Deleting checkpoint rows on thread delete (best-effort only)

## 9. Error handling

- API failures → show inline error in chat panel; keep in-memory copy until save retry
- Missing `.agentflow` → chat memory routes create `chatMemory` on first write
- Corrupt `messages.json` → treat as empty array, log warning
