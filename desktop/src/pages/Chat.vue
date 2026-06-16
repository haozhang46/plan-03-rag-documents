<script setup lang="ts">
import { watch } from "vue";
import { ChatInput, ChatMessage, useChatSend } from "@agent-flow/shared-ui";
import { useLocalChat } from "../composables/useLocalChat";
import { useDesktopThreads } from "../composables/useDesktopThreads";

const { threads, activeThreadId, create, select, updateTitle } =
  useDesktopThreads();
const { streamChat } = useLocalChat();

const { messages, loading, send } = useChatSend({
  threadId: activeThreadId,
  streamChat,
  afterSend: (threadId, text) => {
    const last = messages.value[messages.value.length - 1];
    if (last?.role === "user") {
      updateTitle(threadId, text);
    }
  },
});

watch(
  activeThreadId,
  (id) => {
    if (!id) create();
  },
  { immediate: true },
);

const workspace = defineModel<string>("workspace", { required: true });

function newChat() {
  create();
}

async function onSend(text: string) {
  if (!activeThreadId.value) create();
  await send(text);
}
</script>

<template>
  <div class="flex flex-1 min-h-0">
    <aside class="w-56 border-r border-gray-200 bg-gray-50 flex flex-col">
      <div class="p-3 border-b border-gray-200">
        <button class="btn-primary w-full text-sm" @click="newChat">+ New Chat</button>
      </div>
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="t in threads"
          :key="t.id"
          class="w-full text-left px-3 py-2 text-sm truncate hover:bg-gray-100"
          :class="activeThreadId === t.id ? 'bg-blue-50 text-blue-700' : ''"
          @click="select(t.id)"
        >
          {{ t.title }}
        </button>
      </div>
      <p class="p-2 text-xs text-gray-400 truncate border-t border-gray-200" :title="workspace">
        {{ workspace }}
      </p>
    </aside>

    <main class="flex-1 flex flex-col min-w-0">
      <div class="flex-1 overflow-y-auto p-6">
        <ChatMessage v-for="(msg, i) in messages" :key="i" :msg="msg" />
        <div v-if="loading" class="text-gray-400 text-sm">Thinking...</div>
      </div>
      <ChatInput :loading="loading" @send="onSend" />
    </main>
  </div>
</template>
