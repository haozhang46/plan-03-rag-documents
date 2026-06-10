import { ref, computed, watch } from "vue";
import type { ChatMessage } from "~/types";

export function useMessages(threadId: Ref<string | null>) {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);

  const storageKey = computed(() => `messages:${threadId.value}`);

  function load() {
    if (!threadId.value) return;
    try {
      const raw = localStorage.getItem(storageKey.value);
      if (raw) messages.value = JSON.parse(raw);
      else messages.value = [];
    } catch {
      messages.value = [];
    }
  }

  function save() {
    if (!threadId.value) return;
    localStorage.setItem(storageKey.value, JSON.stringify(messages.value));
  }

  watch(threadId, () => load(), { immediate: true });

  function addUserMessage(content: string) {
    messages.value.push({ role: "user", content });
    save();
  }

  function addAssistantChunk(content: string, citations?: string[]) {
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === "assistant") {
      last.content += content;
      if (citations) last.citations = citations;
    } else {
      messages.value.push({ role: "assistant", content, citations });
    }
    save();
  }

  return { messages, loading, load, addUserMessage, addAssistantChunk };
}
