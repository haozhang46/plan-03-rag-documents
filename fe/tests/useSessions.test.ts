import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSessions } from "../composables/useSessions";

describe("useSessions", () => {
  beforeEach(() => {
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { apiBase: "http://localhost:8000" },
    }));
  });

  it("lists sessions from API", async () => {
    const mockSessions = [
      {
        id: "s1",
        thread_id: "t1",
        title: "Chat 1",
        starred: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSessions),
      }),
    );

    const { sessions, load } = useSessions();
    await load();
    expect(sessions.value).toHaveLength(1);
    expect(sessions.value[0].threadId).toBe("t1");
    expect(sessions.value[0].title).toBe("Chat 1");
  });

  it("creates a session via API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            id: "s2",
            thread_id: "t2",
            title: "New Chat",
            starred: false,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          }),
      }),
    );

    const { create } = useSessions();
    const session = await create();
    expect(session.threadId).toBe("t2");
    expect(session.sessionId).toBe("s2");
  });
});
