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

export interface RagDocument {
  document_id: string;
  filename: string;
  content_type?: string;
  embedding_model?: string;
  embedding_dimensions?: number;
  created_at?: string;
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
