import { ref } from "vue";
import { useApiFetch } from "~/composables/useApiFetch";

export interface SessionItem {
  sessionId: string;
  threadId: string;
  title: string;
  starred: boolean;
  updatedAt: string;
}

interface ApiSession {
  id: string;
  thread_id: string;
  title: string;
  starred: boolean;
  created_at: string;
  updated_at: string;
}

function toSessionItem(s: ApiSession): SessionItem {
  return {
    sessionId: s.id,
    threadId: s.thread_id,
    title: s.title,
    starred: s.starred,
    updatedAt: s.updated_at,
  };
}

export function useSessions() {
  const config = useRuntimeConfig();
  const { apiFetch } = useApiFetch();
  const sessions = ref<SessionItem[]>([]);
  const apiAvailable = ref(false);

  async function load(): Promise<boolean> {
    try {
      const res = await apiFetch(`${config.public.apiBase}/v1/sessions`);
      if (!res.ok) return false;
      const data: ApiSession[] = await res.json();
      sessions.value = data.map(toSessionItem);
      apiAvailable.value = true;
      return true;
    } catch {
      apiAvailable.value = false;
      return false;
    }
  }

  async function create(title?: string): Promise<SessionItem> {
    const res = await apiFetch(`${config.public.apiBase}/v1/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(title ? { title } : {}),
    });
    if (!res.ok) throw new Error(`Create session failed: ${res.status}`);
    const data: ApiSession = await res.json();
    const item = toSessionItem(data);
    sessions.value.unshift(item);
    return item;
  }

  async function remove(sessionId: string): Promise<void> {
    const res = await apiFetch(
      `${config.public.apiBase}/v1/sessions/${sessionId}`,
      { method: "DELETE" },
    );
    if (!res.ok) throw new Error(`Delete session failed: ${res.status}`);
    sessions.value = sessions.value.filter((s) => s.sessionId !== sessionId);
  }

  async function toggleStar(sessionId: string): Promise<void> {
    const session = sessions.value.find((s) => s.sessionId === sessionId);
    if (!session) return;
    const res = await apiFetch(
      `${config.public.apiBase}/v1/sessions/${sessionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: !session.starred }),
      },
    );
    if (!res.ok) throw new Error(`Update session failed: ${res.status}`);
    const data: ApiSession = await res.json();
    const idx = sessions.value.findIndex((s) => s.sessionId === sessionId);
    if (idx >= 0) sessions.value[idx] = toSessionItem(data);
  }

  async function updateTitle(sessionId: string, title: string): Promise<void> {
    const res = await apiFetch(
      `${config.public.apiBase}/v1/sessions/${sessionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.slice(0, 60) }),
      },
    );
    if (!res.ok) throw new Error(`Update session failed: ${res.status}`);
    const data: ApiSession = await res.json();
    const idx = sessions.value.findIndex((s) => s.sessionId === sessionId);
    if (idx >= 0) sessions.value[idx] = toSessionItem(data);
  }

  return {
    sessions,
    apiAvailable,
    load,
    create,
    remove,
    toggleStar,
    updateTitle,
  };
}
