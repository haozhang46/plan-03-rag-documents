# Chat Input IME Enter Design

**Date:** 2026-06-20  
**Status:** Approved

## Problem

All chat textareas bind `@keydown.enter.exact.prevent="send"`. When using IME (Chinese/Japanese/Korean input), pressing Enter to confirm a candidate triggers send unintentionally.

## Scope

Fix **all ChatInput entry points**:

| Component | Path | Action |
|-----------|------|--------|
| Shared ChatInput | `packages/shared-ui/src/components/ChatInput.vue` | Wire composable |
| Desktop slash input | `desktop/src/components/chat/ChatInputWithSlash.vue` | Import same composable |
| FE wrapper | `fe/components/ChatInput.vue` | No change (uses shared-ui) |
| Desktop WorkflowRun | `desktop/src/pages/WorkflowRun.vue` | No change |
| Desktop Chat page | `desktop/src/pages/Chat.vue` | No change |
| FE index | `fe/pages/index.vue` | No change |

## Keyboard Behavior (unchanged)

| Input | Action |
|-------|--------|
| Enter (not composing) | Send message |
| Shift+Enter | Newline |
| Enter during IME composition | Confirm candidate only — **do not send** |
| Click Send / form submit | Send (unchanged) |

## Solution

Add `useSubmitOnEnter(onSubmit)` composable in `packages/shared-ui/src/composables/`:

- Check `KeyboardEvent.isComposing` on Enter keydown (primary)
- Track `compositionstart` / `compositionend` with a ref fallback (Electron edge cases)
- Call `preventDefault()` only when actually submitting
- Remove `.prevent` from template modifier; handler controls prevent

## Architecture

```
useSubmitOnEnter(send)
  ├── onCompositionStart → composing = true
  ├── onCompositionEnd   → composing = false
  └── onEnterKeydown(e)
        if (e.isComposing || composing) return
        e.preventDefault()
        onSubmit()
```

Both `ChatInput.vue` and `ChatInputWithSlash.vue` bind the three handlers on their `<textarea>`.

## Testing

Unit tests in `packages/shared-ui/tests/useSubmitOnEnter.test.ts`:

1. Enter with `isComposing=false` → calls onSubmit
2. Enter with `isComposing=true` → does not call onSubmit
3. After compositionstart, Enter → does not call onSubmit
4. After compositionend, Enter → calls onSubmit

Existing `ChatInput.test.ts` submit tests must continue passing.

## Non-Goals

- Changing Enter/Cmd+Enter send semantics
- Adding new keyboard shortcuts
- Fixing non-ChatInput textareas elsewhere
