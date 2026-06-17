import { parseSseStream, type SseEvent } from "@agent-flow/shared-ui";

export type StepStatus = "pending" | "running" | "done" | "failed" | "skipped" | "gate_failed";

export interface WorkflowSummary {
  id: string;
  title: string;
  isLegacy: boolean;
  isActive?: boolean;
}

export interface TemplateSummary {
  id: string;
  title: string;
  source: "builtin" | "user";
}

export interface WorkflowListResponse {
  workflows: WorkflowSummary[];
  activeWorkflowId: string;
}

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

export interface WorkspaceEntry {
  name: string;
  path: string;
  type: "file" | "directory";
}

export interface GateResult {
  id: string;
  status: "PASS" | "FAIL" | "SKIP";
  message?: string;
}

export interface ResolvedResource {
  type: string;
  name: string;
  optional?: boolean;
  instance?: Record<string, string | number | undefined>;
}

export interface DeploymentConfig {
  platform: "docker-compose" | "kubernetes" | "unknown";
  nodeCount?: number;
  hasNginx: boolean;
  services: { name: string; image?: string; ports?: string[] }[];
  databases: { name: string; type: string; host?: string; port?: number }[];
  caches: { name: string; type: string; host?: string; port?: number }[];
  composeFile?: string;
  workflowFiles: string[];
}

async function apiBase(): Promise<string> {
  const port = await window.desktop.getSidecarPort();
  return `http://127.0.0.1:${port}`;
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${await apiBase()}${path}`, init);
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${path} failed (${res.status}): ${detail}`);
  }
  return res.json() as Promise<T>;
}

export function useWorkflow() {
  function workflowQuery(workflowId?: string): string {
    return workflowId ? `?workflowId=${encodeURIComponent(workflowId)}` : "";
  }

  async function fetchWorkflowList(): Promise<WorkflowListResponse> {
    return apiJson("/v1/workflows");
  }

  async function fetchTemplates(): Promise<{ templates: TemplateSummary[] }> {
    return apiJson("/v1/workflows/templates");
  }

  async function fetchWorkflow(workflowId?: string): Promise<WorkflowDefinition> {
    return apiJson(`/v1/workflows/current${workflowQuery(workflowId)}`);
  }

  async function fetchState(workflowId?: string): Promise<WorkflowRunState> {
    return apiJson(`/v1/workflow/state${workflowQuery(workflowId)}`);
  }

  async function saveWorkflow(
    workflowId: string,
    definition: WorkflowDefinition,
  ): Promise<WorkflowDefinition> {
    return apiJson(`/v1/workflows/${encodeURIComponent(workflowId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(definition),
    });
  }

  async function createFromTemplate(
    templateId: string,
    newId?: string,
  ): Promise<{ workflowId: string }> {
    return apiJson("/v1/workflows/from-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, newId }),
    });
  }

  async function activateWorkflow(workflowId: string): Promise<{ workflowId: string; active: boolean }> {
    return apiJson(`/v1/workflows/${encodeURIComponent(workflowId)}/activate`, {
      method: "POST",
    });
  }

  async function deleteWorkflow(workflowId: string): Promise<{ deleted: string }> {
    return apiJson(`/v1/workflows/${encodeURIComponent(workflowId)}`, {
      method: "DELETE",
    });
  }

  async function fetchSkills(): Promise<string[]> {
    return apiJson("/v1/skills");
  }

  async function fetchResourceContext(): Promise<{
    markdown: string;
    resources: ResolvedResource[];
  }> {
    return apiJson("/v1/resources/context");
  }

  async function fetchPhase(stepId: string): Promise<{ stepId: string; content: string | null }> {
    return apiJson(`/v1/workflow/phase?stepId=${encodeURIComponent(stepId)}`);
  }

  async function fetchGates(stepId: string): Promise<{ stepId: string; results: GateResult[] }> {
    return apiJson(`/v1/workflow/gates?stepId=${encodeURIComponent(stepId)}`);
  }

  async function fetchDeploymentConfig(): Promise<DeploymentConfig> {
    return apiJson("/v1/workspace/deployment");
  }

  async function listWorkspace(
    relPath: string,
    recursive = false,
  ): Promise<{ path: string; entries: WorkspaceEntry[] }> {
    const q = new URLSearchParams({ path: relPath });
    if (recursive) q.set("recursive", "1");
    return apiJson(`/v1/workspace/list?${q}`);
  }

  async function readWorkspaceFile(relPath: string): Promise<{ path: string; content: string }> {
    return apiJson(`/v1/workspace/file?path=${encodeURIComponent(relPath)}`);
  }

  async function writeWorkspaceFile(relPath: string, content: string): Promise<void> {
    await apiJson("/v1/workspace/file", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: relPath, content }),
    });
  }

  async function deleteWorkspacePath(relPath: string): Promise<void> {
    await apiJson(`/v1/workspace/file?path=${encodeURIComponent(relPath)}`, {
      method: "DELETE",
    });
  }

  async function advance(
    action: "continue" | "skip" | "retry",
    workflowId?: string,
  ): Promise<WorkflowRunState> {
    return apiJson("/v1/workflow/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, workflowId }),
    });
  }

  async function* runStep(
    stepId?: string,
    skills?: string[],
    workflowId?: string,
  ): AsyncGenerator<SseEvent> {
    const body: Record<string, unknown> = {};
    if (stepId) body.stepId = stepId;
    if (skills?.length) body.skills = skills;
    if (workflowId) body.workflowId = workflowId;

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

  return {
    fetchWorkflowList,
    fetchTemplates,
    fetchWorkflow,
    fetchState,
    saveWorkflow,
    createFromTemplate,
    activateWorkflow,
    deleteWorkflow,
    fetchSkills,
    fetchResourceContext,
    fetchPhase,
    fetchGates,
    fetchDeploymentConfig,
    listWorkspace,
    readWorkspaceFile,
    writeWorkspaceFile,
    deleteWorkspacePath,
    advance,
    runStep,
  };
}

export type StepPanelKind =
  | "markdown-doc"
  | "architecture"
  | "code-explorer"
  | "agent-run"
  | "cicd-config";

const STEP_PANEL_MAP: Record<string, StepPanelKind> = {
  prd: "markdown-doc",
  architecture: "architecture",
  "fe-dev": "code-explorer",
  "be-dev": "code-explorer",
  test: "agent-run",
  review: "agent-run",
  "test-2": "agent-run",
  cicd: "cicd-config",
};

export function stepPanelKind(stepId: string): StepPanelKind {
  return STEP_PANEL_MAP[stepId] ?? "agent-run";
}

export function stepCodeRoot(stepId: string): string {
  return stepId === "fe-dev" ? "fe" : "backend";
}

export function stepReportPath(stepId: string): string | null {
  const map: Record<string, string> = {
    test: "test-report.md",
    review: "review-notes.md",
    "test-2": "regression-report.md",
  };
  return map[stepId] ?? null;
}
