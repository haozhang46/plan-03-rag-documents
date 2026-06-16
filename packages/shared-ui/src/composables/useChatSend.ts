import type { Ref } from "vue";
import type { ChatResponseChunk } from "../types/chat";
import { useMessages } from "../useMessages";

export type UseChatSendOptions = {
  threadId: Ref<string | null>;
  streamChat: (
    threadId: string,
    message: string,
  ) => AsyncGenerator<ChatResponseChunk>;
  afterSend?: (threadId: string, message: string) => void | Promise<void>;
};

export function useChatSend(options: UseChatSendOptions) {
  const { messages, loading, addUserMessage, addAssistantChunk } = useMessages(
    options.threadId,
  );

  async function send(text: string) {
    const threadId = options.threadId.value;
    if (!threadId) return;

    addUserMessage(text);
    loading.value = true;
    try {
      for await (const chunk of options.streamChat(threadId, text)) {
        if (chunk.content) {
          addAssistantChunk(chunk.content, chunk.citations);
        }
      }
      await options.afterSend?.(threadId, text);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      addAssistantChunk(`Error: ${message}`);
    } finally {
      loading.value = false;
    }
  }

  return { messages, loading, send, addUserMessage, addAssistantChunk };
}
