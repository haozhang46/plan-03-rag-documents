<template>
  <div class="flex h-full">
    <!-- sidebar -->
    <aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
      <DebugToolbar
        :flows="flows"
        :flow-id="flowId"
        :skills="skills"
        :selected-names="selectedSkillNames"
        :error="flowsError || skillsError"
        @flow-change="saveFlowId"
        @toggle-skill="toggleSkill"
      />
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <button class="btn-primary w-full" @click="newChat">+ New Chat</button>
      </div>
      <div class="flex-1 overflow-y-auto min-h-0">
        <div
          v-for="t in threads"
          :key="t.id"
          class="px-3 py-1 flex items-center gap-1 group"
        >
          <button
            class="flex-shrink-0 w-6 h-6 text-sm"
            :class="t.starred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'"
            :title="t.starred ? 'Unstar' : 'Star'"
            @click.stop="toggleStar(t.id)"
          >
            ★
          </button>
          <button
            class="flex-1 min-w-0 text-left px-2 py-2 rounded-lg text-sm truncate"
            :class="activeThreadId === t.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'"
            @click="selectThread(t.id)"
          >
            {{ t.title }}
          </button>
          <button
            class="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 text-sm"
            title="Delete"
            @click.stop="deleteThread(t.id)"
          >
            ×
          </button>
        </div>
      </div>

      <RagDatasetPanel
        :datasets="datasets"
        :selected-ids="selectedDatasetIds"
        :loading="datasetsLoading"
        :error="datasetsError"
        @refresh="refreshDatasets"
        @toggle-selected="toggleDataset"
        @select-all="selectAllDatasets"
        @clear-selection="clearDatasetSelection"
      />
    </aside>

    <!-- chat area -->
    <main class="flex-1 flex flex-col min-w-0">
      <div class="flex-1 overflow-y-auto p-6">
        <ChatMessage v-for="(msg, i) in messages" :key="i" :msg="msg" />
        <div v-if="loading" class="text-gray-400 text-sm">Thinking...</div>
      </div>
      <div
        v-if="flowId || selectedSkillNames.length || selectedDatasetIds.length"
        class="px-4 py-1.5 text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950 border-t border-green-200 dark:border-green-800"
      >
        <span v-if="flowId">flow: {{ flowId }}</span>
        <span v-if="selectedDatasetIds.length"> · RAG {{ selectedDatasetIds.length }} 库</span>
        <span v-if="selectedSkillNames.length"> · skills {{ selectedSkillNames.length }}</span>
      </div>
      <ChatInput :loading="loading" @send="onSend" />
    </main>
  </div>
</template>

<script setup lang="ts">
const { threads, activeThreadId, create, updateTitle, remove, toggleStar, load } =
  useThreads();
const { messages, loading, addUserMessage, addAssistantChunk } = useMessages(activeThreadId);
const { streamChat } = useChat();
const {
  flows,
  flowId,
  error: flowsError,
  refresh: refreshFlows,
  saveFlowId,
} = useFlows();
const {
  skills,
  selectedNames: selectedSkillNames,
  error: skillsError,
  refresh: refreshSkills,
  toggle: toggleSkill,
} = useSkillsPicker();
const {
  datasets,
  selectedIds: selectedDatasetIds,
  loading: datasetsLoading,
  error: datasetsError,
  refresh: refreshDatasets,
  toggleSelected: toggleDataset,
  selectAll: selectAllDatasets,
  clearSelection: clearDatasetSelection,
} = useRagDatasets(activeThreadId);

onMounted(async () => {
  await load();
  await Promise.all([refreshFlows(), refreshSkills(), refreshDatasets()]);
});

async function newChat() {
  await create();
}

function selectThread(id: string) {
  activeThreadId.value = id;
}

async function deleteThread(id: string) {
  await remove(id);
}

async function onSend(text: string) {
  if (!activeThreadId.value) await newChat();
  const threadId = activeThreadId.value!;
  addUserMessage(text);
  loading.value = true;

  try {
    const gen = streamChat(threadId, text, {
      flowId: flowId.value,
      skillNames: selectedSkillNames.value.length
        ? selectedSkillNames.value
        : undefined,
      datasetIds: selectedDatasetIds.value.length
        ? selectedDatasetIds.value
        : undefined,
    });
    for await (const chunk of gen) {
      if (chunk.content) {
        addAssistantChunk(chunk.content, chunk.citations);
      }
    }
    const lastMsg = messages.value[messages.value.length - 1];
    if (lastMsg?.role === "user") {
      updateTitle(threadId, text);
    }
  } catch (e) {
    addAssistantChunk(`Error: ${(e as Error).message}`);
  } finally {
    loading.value = false;
  }
}
</script>
