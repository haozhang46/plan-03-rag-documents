import { parseSseStream, type SseEvent } from "@agent-flow/shared-ui";
import type { ChatResponseChunk } from "@agent-flow/shared-ui";
import type { ChatMode } from "./useChatThreadMeta";

export type ChatStreamOptions = {
  mode: ChatMode;
  skills?: string[];
};

export type ChatStreamResult = {
  chunks: AsyncGenerator<ChatResponseChunk>;
  events: AsyncGenerator<SseEvent | { type: "plan_ready"; content: string }>;
};

async function apiBase(): Promise<string> {
  const port = await window.desktop.getSidecarPort();
  return `http://127.0.0.1:${port}`;
}

export function useLocalChat() {
  async function* streamChatEvents(
    threadId: string,
    message: string,
    options: ChatStreamOptions,
  ): AsyncGenerator<SseEvent | { type: "plan_ready"; content: string }> {
    const res = await fetch(`${await apiBase()}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: threadId,
        message,
        mode: options.mode,
        skills: options.skills?.length ? options.skills : undefined,
      }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let currentEvent = "message";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim();
          continue;
        }
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (currentEvent === "plan_ready") {
            yield { type: "plan_ready", content: String(data.content ?? "") };
          } else if (currentEvent === "done") {
            yield { type: "done" };
          } else if (currentEvent === "tool_start") {
            yield { type: "tool_start", event: data };
          } else if (currentEvent === "tool_end") {
            yield { type: "tool_end", event: data };
          } else {
            yield { type: "message", chunk: data as ChatResponseChunk };
          }
        } catch {
          // skip
        }
      }
    }
  }

  async function* streamChat(
    threadId: string,
    message: string,
    options: ChatStreamOptions = { mode: "agent" },
  ): AsyncGenerator<ChatResponseChunk> {
    for await (const event of streamChatEvents(threadId, message, options)) {
      if (event.type === "message") {
        yield event.chunk;
      }
    }
  }

  async function fetchSkillCatalog(): Promise<{ name: string; description: string }[]> {
    const res = await fetch(`${await apiBase()}/v1/skills?detailed=1`);
    if (!res.ok) throw new Error(`Skills fetch failed: ${res.status}`);
    return res.json() as Promise<{ name: string; description: string }[]>;
  }

  return { streamChat, streamChatEvents, fetchSkillCatalog };
}
