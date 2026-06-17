import { describe, it, expect } from "vitest";
import { buildDesktopLangChainTools, buildReadOnlyDesktopTools } from "../../electron/agent/tools";

describe("desktop agent tools", () => {
  const ctx = { workspaceRoot: "/tmp/ws" };

  it("full agent has run_shell", () => {
    const names = buildDesktopLangChainTools(ctx).map((t) => t.name);
    expect(names).toContain("run_shell");
    expect(names).toHaveLength(5);
  });

  it("read-only plan tools exclude run_shell", () => {
    const names = buildReadOnlyDesktopTools(ctx).map((t) => t.name);
    expect(names).not.toContain("run_shell");
    expect(names).toEqual(["read_file", "list_dir", "git_status", "git_diff"]);
  });
});
