# Desktop Chat Modes (Ask / Plan / Agent) + Slash Skills — Implementation Plan

> **For agentic workers:** Use subagent-driven-development or inline execution. Steps use checkbox syntax.

**Goal:** Add Ask/Plan/Agent modes and `/` skill picker to Desktop Chat.

**Spec:** `docs/superpowers/specs/2026-06-17-desktop-chat-modes-design.md`

**Status:** Implemented in working tree (2026-06-17)

---

## Tasks (completed)

- [x] Task 1: `buildChatSystemPrompt` + read-only tools + multi-mode `agentService`
- [x] Task 2: Extend `POST /v1/chat` with `mode` + `skills`; `GET /v1/skills?detailed=1`
- [x] Task 3: `useChatThreadMeta`, `useLocalChat` stream events + plan_ready
- [x] Task 4: `ChatInputWithSlash`, `PlanApprovalCard`, `Chat.vue` integration
- [x] Task 5: Unit tests (thread meta, prompt, tools)

**Verify:** `cd desktop && pnpm test`
