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
