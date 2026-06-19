import { describe, it, expect, vi } from "vitest";

vi.mock("../../electron/executor/runTool", () => ({
  runDesktopTool: vi.fn(async () => "ok"),
}));

import { buildDesktopLangChainTools, buildReadOnlyDesktopTools } from "../../electron/agent/tools";

describe("desktop agent tools", () => {
  const ctx = { workspaceRoot: "/tmp/ws" };

  it("full agent has run_shell and workspace tools", () => {
    const names = buildDesktopLangChainTools(ctx).map((t) => t.name);
    expect(names).toContain("run_shell");
    expect(names).toContain("workspace_get");
    expect(names).toContain("workspace_add_component");
    expect(names).toHaveLength(12);
  });

  it("read-only plan tools exclude run_shell and mutating workspace tools", () => {
    const names = buildReadOnlyDesktopTools(ctx).map((t) => t.name);
    expect(names).not.toContain("run_shell");
    expect(names).not.toContain("workspace_add_component");
    expect(names).toContain("workspace_get");
    expect(names).toEqual([
      "read_file",
      "list_dir",
      "git_status",
      "git_diff",
      "workspace_get",
      "workspace_list_registry",
    ]);
  });
});
