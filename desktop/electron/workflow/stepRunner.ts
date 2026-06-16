import { getExecutor } from "../executors/registry";
import type { StepEvent } from "../executors/types";
import { buildSystemPrompt, renderPromptTemplate } from "./prompt";
import { cloneRunState, createInitialState, type WorkflowRunState } from "./state";
import type { WorkflowDefinition } from "./types";

export class StepRunner {
  private state: WorkflowRunState;

  constructor(
    private projectRoot: string,
    private workflow: WorkflowDefinition,
    private getApiKey: () => string | null,
  ) {
    this.state = createInitialState(workflow);
  }

  getState(): WorkflowRunState {
    return cloneRunState(this.state);
  }

  getNextStepId(currentId: string): string | null {
    const edge = this.workflow.edges.find((e) => e.from === currentId);
    return edge?.to ?? null;
  }

  async *runCurrentStep(): AsyncIterable<StepEvent> {
    const stepId = this.state.currentStepId;
    const step = this.workflow.steps.find((s) => s.id === stepId);
    if (!step) {
      throw new Error(`Unknown step: ${stepId}`);
    }

    this.state.stepStatuses[stepId] = "running";

    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.state.stepStatuses[stepId] = "failed";
      yield { type: "message", content: "Error: API key not configured" };
      yield { type: "done" };
      return;
    }

    try {
      const systemPrompt = await buildSystemPrompt(step.agents_md, step.skills, this.projectRoot);
      const userPrompt = step.prompt_template
        ? await renderPromptTemplate(step.prompt_template, this.projectRoot)
        : step.title;

      const executor = getExecutor(step.executor);
      const ctx = {
        workspaceRoot: this.projectRoot,
        stepId,
        systemPrompt,
        userPrompt,
        threadId: this.state.threadId,
        apiKey,
      };

      for await (const event of executor.run(ctx)) {
        yield event;
        if (event.type === "done") {
          this.state.stepStatuses[stepId] = "done";
          if (step.gate === "auto") {
            const next = this.getNextStepId(stepId);
            if (next) {
              this.state.currentStepId = next;
            }
          }
        }
      }
    } catch (err) {
      this.state.stepStatuses[stepId] = "failed";
      const message = err instanceof Error ? err.message : String(err);
      yield { type: "message", content: `Error: ${message}` };
      yield { type: "done" };
    }
  }

  advance(action: "continue" | "skip" | "retry"): void {
    const stepId = this.state.currentStepId;

    if (action === "retry") {
      this.state.stepStatuses[stepId] = "pending";
      return;
    }

    if (action === "skip") {
      this.state.stepStatuses[stepId] = "skipped";
    }

    const next = this.getNextStepId(stepId);
    if (next) {
      this.state.currentStepId = next;
    }
  }
}
