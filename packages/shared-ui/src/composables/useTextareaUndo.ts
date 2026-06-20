import { ref } from "vue";

type UseTextareaUndoOptions = {
  maxHistory?: number;
};

export function useTextareaUndo(options: UseTextareaUndoOptions = {}) {
  const maxHistory = options.maxHistory ?? 100;
  const history = ref<string[]>([""]);
  const index = ref(0);
  let applying = false;

  function record(value: string) {
    if (applying) return;
    if (history.value[index.value] === value) return;
    const next = history.value.slice(0, index.value + 1);
    next.push(value);
    if (next.length > maxHistory) next.shift();
    history.value = next;
    index.value = next.length - 1;
  }

  function undo(): string | null {
    if (index.value <= 0) return null;
    applying = true;
    index.value -= 1;
    const value = history.value[index.value] ?? "";
    applying = false;
    return value;
  }

  function redo(): string | null {
    if (index.value >= history.value.length - 1) return null;
    applying = true;
    index.value += 1;
    const value = history.value[index.value] ?? "";
    applying = false;
    return value;
  }

  function reset(value = "") {
    history.value = [value];
    index.value = 0;
  }

  return { record, undo, redo, reset };
}
