# Chat Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist chat threads under `.agentflow/chatMemory/` with JSON messages + SQLite LangGraph checkpoints, and add collapsible thread list to WorkflowRun (Step/Free) and standalone Chat page.

**Architecture:** `chatMemoryService` in Electron main handles filesystem CRUD; shared `SqliteSaver` replaces `MemorySaver` in agent/file-chat paths; sidecar exposes `/v1/chat-memory/*`; frontend `useChatMemory` + `ChatThreadSidebar` replace localStorage/in-memory state.

**Spec:** `docs/superpowers/specs/2026-06-20-chat-memory-design.md`

**Tech Stack:** Electron main, `@langchain/langgraph-checkpoint-sqlite`, Vue 3, Vitest

---

### Task 1: Chat memory types and filesystem service

**Files:**
- Create: `desktop/electron/chatMemory/types.ts`
- Create: `desktop/electron/chatMemory/paths.ts`
- Create: `desktop/electron/chatMemory/service.ts`
- Create: `desktop/tests/chatMemory/service.test.ts`

- [ ] **Step 1: Write failing tests for path resolution and CRUD**

```typescript
// desktop/tests/chatMemory/service.test.ts
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createThread,
  listThreads,
  loadThread,
  saveMessages,
  updateThreadMeta,
  deleteThread,
} from "../../electron/chatMemory/service";

describe("chatMemoryService", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "chat-mem-"));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("creates and lists free threads sorted by updatedAt desc", async () => {
    const a = await createThread(tmp, {
      scope: "free",
      workflowId: "wf-1",
      title: "First",
    });
    const b = await createThread(tmp, {
      scope: "free",
      workflowId: "wf-1",
      title: "Second",
    });
    await updateThreadMeta(tmp, { scope: "free", workflowId: "wf-1", threadId: a.id }, { title: "First updated" });
    const list = await listThreads(tmp, { scope: "free", workflowId: "wf-1" });
    expect(list.map((t) => t.id)).toContain(a.id);
    expect(list[0].title).toBeDefined();
  });

  it("loads and saves messages", async () => {
    const t = await createThread(tmp, {
      scope: "step",
      workflowId: "wf-1",
      stepId: "fe-dev",
      title: "Step chat",
    });
    await saveMessages(tmp, { scope: "step", workflowId: "wf-1", stepId: "fe-dev", threadId: t.id }, [
      { role: "user", content: "hi" },
    ]);
    const loaded = await loadThread(tmp, { scope: "step", workflowId: "wf-1", stepId: "fe-dev", threadId: t.id });
    expect(loaded.messages).toHaveLength(1);
    expect(loaded.meta.checkpointThreadId).toMatch(/^step:wf-1:fe-dev:/);
  });

  it("deletes thread directory", async () => {
    const t = await createThread(tmp, { scope: "app", title: "App" });
    await deleteThread(tmp, { scope: "app", threadId: t.id });
    await expect(loadThread(tmp, { scope: "app", threadId: t.id })).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd desktop && pnpm test tests/chatMemory/service.test.ts`  
Expected: FAIL — module not found

- [ ] **Step 3: Implement types, paths, service**

`types.ts` — scopes, meta, ChatMessage re-export shape, `buildCheckpointThreadId(scope, ids)`.

`paths.ts` — `threadDir(projectRoot, scope, ids)`, `checkpointsDbPath(projectRoot)`.

`service.ts` — implement CRUD using `fs/promises`; `createThread` writes `meta.json` + empty `messages.json`; generate uuid via `crypto.randomUUID()`.

- [ ] **Step 4: Run tests**

Run: `cd desktop && pnpm test tests/chatMemory/service.test.ts`  
Expected: PASS

---

### Task 2: SQLite checkpointer factory

**Files:**
- Modify: `desktop/package.json`
- Create: `desktop/electron/chatMemory/checkpointer.ts`
- Create: `desktop/tests/chatMemory/checkpointer.test.ts`

- [ ] **Step 1: Add dependency**

Run: `cd desktop && pnpm add @langchain/langgraph-checkpoint-sqlite@0.0.1`  
(If peer conflict, use latest version compatible with `@langchain/langgraph@0.2.74` — verify with `pnpm test`)

- [ ] **Step 2: Failing test — same project root returns same saver instance**

```typescript
import { describe, expect, it } from "vitest";
import { getProjectCheckpointer, resetCheckpointersForTests } from "../../electron/chatMemory/checkpointer";

describe("checkpointer", () => {
  it("returns singleton per project root", () => {
    resetCheckpointersForTests();
    const a = getProjectCheckpointer("/tmp/proj-a");
    const b = getProjectCheckpointer("/tmp/proj-a");
    const c = getProjectCheckpointer("/tmp/proj-b");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
```

- [ ] **Step 3: Implement `getProjectCheckpointer(projectRoot)`** — lazy Map of SqliteSaver; DB path `{projectRoot}/.agentflow/chatMemory/checkpoints.db`; mkdir on first use.

- [ ] **Step 4: Run** `cd desktop && pnpm test tests/chatMemory/checkpointer.test.ts`

---

### Task 3: Wire checkpointer into agents

**Files:**
- Modify: `desktop/electron/agent/agentService.ts`
- Modify: `desktop/electron/agent/fileChatService.ts`
- Modify: `desktop/electron/executors/deepseek.ts`
- Modify: `desktop/electron/agent/server.ts` (pass projectRoot into agents)
- Modify: `desktop/tests/agent/fileChatService.test.ts`

- [ ] **Step 1:** `agentService.configure` accepts `projectRoot`; uses `getProjectCheckpointer(projectRoot)` instead of `new MemorySaver()`.

- [ ] **Step 2:** `streamFileChat` accepts `checkpointThreadId: string` + `projectRoot`; reuse shared checkpointer; set `configurable.thread_id` to `checkpointThreadId` (not workflow state threadId).

- [ ] **Step 3:** `deepseekExecutor` — accept checkpointer via module-level setter or factory from `projectRoot` on each run (match how `runWorkflowStep` gets project root).

- [ ] **Step 4:** Update file-chat route: require `threadId` in body; build `file:{workflowId}:{stepId}:{threadId}` using active workflow id from payload or `getActiveWorkflowId`.

- [ ] **Step 5:** Run `cd desktop && pnpm test`

---

### Task 4: HTTP routes for chat memory

**Files:**
- Modify: `desktop/electron/agent/server.ts`
- Create: `desktop/tests/chatMemory/routes.test.ts`

- [ ] **Step 1:** Failing tests for GET list, POST create, GET load, PUT messages.

- [ ] **Step 2:** Wire routes under `/v1/chat-memory/…` calling `chatMemoryService`.

- [ ] **Step 3:** Run `cd desktop && pnpm test tests/chatMemory/routes.test.ts`

---

### Task 5: `useChatMemory` composable

**Files:**
- Create: `desktop/src/composables/useChatMemory.ts`
- Create: `desktop/tests/composables/useChatMemory.test.ts`

- [ ] **Step 1:** Implement composable with scope ref, `loadThreads`, `createThread`, `selectThread`, `persistMessages`, `updateTitle` — mirrors `useDesktopThreads` + `useMessages` but via fetch API.

- [ ] **Step 2:** Vitest with mocked `fetch`.

- [ ] **Step 3:** Run `cd desktop && pnpm test tests/composables/useChatMemory.test.ts`

---

### Task 6: `ChatThreadSidebar` component

**Files:**
- Create: `desktop/src/components/chat/ChatThreadSidebar.vue`
- Create: `desktop/tests/components/ChatThreadSidebar.test.ts`

- [ ] **Step 1:** Collapsible aside: chevron toggle, thread list, New Chat button; emit `select`, `create`, `update:collapsed`.

- [ ] **Step 2:** Component test: renders titles, emits select on click.

- [ ] **Step 3:** Run component tests

---

### Task 7: WorkflowRun integration

**Files:**
- Modify: `desktop/src/pages/WorkflowRun.vue`
- Modify: `desktop/src/composables/useWorkflow.ts` (fileChat adds `threadId`)
- Create: `desktop/tests/pages/WorkflowRun.chatMemory.test.ts`

- [ ] **Step 1:** Replace `stepMessages` / `freeThreadId` with two `useChatMemory` instances (or one with dynamic scope) for step vs free.

- [ ] **Step 2:** Embed `ChatThreadSidebar` inside chat `<aside>`; reload threads on step/workflow/mode change.

- [ ] **Step 3:** `onStepSend` / `onFreeSend` — persist messages after each turn; pass `threadId` to fileChat and `/v1/chat`.

- [ ] **Step 4:** Run tests + manual smoke on WorkflowRun

---

### Task 8: Chat.vue migration + localStorage import

**Files:**
- Modify: `desktop/src/pages/Chat.vue`
- Create: `desktop/src/composables/migrateLocalChat.ts`
- Modify: `desktop/electron/agent/server.ts` (optional POST `/v1/chat-memory/migrate`)

- [ ] **Step 1:** Switch Chat page to `useChatMemory` scope `app`; mode/skills in meta via PATCH.

- [ ] **Step 2:** On mount, if localStorage has `desktop:threads` and server list empty, import once then clear localStorage.

- [ ] **Step 3:** Run `cd desktop && pnpm test`

---

### Task 9: Verification

- [ ] Add `.agentflow/chatMemory/` note to spec or template gitignore documentation
- [ ] Run full suite: `cd desktop && pnpm test`
- [ ] Manual: create step thread → send file chat → reload app → select thread → send follow-up (agent remembers)
