import { describe, it, expect } from "vitest";
import { useThreads } from "../composables/useThreads";

describe("useThreads", () => {
  it("creates a new thread with a UUID", () => {
    const { threads, create } = useThreads();
    const id = create();
    expect(id).toBeTruthy();
    expect(threads.value.length).toBeGreaterThanOrEqual(1);
    expect(threads.value[0].id).toBe(id);
  });

  it("removes a thread", () => {
    const { threads, create, remove } = useThreads();
    const id = create();
    expect(threads.value.length).toBeGreaterThanOrEqual(1);
    remove(id);
    expect(threads.value.find((t) => t.id === id)).toBeUndefined();
  });
});
