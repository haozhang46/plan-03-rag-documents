# Chat Input Auto-Resize & File Reference Attachments — Design Spec

**Status:** Approved — 2026-06-20

**Builds on:** Add to chat (markdown file panel), `formatFileForChat` utility

## 1. Purpose

Two UX improvements for desktop chat:

1. **Auto-resize input** — textarea grows with content; `min-height` only, no `max-height` cap.
2. **Add to chat as reference** — UI shows file chips (not full content in input); file bodies are expanded client-side at send time before calling the API.

**User goal (confirmed):** Option **A** — send-time expansion. Input shows references; agent receives full file content in the message body.

**Not in scope:**

- Backend API schema changes (`attachments` field on `POST /v1/chat`) — deferred to future
- Chat.vue page add-to-chat from workspace panels (WorkflowRun only for v1)
- Attachment types beyond workspace markdown files

## 2. Problem Statement

| Issue | Current behavior | Desired |
|-------|------------------|---------|
| Input height | `max-h-[200px]`, `autoResize` capped at 200px | Grow freely from `min-h-[44px]` |
| Add to chat | Reads file, inserts full `--- path ---\n...\n--- end ---` block into textarea | Chip above input; expand only on Send |

## 3. Approach

### 3.1 Input auto-resize

Apply to both chat input components:

- `packages/shared-ui/src/components/ChatInput.vue` (WorkflowRun step + free chat)
- `desktop/src/components/chat/ChatInputWithSlash.vue` (Chat page)

Changes:

- Remove `max-h-[200px]` from textarea class
- `autoResize`: set `el.style.height = el.scrollHeight + "px"` (no `Math.min` cap)
- Keep `resize-none`, `min-h-[44px]`, `rows="1"`

If content is very long, the chat **aside** scrolls (messages area shrinks); textarea itself does not scroll internally unless we add `overflow-y: auto` later — v1: no internal scroll, panel flex layout absorbs growth.

### 3.2 File reference attachments

**UI model** (mirror existing Skills chips in `ChatInputWithSlash`):

```text
┌─ Chat input area ────────────────────┐
│ 📎 docs/PRD.md ×  📎 AGENTS.md ×     │  ← attachment chips
│ ┌──────────────────────────────────┐ │
│ │ User typed message...             │ │
│ └──────────────────────────────────┘ │
│                          [Send]      │
└──────────────────────────────────────┘
```

**State:**

```ts
type ChatAttachment = { path: string; label: string };
// ChatInput holds: text (ref) + attachments (ref[])
```

**Add to chat flow:**

1. `MarkdownFilePanel` → `panelApi.addToChat({ path, label })` (unchanged call site)
2. `WorkflowRun.addFileToChat` → `chatInputRef.addAttachment({ path, label })` — **no file read at add time**
3. Dedupe by `path` (adding same file twice is no-op)

**Send flow:**

1. User clicks Send → `ChatInput` emits `{ text: string, attachments: ChatAttachment[] }`
2. Parent (`WorkflowRun`) calls `expandAttachments(text, attachments)`:
   - For each attachment, `readWorkspaceFile(path)` + `formatFileForChat(path, content)`
   - Join: `[file blocks...]\n\n[user text]` (files first, then user text)
3. Expanded string goes to `runStep` / `streamChat` API
4. User message stored in history with **display-only** fields (see §4)

**Remove:** `appendText` for file content injection; replace with `addAttachment`.

## 4. Message History Display

Extend `ChatMessage` in `packages/shared-ui/src/types/chat.ts`:

```ts
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  attachments?: string[];  // file paths for user messages (display chips)
}
```

Update `ChatMessage.vue` user bubble:

- If `msg.attachments?.length`, render path chips above `msg.content`
- Do **not** show expanded file bodies in the bubble

`addUserMessage` signature extended to accept optional attachments:

```ts
addUserMessage(content: string, attachments?: string[])
```

WorkflowRun step chat and free chat pass attachment paths when recording user messages.

## 5. Component Changes

| File | Change |
|------|--------|
| `packages/shared-ui/src/components/ChatInput.vue` | Remove max-height; attachment chips; emit `{ text, attachments }`; expose `addAttachment` |
| `packages/shared-ui/src/types/chat.ts` | Add `attachments?` to `ChatMessage` |
| `packages/shared-ui/src/components/ChatMessage.vue` | Render attachment chips on user messages |
| `packages/shared-ui/src/useMessages.ts` | `addUserMessage(content, attachments?)` |
| `desktop/src/components/chat/ChatInputWithSlash.vue` | Same height fix (no attachments v1 unless wired later) |
| `desktop/src/pages/WorkflowRun.vue` | `addFileToChat` → `addAttachment`; send handlers expand attachments |
| `desktop/src/utils/expandChatMessage.ts` | New — `expandChatMessage(text, attachments, readFile)` |
| `desktop/src/utils/formatFileForChat.ts` | Keep — used at send-time only |

**Delete or deprecate:** `appendText` on `ChatInput` (replaced by `addAttachment`).

## 6. Data Flow

```text
Right-click "Add to chat"
  → addAttachment({ path, label })     // chip appears, no file read

User types + Send
  → emit { text, attachments }
  → expandChatMessage() reads files, builds full body
  → API receives expanded message
  → history stores { content: text, attachments: [paths] }
```

## 7. Error Handling

- If `readWorkspaceFile` fails at send time: show `actionError`, do not send; attachments remain for retry
- Empty text + attachments only: allow send (files-only message)
- Empty text + no attachments: disable Send (unchanged)

## 8. Testing

`cd desktop && pnpm test` + `cd packages/shared-ui && pnpm test`:

- `ChatInput`: autoResize without cap (scrollHeight > 200 grows height)
- `ChatInput`: `addAttachment` adds chip, dedupes path
- `ChatInput`: send emits `{ text, attachments }`, clears both
- `expandChatMessage`: joins file blocks + user text
- `ChatMessage`: renders attachment chips on user bubble
- `WorkflowRun` or unit test: `addFileToChat` calls `addAttachment`, not file read
- Update/remove tests for `appendText` / `formatFileForChat` in add-to-chat path

## 9. Success Criteria

- [ ] Textarea grows with input, no max-height
- [ ] Add to chat shows chip, not full file in textarea
- [ ] Send expands files into API message body
- [ ] User message bubble shows chips + user text, not file bodies
- [ ] Both `ChatInput` and `ChatInputWithSlash` height behavior updated
- [ ] All relevant tests pass

## 10. Future (out of scope)

- `POST /v1/chat` `attachments: [{ path }]` — backend reads fresh content (Option C)
- Chat.vue add-to-chat from file panels
- `@path` autocomplete in textarea
