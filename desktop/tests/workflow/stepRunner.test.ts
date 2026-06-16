import { describe, it, expect, vi } from "vitest";
import type { StepContext, StepEvent } from "../../electron/executors/types";
import type { WorkflowDefinition } from "../../electron/workflow/types";

const mockRun = vi.fn(async function* (_ctx: StepContext): AsyncIterable<StepEvent> {
  yield { type: "message", content: "mock output" };
  yield { type: "done" };
});

vi.mock("../../electron/workflow/prompt", () => ({
  buildSystemPrompt: vi.fn().mockResolvedValue("system prompt"),
  renderPromptTemplate: vi.fn().mockResolvedValue("user prompt"),
}));

vi.mock("../../electron/executors/registry", () => ({
  registerExecutor: vi.fn(),
  getExecutor: vi.fn(() => ({
    id: "mock",
    run: mockRun,
  })),
}));

import { StepRunner } from "../../electron/workflow/stepRunner";

const testWorkflow: WorkflowDefinition = {
  version: 1,
  id: "test-workflow",
  title: "Test Workflow",
  steps: [
    {
      id: "step-a",
      title: "Step A",
      executor: "mock",
      agents_md: null,
      skills: [],
      prompt_template: "prompts/a.md",
      outputs: [],
      gate: "manual",
      requires_resources: [],
    },
    {
      id: "step-b",
      title: "Step B",
      executor: "mock",
      agents_md: null,
      skills: [],
      prompt_template: "prompts/b.md",
      outputs: [],
      gate: "manual",
      requires_resources: [],
    },
  ],
  edges: [{ from: "step-a", to: "step-b" }],
  resources: [],
};

describe("StepRunner", () => {
  it("initial state has first step pending", () => {
    const runner = new StepRunner("/tmp/project", testWorkflow, () => "test-key");
    const state = runner.getState();

    expect(state.workflowId).toBe("test-workflow");
    expect(state.currentStepId).toBe("step-a");
    expect(state.stepStatuses["step-a"]).toBe("pending");
    expect(state.stepStatuses["step-b"]).toBe("pending");
    expect(state.threadId).toBeTruthy();
  });

  it("runCurrentStep emits events and marks step done", async () => {
    const runner = new StepRunner("/tmp/project", testWorkflow, () => "test-key");
    const events: StepEvent[] = [];

    for await (const event of runner.runCurrentStep()) {
      events.push(event);
    }

    expect(events).toContainEqual({ type: "message", content: "mock output" });
    expect(events.at(-1)).toEqual({ type: "done" });

    const state = runner.getState();
    expect(state.stepStatuses["step-a"]).toBe("done");
    expect(state.currentStepId).toBe("step-a");
  });

  it("advance continue moves to next step", async () => {
    const runner = new StepRunner("/tmp/project", testWorkflow, () => "test-key");

    for await (const _ of runner.runCurrentStep()) {
      // drain
    }

    runner.advance("continue");

    const state = runner.getState();
    expect(state.currentStepId).toBe("step-b");
    expect(state.stepStatuses["step-a"]).toBe("done");
    expect(state.stepStatuses["step-b"]).toBe("pending");
  });

  it("advance skip marks skipped and moves on", async () => {
    const runner = new StepRunner("/tmp/project", testWorkflow, () => "test-key");

    runner.advance("skip");

    const state = runner.getState();
    expect(state.stepStatuses["step-a"]).toBe("skipped");
    expect(state.currentStepId).toBe("step-b");
  });

  it("advance retry resets step to pending", async () => {
    const runner = new StepRunner("/tmp/project", testWorkflow, () => "test-key");

    for await (const _ of runner.runCurrentStep()) {
      // drain
    }

    runner.advance("retry");

    const state = runner.getState();
    expect(state.stepStatuses["step-a"]).toBe("pending");
    expect(state.currentStepId).toBe("step-a");
  });
});
