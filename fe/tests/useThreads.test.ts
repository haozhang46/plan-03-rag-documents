import { describe, it, expect, vi, beforeEach } from "vitest";
import { useThreads } from "../composables/useThreads";

describe("useThreads", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { apiBase: "http://localhost:8000" },
    }));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("offline")),
    );
  });

  it("creates a new thread with a UUID", async () => {
    const { threads, create, load } = useThreads();
    await load();
    const id = await create();
    expect(id).toBeTruthy();
    expect(threads.value.length).toBeGreaterThanOrEqual(1);
    expect(threads.value[0].id).toBe(id);
  });

  it("removes a thread", async () => {
    const { threads, create, remove, load } = useThreads();
    await load();
    const id = await create();
    expect(threads.value.length).toBeGreaterThanOrEqual(1);
    await remove(id);
    expect(threads.value.find((t) => t.id === id)).toBeUndefined();
  });
});
