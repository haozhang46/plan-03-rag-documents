import { parseSseStream, type SseEvent } from "@agent-flow/shared-ui";

export type StepStatus = "pending" | "running" | "done" | "failed" | "skipped";

export interface WorkflowStep {
  id: string;
  title: string;
  executor: string;
  skills: string[];
  outputs: string[];
  gate?: string;
}

export interface WorkflowDefinition {
  version: 1;
  id: string;
  title: string;
  steps: WorkflowStep[];
  edges: { from: string; to: string }[];
  resources?: { type: string; name: string; optional?: boolean }[];
}

export interface WorkflowRunState {
  workflowId: string;
  currentStepId: string;
  stepStatuses: Record<string, StepStatus>;
  threadId: string;
}

async function apiBase(): Promise<string> {
  const port = await window.desktop.getSidecarPort();
  return `http://127.0.0.1:${port}`;
}

export function useWorkflow() {
  async function fetchWorkflow(): Promise<WorkflowDefinition> {
    const res = await fetch(`${await apiBase()}/v1/workflows/current`);
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Failed to load workflow (${res.status}): ${detail}`);
    }
    return res.json() as Promise<WorkflowDefinition>;
  }

  async function fetchState(): Promise<WorkflowRunState> {
    const res = await fetch(`${await apiBase()}/v1/workflow/state`);
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Failed to load workflow state (${res.status}): ${detail}`);
    }
    return res.json() as Promise<WorkflowRunState>;
  }

  async function fetchSkills(): Promise<string[]> {
    const res = await fetch(`${await apiBase()}/v1/skills`);
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Failed to load skills (${res.status}): ${detail}`);
    }
    return res.json() as Promise<string[]>;
  }

  async function advance(
    action: "continue" | "skip" | "retry",
  ): Promise<WorkflowRunState> {
    const res = await fetch(`${await apiBase()}/v1/workflow/advance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Advance failed (${res.status}): ${detail}`);
    }
    return res.json() as Promise<WorkflowRunState>;
  }

  async function* runStep(
    stepId?: string,
    skills?: string[],
  ): AsyncGenerator<SseEvent> {
    const body: Record<string, unknown> = {};
    if (stepId) body.stepId = stepId;
    if (skills?.length) body.skills = skills;

    const res = await fetch(`${await apiBase()}/v1/workflow/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Workflow run failed: ${res.status}`);
    }

    yield* parseSseStream(res.body);
  }

  return { fetchWorkflow, fetchState, fetchSkills, advance, runStep };
}
