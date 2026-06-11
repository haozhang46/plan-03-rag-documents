import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "~/stores/useAuthStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it("stores token after login", () => {
    const store = useAuthStore();
    store.setSession("tok-abc", {
      id: "u1",
      email: "a@b.com",
      tenant_id: "t1",
      display_name: "A",
    });
    expect(store.accessToken).toBe("tok-abc");
    expect(store.isAuthenticated).toBe(true);
  });
});
