export type ToolRunStatus = "running" | "done" | "error";

export interface ToolRun {
  callId: string;
  name: string;
  status: ToolRunStatus;
  output?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  attachments?: string[];
  toolRuns?: ToolRun[];
}

export interface ChatResponseChunk {
  content?: string;
  citations?: string[];
  done?: boolean;
}

export interface ToolEvent {
  call_id?: string;
  name?: string;
  ok?: boolean;
  output?: string;
}

export type ChatAttachment = { path: string; label: string };
