import { randomUUID } from "node:crypto";
import type { WorkflowDefinition } from "./types";

export type StepStatus = "pending" | "running" | "done" | "failed" | "skipped";

export interface WorkflowRunState {
  workflowId: string;
  currentStepId: string;
  stepStatuses: Record<string, StepStatus>;
  threadId: string;
}

const runs = new Map<string, WorkflowRunState>();

export function createInitialState(workflow: WorkflowDefinition): WorkflowRunState {
  const stepStatuses: Record<string, StepStatus> = {};
  for (const step of workflow.steps) {
    stepStatuses[step.id] = "pending";
  }

  return {
    workflowId: workflow.id,
    currentStepId: workflow.steps[0].id,
    stepStatuses,
    threadId: randomUUID(),
  };
}

export function saveRunState(state: WorkflowRunState): void {
  runs.set(state.threadId, state);
}

export function loadRunState(threadId: string): WorkflowRunState | undefined {
  const state = runs.get(threadId);
  if (!state) {
    return undefined;
  }
  return {
    ...state,
    stepStatuses: { ...state.stepStatuses },
  };
}

export function cloneRunState(state: WorkflowRunState): WorkflowRunState {
  return {
    ...state,
    stepStatuses: { ...state.stepStatuses },
  };
}
