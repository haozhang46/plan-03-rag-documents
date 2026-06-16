import { parseSseStream } from "@agent-flow/shared-ui";
import type { ChatResponseChunk } from "@agent-flow/shared-ui";

export function useLocalChat() {
  async function* streamChat(
    threadId: string,
    message: string,
  ): AsyncGenerator<ChatResponseChunk> {
    const port = await window.desktop.getSidecarPort();
    const res = await fetch(`http://127.0.0.1:${port}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        flow_id: "general-react",
        thread_id: threadId,
        message,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed: ${res.status}`);
    }

    for await (const event of parseSseStream(res.body)) {
      if (event.type === "message") {
        yield event.chunk;
      }
    }
  }

  return { streamChat };
}
