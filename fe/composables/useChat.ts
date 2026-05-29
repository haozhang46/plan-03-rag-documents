import type { ChatResponseChunk } from "~/types";

export function useChat() {
  const config = useRuntimeConfig();

  async function* streamChat(
    threadId: string,
    message: string,
    documentIds?: string[],
  ): AsyncGenerator<ChatResponseChunk> {
    const res = await fetch(`${config.public.apiBase}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: threadId,
        message,
        document_ids: documentIds,
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

  async function uploadDocument(
    file: File,
  ): Promise<{ document_id: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${config.public.apiBase}/v1/documents`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json();
  }

  return { streamChat, uploadDocument };
}
