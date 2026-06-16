import type { StepEvent } from "../executors/types";
import { loadWorkflow } from "./loader";
import { StepRunner } from "./stepRunner";
import type { WorkflowRunState } from "./state";

const runners = new Map<string, StepRunner>();

export async function getRunner(
  workspaceRoot: string,
  getApiKey: () => string | null,
): Promise<StepRunner> {
  let runner = runners.get(workspaceRoot);
  if (!runner) {
    const workflow = await loadWorkflow(workspaceRoot);
    runner = new StepRunner(workspaceRoot, workflow, getApiKey);
    runners.set(workspaceRoot, runner);
  }
  return runner;
}

export function clearRunner(workspaceRoot: string): void {
  runners.delete(workspaceRoot);
}

export async function getWorkflowState(
  workspaceRoot: string,
  getApiKey: () => string | null,
): Promise<WorkflowRunState> {
  const runner = await getRunner(workspaceRoot, getApiKey);
  return runner.getState();
}

export async function* runWorkflowStep(
  workspaceRoot: string,
  getApiKey: () => string | null,
  stepId?: string,
): AsyncIterable<StepEvent> {
  const runner = await getRunner(workspaceRoot, getApiKey);
  if (stepId) {
    runner.setCurrentStepId(stepId);
  }
  yield* runner.runCurrentStep();
}

export async function advanceWorkflow(
  workspaceRoot: string,
  getApiKey: () => string | null,
  action: "continue" | "skip" | "retry",
): Promise<WorkflowRunState> {
  const runner = await getRunner(workspaceRoot, getApiKey);
  runner.advance(action);
  return runner.getState();
}
