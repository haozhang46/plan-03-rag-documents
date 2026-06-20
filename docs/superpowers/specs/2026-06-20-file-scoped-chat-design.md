# File-Scoped Chat Design

**Date:** 2026-06-20  
**Status:** Approved

## Problem

In Workflow Step Chat, when a user adds a file via Agent Rules Editor (or similar) **Add to chat** and sends a message, the frontend expands file content and calls `POST /v1/workflow/run`. The backend **ignores** `message`, `skills`, and attachments. It always runs the full step prompt (e.g. `prompts/fe-dev.md` → implement `fe/`) with unrestricted tools. Users expect a **single-file** task (e.g. initialize `AGENTS.md` with brainstorming), not a full pipeline step.

## Goal

When Step Chat is sent **with file attachments**, run **File Mode**: read/write only attached paths, inject selected skills, do not mutate workflow state or gates.

## Non-Goals

- Changing full step run semantics when there are no attachments
- Replacing Free Chat
- Directory-scoped exploration (attachments are files only in v1)

## Trigger

| Condition | Behavior |
|-----------|----------|
| `attachments.length > 0` on Step Chat send | File Mode |
| No attachments | Existing step run (`/v1/workflow/run`) |

## API

`POST /v1/workspace/file-chat` (SSE)

```typescript
{
  paths: string[];      // workspace-relative file paths
  message?: string;     // user text (may include expanded file blocks from frontend)
  skills?: string[];
  stepId?: string;      // optional, for thread isolation only
}
```

Response: same SSE event shape as workflow run (`message`, `tool_start`, `tool_end`, `done`).

## Executor

- **Model:** deepseek via LangGraph ReAct (same as step deepseek executor)
- **Tools:** `read_file`, `write_file` only, scoped to `paths` whitelist
- **recursionLimit:** 25

Path guard: reject read/write if normalized path is not exactly one of `paths` (v1: file paths only, no prefix directory scope).

## Prompts

**System:** file-mode preamble + allowed paths list + selected skill bodies (from `skills/` loader). Do not inject step `prompt_template` or `prior_phase`.

**User:** frontend `expandChatMessage` output (file blocks + user text).

## State Isolation

File Mode must not:

- Change `stepStatuses` or `currentStepId`
- Run gates or write `phases/`
- Call workflow advance

## UI

- `WorkflowRun.onStepSend`: if attachments → `fileChat()`; else → `runStep()`
- Step Chat header: show **File mode** badge when input has attachment chips (or last send had attachments)
- No changes to `AgentRulesEditorWidget` / `MarkdownFilePanel` add-to-chat flow

## Testing

- Unit: path whitelist for read/write tools
- Unit: `buildFileChatSystemPrompt` includes skills and path list
- HTTP: `POST /v1/workspace/file-chat` returns SSE without touching workflow state
- Frontend: `onStepSend` routes to file-chat when attachments present

## File Map

| Path | Responsibility |
|------|----------------|
| `desktop/electron/agent/fileChatTools.ts` | Scoped read/write LangChain tools |
| `desktop/electron/agent/fileChatService.ts` | File chat agent stream |
| `desktop/electron/agent/prompt.ts` | `buildFileChatSystemPrompt` |
| `desktop/electron/agent/server.ts` | Route handler |
| `desktop/src/composables/useWorkflow.ts` | `fileChat()` client |
| `desktop/src/pages/WorkflowRun.vue` | Routing + badge |
| `desktop/tests/agent/fileChat*.test.ts` | Unit tests |
