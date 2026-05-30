<template>
  <div class="flex h-full">
    <!-- sidebar -->
    <aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <button class="btn-primary w-full" @click="newChat">+ New Chat</button>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div v-for="t in threads" :key="t.id" class="px-3 py-2">
          <button
            class="w-full text-left px-3 py-2 rounded-lg text-sm truncate"
            :class="activeThreadId === t.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'"
            @click="selectThread(t.id)"
          >
            {{ t.title }}
          </button>
        </div>
      </div>
    </aside>

    <!-- chat area -->
    <main class="flex-1 flex flex-col min-w-0">
      <div class="flex-1 overflow-y-auto p-6">
        <ChatMessage v-for="(msg, i) in messages" :key="i" :msg="msg" />
        <div v-if="loading" class="text-gray-400 text-sm">Thinking...</div>
      </div>
      <div class="flex items-center gap-2 px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <DocumentUpload @uploaded="onDocumentUploaded" />
      </div>
      <ChatInput :loading="loading" @send="onSend" />
    </main>
  </div>
</template>

<script setup lang="ts">
const { threads, activeThreadId, create, updateTitle } = useThreads();
const { messages, loading, addUserMessage, addAssistantChunk } = useMessages(activeThreadId);
const { streamChat, embedQuery } = useChat();

const documentIds = ref<string[]>([]);

function newChat() {
  documentIds.value = [];
  create();
}

function selectThread(id: string) {
  documentIds.value = [];
  activeThreadId.value = id;
}

function onDocumentUploaded(id: string) {
  documentIds.value.push(id);
}

async function onSend(text: string) {
  if (!activeThreadId.value) newChat();
  const threadId = activeThreadId.value!;
  addUserMessage(text);
  loading.value = true;

  try {
    const queryEmbedding = documentIds.value.length
      ? await embedQuery(text)
      : undefined;
    const gen = streamChat(
      threadId,
      text,
      documentIds.value.length ? documentIds.value : undefined,
      queryEmbedding,
    );
    for await (const chunk of gen) {
      if (chunk.content) {
        addAssistantChunk(chunk.content, chunk.citations);
      }
    }
    const lastMsg = messages.value[messages.value.length - 1];
    if (lastMsg?.role === "user") {
      updateTitle(threadId, text);
    }
    documentIds.value = [];
  } catch (e) {
    addAssistantChunk(`Error: ${(e as Error).message}`);
  } finally {
    loading.value = false;
  }
}
</script>
