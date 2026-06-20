// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useWorkflow } from "../../src/composables/useWorkflow";

describe("useWorkflow fileChat", () => {
  beforeEach(() => {
    window.desktop = {
      getSidecarPort: vi.fn().mockResolvedValue(8765),
    } as unknown as typeof window.desktop;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("includes threadId and workflowId in POST body", async () => {
    let capturedBody: Record<string, unknown> | null = null;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: string | URL, init?: RequestInit) => {
        capturedBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode("event: done\ndata: {}\n\n"));
            controller.close();
          },
        });
        return new Response(stream, { status: 200 });
      }),
    );

    const { fileChat } = useWorkflow();
    const gen = fileChat(["docs/a.md"], "hello", ["brainstorming"], "prd", "thread-1", "wf-1");
    await gen.next();

    expect(capturedBody).toEqual({
      paths: ["docs/a.md"],
      message: "hello",
      skills: ["brainstorming"],
      stepId: "prd",
      threadId: "thread-1",
      workflowId: "wf-1",
    });
  });
});
