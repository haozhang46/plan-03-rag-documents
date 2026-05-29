<template>
  <div class="mb-4">
    <div v-if="msg.role === 'user'" class="flex justify-end">
      <div class="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3">
        <p class="whitespace-pre-wrap">{{ msg.content }}</p>
      </div>
    </div>
    <div v-else class="flex gap-3">
      <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center text-sm">
        AI
      </div>
      <div class="max-w-[80%]">
        <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 prose dark:prose-invert max-w-none" v-html="renderMarkdown(msg.content)" />
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
import type { ChatMessage } from "~/types";

const props = defineProps<{ msg: ChatMessage }>();

function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}
</script>
