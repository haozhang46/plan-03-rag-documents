export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}

export interface ChatRequest {
  thread_id: string;
  message: string;
  document_ids?: string[];
  query_embedding?: number[];
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

export interface ChunkUpload {
  chunk_index: number;
  content: string;
  embedding: number[];
}

export interface CreateDocumentBody {
  filename: string;
  content_type: string;
  embedding_model: string;
  embedding_dimensions: number;
}
