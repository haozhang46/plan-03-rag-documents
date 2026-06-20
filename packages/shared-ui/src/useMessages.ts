import { computed, ref, watch, type Ref } from "vue";
import { applyToolEnd as mergeToolEnd, upsertToolStart } from "./composables/useToolRuns";
import type { ChatMessage, ToolEvent } from "./types/chat";

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

  function addUserMessage(content: string, attachments?: string[]) {
    messages.value.push({ role: "user", content, attachments });
    save();
  }

  function ensureAssistantShell() {
    const last = messages.value[messages.value.length - 1];
    if (last?.role !== "assistant") {
      messages.value.push({ role: "assistant", content: "", toolRuns: [] });
    } else if (!last.toolRuns) {
      last.toolRuns = [];
    }
  }

  function applyToolStart(event: ToolEvent) {
    if (!event || typeof event !== "object") return;
    ensureAssistantShell();
    const last = messages.value[messages.value.length - 1]!;
    last.toolRuns = upsertToolStart(last.toolRuns ?? [], event);
    save();
  }

  function applyToolEnd(event: ToolEvent) {
    if (!event || typeof event !== "object") return;
    ensureAssistantShell();
    const last = messages.value[messages.value.length - 1]!;
    last.toolRuns = mergeToolEnd(last.toolRuns ?? [], event);
    save();
  }

  function addAssistantChunk(content: string, citations?: string[]) {
    ensureAssistantShell();
    const last = messages.value[messages.value.length - 1]!;
    last.content += content;
    if (citations) last.citations = citations;
    save();
  }

  return {
    messages,
    loading,
    load,
    addUserMessage,
    addAssistantChunk,
    applyToolStart,
    applyToolEnd,
  };
}
