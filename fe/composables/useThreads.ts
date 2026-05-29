import { ref } from "vue";
import type { Thread } from "~/types";

export function useThreads() {
  const threads = ref<Thread[]>([]);
  const activeThreadId = ref<string | null>(null);

  function load() {
    try {
      const raw = localStorage.getItem("threads");
      if (raw) threads.value = JSON.parse(raw);
    } catch {
      threads.value = [];
    }
  }

  function save() {
    localStorage.setItem("threads", JSON.stringify(threads.value));
  }

  function create(): string {
    const id = crypto.randomUUID();
    threads.value.unshift({
      id,
      title: "New Chat",
      updatedAt: new Date().toISOString(),
    });
    activeThreadId.value = id;
    save();
    return id;
  }

  function updateTitle(threadId: string, title: string) {
    const t = threads.value.find((t) => t.id === threadId);
    if (t) {
      t.title = title.slice(0, 60);
      t.updatedAt = new Date().toISOString();
      save();
    }
  }

  function remove(threadId: string) {
    threads.value = threads.value.filter((t) => t.id !== threadId);
    localStorage.removeItem(`messages:${threadId}`);
    if (activeThreadId.value === threadId) {
      activeThreadId.value = threads.value[0]?.id ?? null;
    }
    save();
  }

  load();

  return { threads, activeThreadId, create, updateTitle, remove, load };
}
