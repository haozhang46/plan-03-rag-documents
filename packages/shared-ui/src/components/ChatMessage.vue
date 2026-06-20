<template>
  <div class="mb-4 min-w-0">
    <div v-if="msg.role === 'user'" class="flex justify-end min-w-0">
      <div class="max-w-[95%] min-w-0 bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 break-words">
        <div v-if="msg.attachments?.length" class="mb-2 flex flex-wrap gap-1">
          <span
            v-for="path in msg.attachments"
            :key="path"
            data-testid="message-attachment-chip"
            class="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full"
          >
            {{ path.split("/").pop() }}
          </span>
        </div>
        <p class="whitespace-pre-wrap break-words">{{ msg.content }}</p>
      </div>
    </div>
    <div v-else class="flex gap-3 min-w-0">
      <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center text-sm">
        AI
      </div>
      <div class="max-w-[95%] min-w-0">
        <div
          class="chat-message-content bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 prose dark:prose-invert max-w-none break-words"
        >
          <ToolActivityList v-if="msg.toolRuns?.length" :runs="msg.toolRuns" />
          <div v-html="renderMarkdown(msg.content)" />
        </div>
        <div v-if="msg.citations && msg.citations.length" class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="cite in msg.citations"
            :key="cite"
            class="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full"
          >
            {{ cite }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from "marked";
import type { ChatMessage } from "../types/chat";
import ToolActivityList from "./ToolActivityList.vue";

defineProps<{ msg: ChatMessage }>();

function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}
</script>

<style scoped>
.chat-message-content :deep(p),
.chat-message-content :deep(li),
.chat-message-content :deep(a),
.chat-message-content :deep(pre),
.chat-message-content :deep(code) {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.chat-message-content :deep(pre),
.chat-message-content :deep(code) {
  white-space: pre-wrap;
}

.chat-message-content :deep(pre) {
  max-width: 100%;
}
</style>
