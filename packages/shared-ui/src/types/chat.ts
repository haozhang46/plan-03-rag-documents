export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
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
}
