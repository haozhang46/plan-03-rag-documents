// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import type { ToolEvent, ToolRun } from "../src/types/chat";
import { applyToolEnd, upsertToolStart } from "../src/composables/useToolRuns";

describe("useToolRuns", () => {
  it("upsertToolStart adds a running run", () => {
    const event: ToolEvent = { call_id: "c1", name: "read_file" };
    const runs = upsertToolStart([], event);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toEqual({ callId: "c1", name: "read_file", status: "running" });
  });

  it("upsertToolStart updates existing callId", () => {
    const existing: ToolRun[] = [{ callId: "c1", name: "read_file", status: "done" }];
    const runs = upsertToolStart(existing, { call_id: "c1", name: "read_file" });
    expect(runs).toHaveLength(1);
    expect(runs[0]!.status).toBe("running");
  });

  it("applyToolEnd marks done when ok", () => {
    const runs: ToolRun[] = [{ callId: "c1", name: "read_file", status: "running" }];
    const next = applyToolEnd(runs, { call_id: "c1", name: "read_file", ok: true, output: "ok" });
    expect(next[0]!.status).toBe("done");
    expect(next[0]!.output).toBe("ok");
  });

  it("applyToolEnd marks error when ok is false", () => {
    const runs: ToolRun[] = [{ callId: "c1", name: "write_file", status: "running" }];
    const next = applyToolEnd(runs, { call_id: "c1", name: "write_file", ok: false, output: "denied" });
    expect(next[0]!.status).toBe("error");
  });

  it("uses fallback callId when call_id missing", () => {
    const runs = upsertToolStart([], { name: "list_dir" });
    expect(runs[0]!.callId).toMatch(/^list_dir-/);
  });
});
