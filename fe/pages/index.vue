<template>
  <div class="flex flex-1 min-h-0">
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
        <!-- Trace link -->
        <div v-if="traceUrl" class="px-6 py-1 text-xs text-blue-500">
          <a :href="traceUrl" target="_blank" rel="noopener">Open trace in Langfuse →</a>
        </div>

        <!-- Tool runs -->
        <div v-if="toolRuns.length" class="px-6 py-2 space-y-1">
          <div
            v-for="run in toolRuns"
            :key="run.callId"
            class="text-xs text-gray-500 flex items-center gap-2"
          >
            <span :class="run.status === 'running' ? 'text-yellow-500' : 'text-green-500'">●</span>
            <span class="font-medium">{{ run.name }}</span>
            <span v-if="run.status === 'running'">running...</span>
            <span v-else-if="run.output" class="truncate max-w-xs">{{ run.output.slice(0, 200) }}</span>
          </div>
        </div>

        <!-- Token usage -->
        <div v-if="tokenUsage" class="px-6 py-1 text-xs text-gray-400">
          {{ tokenUsage.input }} in / {{ tokenUsage.output }} out · {{ tokenUsage.model }}
        </div>
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

const traceUrl = ref<string>("");
const toolRuns = ref<Array<{ callId: string; name: string; status: string; output?: string }>>([]);
const tokenUsage = ref<{ input: number; output: number; model: string } | null>(null);

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
  traceUrl.value = "";
  toolRuns.value = [];
  tokenUsage.value = null;

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
    for await (const event of gen) {
      switch (event.type) {
        case "message":
          addAssistantChunk(event.content, event.citations);
          break;
        case "trace":
          traceUrl.value = event.event.langfuse_url;
          break;
        case "tool_start":
          toolRuns.value.push({
            callId: event.event.call_id,
            name: event.event.name,
            status: "running",
          });
          break;
        case "tool_end": {
          const run = toolRuns.value.find(r => r.callId === event.event.call_id);
          if (run) {
            run.status = "done";
            run.output = typeof event.event.output === "string"
              ? event.event.output
              : JSON.stringify(event.event.output);
          }
          break;
        }
        case "usage":
          tokenUsage.value = {
            input: event.event.input_tokens,
            output: event.event.output_tokens,
            model: event.event.model,
          };
          break;
        case "done":
          break;
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
