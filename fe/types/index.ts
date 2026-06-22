export interface RagDataset {
  id: string;
  name: string;
  permission: string;
}

export interface FlowInfo {
  flow_id: string;
  title: string;
  description: string;
  default_skill_names?: string[];
}

export interface SkillInfo {
  name: string;
  description: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

export interface ChatRequest {
  flow_id?: string;
  thread_id: string;
  message: string;
  skill_names?: string[];
  document_ids?: string[];
  dataset_ids?: string[];
}

export interface ChatResponseChunk {
  content?: string;
  citations?: string[];
  done?: boolean;
}

export interface Thread {
  id: string;
  title: string;
  updatedAt: string;
  starred?: boolean;
  sessionId?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  tenant_id: string;
  display_name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export interface TraceEvent {
  trace_id: string;
  langfuse_url: string;
}

export interface UsageEvent {
  input_tokens: number;
  output_tokens: number;
  model: string;
}

export interface ToolCallEvent {
  call_id: string;
  name: string;
  input?: unknown;
  output?: unknown;
}

export type ChatStreamEvent =
  | { type: "message"; content: string; citations?: string[] }
  | { type: "trace"; event: TraceEvent }
  | { type: "usage"; event: UsageEvent }
  | { type: "tool_start"; event: ToolCallEvent }
  | { type: "tool_end"; event: ToolCallEvent }
  | { type: "done" };
