import { beforeEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  vi.stubGlobal("useRuntimeConfig", () => ({
    public: { apiBase: "http://localhost:8000", defaultFlowId: "default" },
  }));
});
