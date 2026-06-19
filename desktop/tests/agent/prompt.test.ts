import { describe, it, expect } from "vitest";
import { buildChatSystemPrompt } from "../../electron/agent/prompt";

describe("buildChatSystemPrompt", () => {
  it("includes ask preamble", async () => {
    const prompt = await buildChatSystemPrompt("ask", "/tmp/project", []);
    expect(prompt).toContain("cannot use tools");
  });

  it("includes plan read-only guidance", async () => {
    const prompt = await buildChatSystemPrompt("plan", "/tmp/project", []);
    expect(prompt).toContain("read-only");
  });

  it("includes agent tooling preamble", async () => {
    const prompt = await buildChatSystemPrompt("agent", "/tmp/project", []);
    expect(prompt).toContain("autonomous dev agent");
    expect(prompt).toContain("workspace_*");
    expect(prompt).toContain("workspace_list_registry");
    expect(prompt).toContain("langflow-panel");
  });
});
