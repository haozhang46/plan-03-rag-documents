import { parseSseStream } from "@agent-flow/shared-ui";
import type { ChatStreamEvent } from "~/types";
import { useApiFetch } from "~/composables/useApiFetch";

export function useChat() {
  const config = useRuntimeConfig();
  const { apiFetch } = useApiFetch();

  async function* streamChat(
    threadId: string,
    message: string,
    options?: {
      flowId?: string;
      skillNames?: string[];
      documentIds?: string[];
      datasetIds?: string[];
    },
  ): AsyncGenerator<ChatStreamEvent> {
    const body: Record<string, unknown> = {
      flow_id: options?.flowId ?? "default",
      thread_id: threadId,
      message,
    };
    if (options?.skillNames?.length) body.skill_names = options.skillNames;
    if (options?.documentIds?.length) body.document_ids = options.documentIds;
    if (options?.datasetIds?.length) body.dataset_ids = options.datasetIds;

    const res = await apiFetch(`${config.public.apiBase}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed: ${res.status}`);
    }

    for await (const event of parseSseStream(res.body)) {
      switch (event.type) {
        case "message":
          yield {
            type: "message",
            content: event.chunk.content ?? "",
            citations: event.chunk.citations,
          };
          break;
        case "trace":
          yield { type: "trace", event: event.event };
          break;
        case "usage":
          yield { type: "usage", event: event.event };
          break;
        case "tool_start":
          yield {
            type: "tool_start",
            event: {
              call_id: event.event.call_id ?? "",
              name: event.event.name ?? "unknown",
              input: event.event.input,
            },
          };
          break;
        case "tool_end":
          yield {
            type: "tool_end",
            event: {
              call_id: event.event.call_id ?? "",
              name: event.event.name ?? "unknown",
              output: event.event.output,
            },
          };
          break;
        case "done":
          yield { type: "done" };
          break;
      }
    }
  }

  return { streamChat };
}
