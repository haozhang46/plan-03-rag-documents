import type { StepEvent } from "../executors/types";
import {
  formatResourceContextForPrompt,
  resolveResources,
  type ResolvedResource,
} from "../resources/resolver";
import { loadWorkflow } from "./loader";
import { StepRunner } from "./stepRunner";
import type { WorkflowRunState } from "./state";

const runners = new Map<string, StepRunner>();

export async function getRunner(
  workspaceRoot: string,
  getApiKey: () => string | null,
  getResourceServerUrl?: () => string | null,
): Promise<StepRunner> {
  let runner = runners.get(workspaceRoot);
  if (!runner) {
    const workflow = await loadWorkflow(workspaceRoot);
    runner = new StepRunner(workspaceRoot, workflow, getApiKey, getResourceServerUrl);
    runners.set(workspaceRoot, runner);
  }
  return runner;
}

export function clearRunner(workspaceRoot: string): void {
  runners.delete(workspaceRoot);
}

export async function getResourceContext(
  workspaceRoot: string,
  getResourceServerUrl?: () => string | null,
): Promise<{ markdown: string; resources: ResolvedResource[] }> {
  const serverUrl = getResourceServerUrl?.() ?? undefined;
  const resources = await resolveResources(workspaceRoot, serverUrl ?? undefined);
  return {
    markdown: formatResourceContextForPrompt(resources),
    resources,
  };
}

export async function getWorkflowState(
  workspaceRoot: string,
  getApiKey: () => string | null,
  getResourceServerUrl?: () => string | null,
): Promise<WorkflowRunState> {
  const runner = await getRunner(workspaceRoot, getApiKey, getResourceServerUrl);
  return runner.getState();
}

export async function* runWorkflowStep(
  workspaceRoot: string,
  getApiKey: () => string | null,
  stepId?: string,
  getResourceServerUrl?: () => string | null,
): AsyncIterable<StepEvent> {
  const runner = await getRunner(workspaceRoot, getApiKey, getResourceServerUrl);
  if (stepId) {
    runner.setCurrentStepId(stepId);
  }
  yield* runner.runCurrentStep();
}

export async function advanceWorkflow(
  workspaceRoot: string,
  getApiKey: () => string | null,
  action: "continue" | "skip" | "retry",
  getResourceServerUrl?: () => string | null,
): Promise<WorkflowRunState> {
  const runner = await getRunner(workspaceRoot, getApiKey, getResourceServerUrl);
  runner.advance(action);
  return runner.getState();
}
