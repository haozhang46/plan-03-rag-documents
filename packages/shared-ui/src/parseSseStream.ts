import type { ChatResponseChunk, ToolEvent } from "../types/chat";

export type SseEvent =
  | { type: "message"; chunk: ChatResponseChunk }
  | { type: "tool_start"; event: ToolEvent }
  | { type: "tool_end"; event: ToolEvent }
  | { type: "done" };

export async function* parseSseStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let currentEvent = "message";
  console.log("parseSseStream", body);
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
        if (currentEvent === "done") {
          yield { type: "done" };
        } else if (currentEvent === "tool_start") {
          yield { type: "tool_start", event: data as ToolEvent };
        } else if (currentEvent === "tool_end") {
          yield { type: "tool_end", event: data as ToolEvent };
        } else {
          yield { type: "message", chunk: data as ChatResponseChunk };
        }
      } catch {
        console.error("parseSseStream", line);
        // skip unparseable chunks
      }
    }
  }
}
