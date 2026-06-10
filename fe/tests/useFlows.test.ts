import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFlows } from "../composables/useFlows";

describe("useFlows", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: { apiBase: "" },
    }));
  });

  it("persists selected flow_id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          flows: [
            { flow_id: "default", title: "Default", description: "" },
            { flow_id: "knowledge-rag", title: "Knowledge", description: "" },
          ],
        }),
      }),
    );

    const { flowId, saveFlowId, refresh } = useFlows();
    await refresh();
    saveFlowId("knowledge-rag");
    expect(flowId.value).toBe("knowledge-rag");
    expect(localStorage.getItem("debug:flow_id")).toBe("knowledge-rag");
  });
});
