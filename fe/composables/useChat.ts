import type { ChatResponseChunk } from "~/types";

export function useChat() {
  const config = useRuntimeConfig();

  async function* streamChat(
    threadId: string,
    message: string,
    documentIds?: string[],
    queryEmbedding?: number[],
  ): AsyncGenerator<ChatResponseChunk> {
    const res = await fetch(`${config.public.apiBase}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: threadId,
        message,
        document_ids: documentIds,
        query_embedding: queryEmbedding,
      }),
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
