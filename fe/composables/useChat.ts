import type { ChatResponseChunk } from "~/types";

export function useChat() {
  const config = useRuntimeConfig();

  async function* streamChat(
    threadId: string,
    message: string,
    options?: {
      flowId?: string;
      skillNames?: string[];
      documentIds?: string[];
      datasetIds?: string[];
      queryEmbedding?: number[];
    },
  ): AsyncGenerator<ChatResponseChunk> {
    const body: Record<string, unknown> = {
      flow_id: options?.flowId ?? "default",
      thread_id: threadId,
      message,
    };
    if (options?.skillNames?.length) {
      body.skill_names = options.skillNames;
    }
    if (options?.documentIds?.length) {
      body.document_ids = options.documentIds;
    }
    if (options?.datasetIds?.length) {
      body.dataset_ids = options.datasetIds;
    }
    if (options?.queryEmbedding) {
      body.query_embedding = options.queryEmbedding;
    }

    const res = await fetch(`${config.public.apiBase}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            yield JSON.parse(line.slice(6));
          } catch {
            // skip unparseable chunks
          }
        }
      }
    }
  }

  async function embedQuery(message: string): Promise<number[]> {
    const { embedText } = useOllamaEmbed();
    return embedText(message);
  }

  return { streamChat, embedQuery };
}
