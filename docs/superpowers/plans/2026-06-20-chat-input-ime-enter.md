# Chat Input IME Enter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent Enter during IME composition from sending chat messages across all ChatInput components.

**Architecture:** Shared `useSubmitOnEnter` composable in `packages/shared-ui`; both `ChatInput.vue` and `ChatInputWithSlash.vue` bind composition + keydown handlers. `isComposing` primary check with composition-event fallback.

**Tech Stack:** Vue 3 Composition API, Vitest + happy-dom, TypeScript

**Spec:** `docs/superpowers/specs/2026-06-20-chat-input-ime-enter-design.md`

---

### Task 1: `useSubmitOnEnter` composable + unit tests

**Files:**
- Create: `packages/shared-ui/src/composables/useSubmitOnEnter.ts`
- Create: `packages/shared-ui/tests/useSubmitOnEnter.test.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/shared-ui/tests/useSubmitOnEnter.test.ts`:

```ts
// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { useSubmitOnEnter } from "../src/composables/useSubmitOnEnter";

describe("useSubmitOnEnter", () => {
  it("calls onSubmit on Enter when not composing", () => {
    const onSubmit = vi.fn();
    const { onEnterKeydown } = useSubmitOnEnter(onSubmit);

    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(e, "isComposing", { value: false });
    onEnterKeydown(e);

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("does not call onSubmit when isComposing is true", () => {
    const onSubmit = vi.fn();
    const { onEnterKeydown } = useSubmitOnEnter(onSubmit);

    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(e, "isComposing", { value: true });
    onEnterKeydown(e);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not call onSubmit during composition fallback", () => {
    const onSubmit = vi.fn();
    const { onCompositionStart, onEnterKeydown } = useSubmitOnEnter(onSubmit);

    onCompositionStart();
    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(e, "isComposing", { value: false });
    onEnterKeydown(e);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit after composition ends", () => {
    const onSubmit = vi.fn();
    const { onCompositionStart, onCompositionEnd, onEnterKeydown } = useSubmitOnEnter(onSubmit);

    onCompositionStart();
    onCompositionEnd();

    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(e, "isComposing", { value: false });
    onEnterKeydown(e);

    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/shared-ui && pnpm test tests/useSubmitOnEnter.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `packages/shared-ui/src/composables/useSubmitOnEnter.ts`:

```ts
import { ref } from "vue";

export function useSubmitOnEnter(onSubmit: () => void) {
  const composing = ref(false);

  function onCompositionStart() {
    composing.value = true;
  }

  function onCompositionEnd() {
    composing.value = false;
  }

  function onEnterKeydown(e: KeyboardEvent) {
    if (e.isComposing || composing.value) return;
    e.preventDefault();
    onSubmit();
  }

  return { onCompositionStart, onCompositionEnd, onEnterKeydown };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/shared-ui && pnpm test tests/useSubmitOnEnter.test.ts`
Expected: PASS (4 tests)

---

### Task 2: Wire composable into both ChatInput components

**Files:**
- Modify: `packages/shared-ui/src/components/ChatInput.vue`
- Modify: `packages/shared-ui/src/index.ts`
- Modify: `desktop/src/components/chat/ChatInputWithSlash.vue`

- [ ] **Step 1: Update shared ChatInput.vue**

In `<script setup>`, add import and destructure:

```ts
import { useSubmitOnEnter } from "../composables/useSubmitOnEnter";

const { onCompositionStart, onCompositionEnd, onEnterKeydown } = useSubmitOnEnter(send);
```

Note: `send` is defined below — move `useSubmitOnEnter(send)` call **after** the `send` function definition, or use a wrapper. Recommended pattern:

```ts
function send() {
  const trimmed = text.value.trim();
  if ((!trimmed && !attachments.value.length) || props.loading) return;
  emit("send", { text: trimmed, attachments: [...attachments.value] });
  text.value = "";
  attachments.value = [];
}

const { onCompositionStart, onCompositionEnd, onEnterKeydown } = useSubmitOnEnter(send);
```

In template, replace textarea bindings:

```vue
<textarea
  ...
  @compositionstart="onCompositionStart"
  @compositionend="onCompositionEnd"
  @keydown.enter.exact="onEnterKeydown"
  @input="autoResize"
/>
```

Remove `@keydown.enter.exact.prevent="send"`.

- [ ] **Step 2: Export composable from index.ts**

Add to `packages/shared-ui/src/index.ts`:

```ts
export { useSubmitOnEnter } from "./composables/useSubmitOnEnter";
```

- [ ] **Step 3: Update ChatInputWithSlash.vue**

Add import:

```ts
import { useSubmitOnEnter } from "@agent-flow/shared-ui";
```

After `send` function:

```ts
const { onCompositionStart, onCompositionEnd, onEnterKeydown } = useSubmitOnEnter(send);
```

Update textarea:

```vue
<textarea
  ...
  @compositionstart="onCompositionStart"
  @compositionend="onCompositionEnd"
  @keydown.enter.exact="onEnterKeydown"
  @input="onInput"
/>
```

- [ ] **Step 4: Run all shared-ui tests**

Run: `cd packages/shared-ui && pnpm test`
Expected: All tests PASS (including existing ChatInput.test.ts)

- [ ] **Step 5: Manual smoke check**

In desktop dev app, type Chinese pinyin in chat input, press Enter to confirm — message should NOT send. Press Enter again after composition — message should send.
