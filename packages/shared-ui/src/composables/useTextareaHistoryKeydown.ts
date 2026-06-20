import { nextTick, type Ref } from "vue";

type UseTextareaHistoryKeydownOptions = {
  composing: Ref<boolean>;
  text: Ref<string>;
  undo: () => string | null;
  redo: () => string | null;
  onResize?: () => void;
};

export function useTextareaHistoryKeydown({
  composing,
  text,
  undo,
  redo,
  onResize,
}: UseTextareaHistoryKeydownOptions) {
  function onHistoryKeydown(e: KeyboardEvent) {
    if (e.isComposing || composing.value) return;

    const key = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;

    if (key === "z" && !e.shiftKey) {
      const prev = undo();
      if (prev !== null) {
        e.preventDefault();
        text.value = prev;
        if (onResize) void nextTick(onResize);
      }
      return;
    }

    if (key === "y" || (key === "z" && e.shiftKey)) {
      const next = redo();
      if (next !== null) {
        e.preventDefault();
        text.value = next;
        if (onResize) void nextTick(onResize);
      }
    }
  }

  return { onHistoryKeydown };
}
