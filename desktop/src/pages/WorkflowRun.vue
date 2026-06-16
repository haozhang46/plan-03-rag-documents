<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  ChatInput,
  ChatMessage,
  useMessages,
  type ChatMessage as ChatMsg,
  type ToolEvent,
} from "@agent-flow/shared-ui";
import { useLocalChat } from "../composables/useLocalChat";
import {
  useWorkflow,
  type StepStatus,
  type WorkflowDefinition,
  type WorkflowRunState,
} from "../composables/useWorkflow";

defineProps<{ workspace: string }>();

const { fetchWorkflow, fetchState, fetchSkills, advance, runStep } = useWorkflow();
const { streamChat } = useLocalChat();

const loading = ref(true);
const error = ref<string | null>(null);
const workflow = ref<WorkflowDefinition | null>(null);
const state = ref<WorkflowRunState | null>(null);
const allSkills = ref<string[]>([]);
const selectedSkills = ref<string[]>([]);
const centerMode = ref<"step" | "free">("step");
const viewingStepId = ref<string | null>(null);
const stepMessages = ref<Record<string, ChatMsg[]>>({});
const running = ref(false);
const advancing = ref(false);
const actionError = ref<string | null>(null);

const freeThreadId = ref<string>(crypto.randomUUID());
const {
  messages: freeMessages,
  loading: freeLoading,
  addUserMessage: addFreeUserMessage,
  addAssistantChunk: addFreeAssistantChunk,
} = useMessages(freeThreadId);

const currentStep = computed(() => {
  const id = viewingStepId.value ?? state.value?.currentStepId;
  return workflow.value?.steps.find((s) => s.id === id) ?? null;
});

const currentStepMessages = computed(() => {
  const id = viewingStepId.value ?? state.value?.currentStepId;
  if (!id) return [];
  return stepMessages.value[id] ?? [];
});

const statusLabel: Record<StepStatus, string> = {
  pending: "Pending",
  running: "Running",
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
};

const statusClass: Record<StepStatus, string> = {
  pending: "bg-gray-100 text-gray-600",
  running: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-yellow-100 text-yellow-800",
};

onMounted(() => {
  void loadData();
});

watch(
  () => state.value?.currentStepId,
  (id) => {
    if (id && !viewingStepId.value) {
      viewingStepId.value = id;
    }
  },
);

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    const [wf, st, skills] = await Promise.all([
      fetchWorkflow(),
      fetchState(),
      fetchSkills(),
    ]);
    workflow.value = wf;
    state.value = st;
    allSkills.value = skills;
    viewingStepId.value = st.currentStepId;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

function selectStep(stepId: string) {
  viewingStepId.value = stepId;
}

function toggleSkill(name: string) {
  const idx = selectedSkills.value.indexOf(name);
  if (idx >= 0) {
    selectedSkills.value.splice(idx, 1);
  } else {
    selectedSkills.value.push(name);
  }
}

function appendStepAssistant(stepId: string, content: string) {
  if (!stepMessages.value[stepId]) {
    stepMessages.value[stepId] = [];
  }
  const msgs = stepMessages.value[stepId];
  const last = msgs[msgs.length - 1];
  if (last?.role === "assistant") {
    last.content += content;
  } else {
    msgs.push({ role: "assistant", content });
  }
}

function appendToolNote(stepId: string, event: ToolEvent, phase: "start" | "end") {
  const label =
    phase === "start"
      ? `\n\n> Tool **${event.name ?? "unknown"}** started…\n`
      : `\n> Tool **${event.name ?? "unknown"}** ${event.ok === false ? "failed" : "finished"}\n`;
  appendStepAssistant(stepId, label);
}

async function onAdvance(action: "continue" | "skip" | "retry") {
  advancing.value = true;
  actionError.value = null;
  try {
    state.value = await advance(action);
    viewingStepId.value = state.value.currentStepId;
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
  } finally {
    advancing.value = false;
  }
}

async function onStepSend(text: string) {
  const stepId = viewingStepId.value ?? state.value?.currentStepId;
  if (!stepId) return;

  if (!stepMessages.value[stepId]) {
    stepMessages.value[stepId] = [];
  }
  stepMessages.value[stepId].push({ role: "user", content: text });

  running.value = true;
  actionError.value = null;
  try {
    const skills = selectedSkills.value.length ? selectedSkills.value : undefined;
    for await (const event of runStep(stepId, skills)) {
      if (event.type === "message") {
        const content = event.chunk.content ?? "";
        if (content) appendStepAssistant(stepId, content);
      } else if (event.type === "tool_start") {
        appendToolNote(stepId, event.event, "start");
      } else if (event.type === "tool_end") {
        appendToolNote(stepId, event.event, "end");
      }
    }
    state.value = await fetchState();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    appendStepAssistant(stepId, `\n\nError: ${message}`);
    actionError.value = message;
  } finally {
    running.value = false;
  }
}

async function onFreeSend(text: string) {
  addFreeUserMessage(text);
  freeLoading.value = true;
  try {
    for await (const chunk of streamChat(freeThreadId.value, text)) {
      if (chunk.content) {
        addFreeAssistantChunk(chunk.content, chunk.citations);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    addFreeAssistantChunk(`Error: ${message}`);
  } finally {
    freeLoading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-1 min-h-0 flex-col">
    <div
      v-if="loading"
      class="flex flex-1 items-center justify-center text-gray-500"
    >
      Loading workflow…
    </div>

    <div
      v-else-if="error"
      class="flex flex-1 flex-col items-center justify-center gap-3 p-8"
    >
      <p class="text-red-600">{{ error }}</p>
      <button class="btn-primary text-sm" @click="loadData">Retry</button>
    </div>

    <template v-else-if="workflow && state">
      <header
        class="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2"
      >
        <h1 class="text-sm font-semibold text-gray-800">{{ workflow.title }}</h1>
        <div class="ml-auto flex flex-wrap items-center gap-2">
          <button
            class="btn-primary text-xs py-1 px-3"
            :disabled="advancing || running"
            @click="onAdvance('continue')"
          >
            Continue
          </button>
          <button
            class="text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            :disabled="advancing || running"
            @click="onAdvance('skip')"
          >
            Skip
          </button>
          <button
            class="text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            :disabled="advancing || running"
            @click="onAdvance('retry')"
          >
            Retry
          </button>
        </div>
      </header>

      <p v-if="actionError" class="px-4 py-1 text-xs text-red-600 bg-red-50">
        {{ actionError }}
      </p>

      <div class="flex flex-1 min-h-0">
        <aside class="w-52 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div class="p-3 border-b border-gray-200">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Steps
            </p>
          </div>
          <div class="flex-1 overflow-y-auto">
            <button
              v-for="step in workflow.steps"
              :key="step.id"
              class="w-full text-left px-3 py-2 text-sm border-b border-gray-100 hover:bg-gray-100"
              :class="
                (viewingStepId ?? state.currentStepId) === step.id
                  ? 'bg-blue-50'
                  : ''
              "
              @click="selectStep(step.id)"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="truncate">{{ step.title }}</span>
                <span
                  class="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                  :class="statusClass[state.stepStatuses[step.id] ?? 'pending']"
                >
                  {{ statusLabel[state.stepStatuses[step.id] ?? "pending"] }}
                </span>
              </div>
            </button>
          </div>
        </aside>

        <main class="flex-1 flex flex-col min-w-0">
          <div class="flex items-center gap-2 border-b border-gray-200 px-4 py-2 bg-white">
            <button
              class="text-xs px-2 py-1 rounded"
              :class="
                centerMode === 'step'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              "
              @click="centerMode = 'step'"
            >
              Step Chat
            </button>
            <button
              class="text-xs px-2 py-1 rounded"
              :class="
                centerMode === 'free'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              "
              @click="centerMode = 'free'"
            >
              Free Chat
            </button>

            <div
              v-if="centerMode === 'step' && currentStep"
              class="ml-2 text-xs text-gray-500 truncate"
            >
              {{ currentStep.title }}
              <span v-if="currentStep.executor" class="text-gray-400">
                · {{ currentStep.executor }}
              </span>
            </div>
          </div>

          <div
            v-if="centerMode === 'step'"
            class="flex flex-wrap gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50"
          >
            <span class="text-xs text-gray-500 self-center mr-1">Skills:</span>
            <button
              v-for="skill in allSkills"
              :key="skill"
              class="text-xs px-2 py-0.5 rounded-full border transition-colors"
              :class="
                selectedSkills.includes(skill)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
              "
              @click="toggleSkill(skill)"
            >
              {{ skill }}
            </button>
            <span v-if="!allSkills.length" class="text-xs text-gray-400">
              No skills available
            </span>
          </div>

          <div v-if="centerMode === 'step'" class="flex-1 overflow-y-auto p-6">
            <ChatMessage
              v-for="(msg, i) in currentStepMessages"
              :key="`${viewingStepId}-${i}`"
              :msg="msg"
            />
            <div v-if="running" class="text-gray-400 text-sm">Running step…</div>
            <div
              v-else-if="!currentStepMessages.length"
              class="text-gray-400 text-sm"
            >
              Send a message to run {{ currentStep?.title ?? "this step" }}.
            </div>
          </div>

          <div v-else class="flex-1 overflow-y-auto p-6">
            <ChatMessage v-for="(msg, i) in freeMessages" :key="i" :msg="msg" />
            <div v-if="freeLoading" class="text-gray-400 text-sm">Thinking…</div>
          </div>

          <ChatInput
            v-if="centerMode === 'step'"
            :loading="running"
            @send="onStepSend"
          />
          <ChatInput v-else :loading="freeLoading" @send="onFreeSend" />
        </main>

        <aside class="w-56 border-l border-gray-200 bg-gray-50 flex flex-col">
          <div class="p-3 border-b border-gray-200">
            <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Outputs
            </p>
          </div>
          <div class="flex-1 overflow-y-auto p-3 space-y-3">
            <div v-if="currentStep?.outputs?.length">
              <p class="text-xs text-gray-500 mb-1">Expected files</p>
              <ul class="text-xs text-gray-700 space-y-1">
                <li v-for="out in currentStep.outputs" :key="out" class="truncate">
                  {{ out }}
                </li>
              </ul>
            </div>
            <div class="card p-3">
              <p class="text-xs font-medium text-gray-600 mb-1">Git status</p>
              <p class="text-xs text-gray-400 italic">Placeholder — coming soon</p>
            </div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>
