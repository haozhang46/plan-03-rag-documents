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

  return { composing, onCompositionStart, onCompositionEnd, onEnterKeydown };
}
