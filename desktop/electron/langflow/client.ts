import type { LangflowConfig, LangflowFlowSummary } from "./types";

type FlowListItem = LangflowFlowSummary & {
  project_id?: string;
};

type LangflowFlowResponse = {
  id: string;
  name: string;
  updated_at?: string;
  data?: unknown;
  project_id?: string;
};

function buildHeaders(config: LangflowConfig, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  if (config.apiKey) {
    headers.set("x-api-key", config.apiKey);
  }
  return headers;
}

async function langflowFetch(
  config: LangflowConfig,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${config.baseUrl}${path}`;
  return fetch(url, {
    ...init,
    headers: buildHeaders(config, init?.headers),
  });
}

function parseFlowList(data: unknown): FlowListItem[] {
  if (Array.isArray(data)) {
    return data as FlowListItem[];
  }
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown[] }).items)) {
    return (data as { items: FlowListItem[] }).items;
  }
  return [];
}

export async function checkHealth(config: LangflowConfig): Promise<boolean> {
  try {
    const health = await langflowFetch(config, "/health", { method: "GET" });
    if (health.ok) {
      return true;
    }
  } catch {
    // fall through to flows probe
  }

  try {
    const flows = await langflowFetch(config, "/api/v1/flows/?page=1&size=1", { method: "GET" });
    return flows.ok;
  } catch {
    return false;
  }
}

export async function listFlows(
  config: LangflowConfig,
  projectId?: string,
): Promise<LangflowFlowSummary[]> {
  const params = new URLSearchParams({
    get_all: "true",
    page: "1",
    size: "100",
  });
  if (projectId) {
    params.set("project_id", projectId);
  }

  const res = await langflowFetch(config, `/api/v1/flows/?${params.toString()}`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to list Langflow flows: ${res.status}`);
  }

  const data = await res.json();
  return parseFlowList(data).map(({ id, name, updated_at }) => ({ id, name, updated_at }));
}

async function listFlowsRaw(
  config: LangflowConfig,
  projectId?: string,
): Promise<FlowListItem[]> {
  const params = new URLSearchParams({
    get_all: "true",
    page: "1",
    size: "100",
  });
  if (projectId) {
    params.set("project_id", projectId);
  }

  const res = await langflowFetch(config, `/api/v1/flows/?${params.toString()}`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to list Langflow flows: ${res.status}`);
  }

  return parseFlowList(await res.json());
}

export async function createFlow(
  config: LangflowConfig,
  name: string,
  folderId?: string,
): Promise<LangflowFlowSummary> {
  const body: Record<string, unknown> = {
    name,
    data: { nodes: [], edges: [] },
  };
  if (folderId) {
    body.folder_id = folderId;
  }

  const res = await langflowFetch(config, "/api/v1/flows/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Failed to create Langflow flow: ${res.status}`);
  }

  const flow = (await res.json()) as LangflowFlowResponse;
  return { id: flow.id, name: flow.name, updated_at: flow.updated_at };
}

export async function getFlow(
  config: LangflowConfig,
  flowId: string,
): Promise<{ id: string; name: string; data: unknown }> {
  const res = await langflowFetch(config, `/api/v1/flows/${flowId}`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to get Langflow flow: ${res.status}`);
  }

  const flow = (await res.json()) as LangflowFlowResponse;
  return { id: flow.id, name: flow.name, data: flow.data ?? {} };
}

export async function createProject(
  config: LangflowConfig,
  name: string,
): Promise<string | undefined> {
  const res = await langflowFetch(config, "/api/v1/projects/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });

  if (res.status === 404) {
    const flows = await listFlowsRaw(config);
    return flows.find((flow) => flow.project_id)?.project_id;
  }

  if (!res.ok) {
    throw new Error(`Failed to create Langflow project: ${res.status}`);
  }

  const project = (await res.json()) as { id?: string };
  return project.id;
}
