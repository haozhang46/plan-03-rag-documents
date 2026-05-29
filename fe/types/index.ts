export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

export interface ChatRequest {
  thread_id: string;
  message: string;
  document_ids?: string[];
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
}
