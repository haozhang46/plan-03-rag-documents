import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, watch } from "vue";
import { useRagDatasets } from "../composables/useRagDatasets";

describe("useRagDatasets", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { apiBase: "" },
    }));
    vi.stubGlobal("ref", ref);
    vi.stubGlobal("watch", watch);
  });

  it("loads datasets from API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          datasets: [{ id: "ds-1", name: "Wiki", permission: "team" }],
        }),
      }),
    );
    const { datasets, refresh } = useRagDatasets(ref("thread-1"));
    await refresh();
    expect(datasets.value[0].id).toBe("ds-1");
  });
});
