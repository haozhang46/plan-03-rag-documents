import { ref } from "vue";
import type { Thread } from "~/types";

export function useThreads() {
  const threads = ref<Thread[]>([]);
  const activeThreadId = ref<string | null>(null);
  const usingApi = ref(false);

  const sessionsApi = useSessions();

  function loadLocal() {
    try {
      const raw = localStorage.getItem("threads");
      if (raw) threads.value = JSON.parse(raw);
    } catch {
      threads.value = [];
    }
  }

  function saveLocal() {
    localStorage.setItem("threads", JSON.stringify(threads.value));
  }

  function syncFromSessions() {
    threads.value = sessionsApi.sessions.value.map((s) => ({
      id: s.threadId,
      sessionId: s.sessionId,
      title: s.title,
      starred: s.starred,
      updatedAt: s.updatedAt,
    }));
  }

  async function load() {
    const ok = await sessionsApi.load();
    usingApi.value = ok;
    if (ok) {
      syncFromSessions();
    } else {
      loadLocal();
    }
  }

  async function create(): Promise<string> {
    if (usingApi.value) {
      const session = await sessionsApi.create();
      syncFromSessions();
      activeThreadId.value = session.threadId;
      return session.threadId;
    }
    const id = crypto.randomUUID();
    threads.value.unshift({
      id,
      title: "New Chat",
      updatedAt: new Date().toISOString(),
    });
    activeThreadId.value = id;
    saveLocal();
    return id;
  }

  function updateTitle(threadId: string, title: string) {
    if (usingApi.value) {
      const session = sessionsApi.sessions.value.find(
        (s) => s.threadId === threadId,
      );
      if (session) {
        sessionsApi.updateTitle(session.sessionId, title).then(syncFromSessions);
      }
      return;
    }
    const t = threads.value.find((t) => t.id === threadId);
    if (t) {
      t.title = title.slice(0, 60);
      t.updatedAt = new Date().toISOString();
      saveLocal();
    }
  }

  async function remove(threadId: string) {
    if (usingApi.value) {
      const session = sessionsApi.sessions.value.find(
        (s) => s.threadId === threadId,
      );
      if (session) {
        await sessionsApi.remove(session.sessionId);
        syncFromSessions();
      }
    } else {
      threads.value = threads.value.filter((t) => t.id !== threadId);
      saveLocal();
    }
    localStorage.removeItem(`messages:${threadId}`);
    if (activeThreadId.value === threadId) {
      activeThreadId.value = threads.value[0]?.id ?? null;
    }
  }

  async function toggleStar(threadId: string) {
    if (usingApi.value) {
      const session = sessionsApi.sessions.value.find(
        (s) => s.threadId === threadId,
      );
      if (session) {
        await sessionsApi.toggleStar(session.sessionId);
        syncFromSessions();
      }
      return;
    }
    const t = threads.value.find((t) => t.id === threadId);
    if (t) {
      t.starred = !t.starred;
      saveLocal();
    }
  }

  return {
    threads,
    activeThreadId,
    usingApi,
    create,
    updateTitle,
    remove,
    toggleStar,
    load,
  };
}
