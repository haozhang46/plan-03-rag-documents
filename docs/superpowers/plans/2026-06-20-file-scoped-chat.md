# File-Scoped Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When Step Chat sends with file attachments, run scoped file-chat (read/write only attached paths) instead of full workflow step execution.

**Architecture:** New `fileChatService` + scoped tools; new SSE endpoint `/v1/workspace/file-chat`; frontend branches `onStepSend` on attachments. Workflow state untouched.

**Tech Stack:** Electron main, LangGraph.js ReAct, Vue 3, Vitest

---

### Task 1: Scoped file chat tools & service

**Files:**
- Create: `desktop/electron/agent/fileChatTools.ts`
- Create: `desktop/electron/agent/fileChatService.ts`
- Modify: `desktop/electron/agent/prompt.ts`
- Create: `desktop/tests/agent/fileChatTools.test.ts`
- Create: `desktop/tests/agent/fileChatService.test.ts`

- [ ] **Step 1:** Failing tests for path whitelist (`read_file`/`write_file` reject out-of-scope paths)
- [ ] **Step 2:** Implement `buildFileChatLangChainTools` and `isPathAllowed`
- [ ] **Step 3:** Failing test for `buildFileChatSystemPrompt` (preamble + paths + skills)
- [ ] **Step 4:** Implement `buildFileChatSystemPrompt` in `prompt.ts`
- [ ] **Step 5:** Implement `streamFileChat` in `fileChatService.ts` (mock LLM in tests)
- [ ] **Step 6:** Run `cd desktop && pnpm test tests/agent/fileChat`

---

### Task 2: HTTP route

**Files:**
- Modify: `desktop/electron/agent/server.ts`
- Modify: `desktop/tests/workflow/server.test.ts`

- [ ] **Step 1:** Failing test POST `/v1/workspace/file-chat` returns SSE `done` (mock API key + agent)
- [ ] **Step 2:** Wire route: parse body, validate `paths`, stream events
- [ ] **Step 3:** Assert workflow `state.json` unchanged after file-chat
- [ ] **Step 4:** Run `cd desktop && pnpm test tests/workflow/server.test.ts`

---

### Task 3: Frontend client & routing

**Files:**
- Modify: `desktop/src/composables/useWorkflow.ts`
- Modify: `desktop/src/pages/WorkflowRun.vue`
- Create: `desktop/tests/pages/WorkflowRun.fileChat.test.ts` (or extend existing)

- [ ] **Step 1:** Add `fileChat(paths, message, skills?, stepId?)` async generator mirroring `runStep` SSE parse
- [ ] **Step 2:** `onStepSend`: if `attachments.length` → `fileChat` with paths from attachments; else `runStep`
- [ ] **Step 3:** Show **File mode** label in step chat header when `stepChatInputRef` has attachments OR track `fileModeActive` after send with attachments
- [ ] **Step 4:** Run `cd desktop && pnpm test`

---

### Task 4: Verification

- [ ] Run full desktop test suite: `cd desktop && pnpm test`
- [ ] Manual: fe-dev → Agent Rules → Add AGENTS.md → send with brainstorming → only AGENTS.md tools, no step gate change
