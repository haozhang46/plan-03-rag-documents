# Chat Input Attachments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Auto-resize chat input (no max height) and Add-to-chat as file reference chips with send-time expansion.

**Architecture:** `ChatInput` holds attachment chips + text; emits `{ text, attachments }` on send. `expandChatMessage` reads files at send time. `ChatMessage` shows attachment paths in user bubbles.

**Spec:** `docs/superpowers/specs/2026-06-20-chat-input-attachments-design.md`

---

### Task 1: ChatInput attachments + auto-resize (shared-ui)

**Files:**
- Modify: `packages/shared-ui/src/components/ChatInput.vue`
- Modify: `packages/shared-ui/src/types/chat.ts` — export `ChatAttachment` type
- Modify: `packages/shared-ui/tests/ChatInput.test.ts`

**Changes to ChatInput.vue:**
- Remove `max-h-[200px]` from textarea
- `autoResize`: `el.style.height = el.scrollHeight + "px"` (no cap)
- Add `attachments = ref<ChatAttachment[]>([])`
- Chip row above textarea (like skills in ChatInputWithSlash): show `label`, remove button
- `addAttachment(item)`: dedupe by path, push if new
- `removeAttachment(path)`: filter out
- Remove `appendText`
- Change emit: `send: [payload: { text: string; attachments: ChatAttachment[] }]`
- Send enabled when `text.trim() || attachments.length`
- On send: emit payload, clear text + attachments, reset textarea height

**Export from types/chat.ts:**
```ts
export type ChatAttachment = { path: string; label: string };
```

**Tests to replace appendText tests:**
```ts
it("addAttachment shows chip and dedupes", async () => {
  const wrapper = mount(ChatInput, { props: { loading: false } });
  const vm = wrapper.vm as { addAttachment: (a: ChatAttachment) => void };
  vm.addAttachment({ path: "docs/a.md", label: "a.md" });
  vm.addAttachment({ path: "docs/a.md", label: "a.md" });
  await wrapper.vm.$nextTick();
  expect(wrapper.findAll('[data-testid="chat-attachment-chip"]').length).toBe(1);
});

it("send emits text and attachments", async () => {
  const wrapper = mount(ChatInput, { props: { loading: false } });
  const vm = wrapper.vm as { addAttachment: (a: ChatAttachment) => void };
  vm.addAttachment({ path: "docs/a.md", label: "a.md" });
  await wrapper.find("textarea").setValue("hello");
  await wrapper.find("form").trigger("submit.prevent");
  expect(wrapper.emitted("send")?.[0]?.[0]).toEqual({
    text: "hello",
    attachments: [{ path: "docs/a.md", label: "a.md" }],
  });
});
```

Run: `cd packages/shared-ui && pnpm test`

---

### Task 2: ChatMessage display + useMessages + expandChatMessage

**Files:**
- Modify: `packages/shared-ui/src/types/chat.ts` — add `attachments?: string[]` to ChatMessage
- Modify: `packages/shared-ui/src/components/ChatMessage.vue`
- Modify: `packages/shared-ui/src/useMessages.ts`
- Create: `desktop/src/utils/expandChatMessage.ts`
- Create: `desktop/tests/utils/expandChatMessage.test.ts`

**ChatMessage.vue** user bubble: if `msg.attachments?.length`, render chips above content with `data-testid="message-attachment-chip"`.

**useMessages.ts:**
```ts
function addUserMessage(content: string, attachments?: string[]) {
  messages.value.push({ role: "user", content, attachments });
  save();
}
```

**expandChatMessage.ts:**
```ts
import { formatFileForChat } from "./formatFileForChat";
import type { ChatAttachment } from "@agent-flow/shared-ui";

export async function expandChatMessage(
  text: string,
  attachments: ChatAttachment[],
  readFile: (path: string) => Promise<{ content: string }>,
): Promise<string> {
  const blocks: string[] = [];
  for (const a of attachments) {
    const file = await readFile(a.path);
    blocks.push(formatFileForChat(a.path, file.content));
  }
  const trimmed = text.trim();
  if (blocks.length && trimmed) return `${blocks.join("\n\n")}\n\n${trimmed}`;
  if (blocks.length) return blocks.join("\n\n");
  return trimmed;
}
```

Tests for expandChatMessage with mock readFile.

Run: `cd desktop && pnpm test tests/utils/expandChatMessage.test.ts`

---

### Task 3: WorkflowRun integration + ChatInputWithSlash height

**Files:**
- Modify: `desktop/src/pages/WorkflowRun.vue`
- Modify: `desktop/src/components/chat/ChatInputWithSlash.vue`

**WorkflowRun changes:**
- Ref type: `{ addAttachment: (a: ChatAttachment) => void }`
- `addFileToChat`: only `inputRef.value?.addAttachment(item)` — remove readWorkspaceFile/formatFileForChat
- `onStepSend(payload: { text, attachments })`: expand via expandChatMessage, then runStep; store user message with `content: payload.text`, `attachments: payload.attachments.map(a => a.path)`
- Same for `onFreeSend`
- Update `@send` handlers on ChatInput

**ChatInputWithSlash:** remove max-h-[200px] and Math.min cap in autoResize only.

Run: `cd desktop && pnpm test` — all 232+ tests pass.

**Do NOT git commit** unless user asks.
