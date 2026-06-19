<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
  ChatInput,
  ChatMessage,
  useMessages,
  type ChatMessage as ChatMsg,
  type ToolEvent,
} from "@agent-flow/shared-ui";
import { useLocalChat } from "../composables/useLocalChat";
import WorkflowAgentRunPanel from "../components/workflow/WorkflowAgentRunPanel.vue";
import WorkflowArchitecturePanel from "../components/workflow/WorkflowArchitecturePanel.vue";
import WorkflowCicdPanel from "../components/workflow/WorkflowCicdPanel.vue";
import WorkflowCodeExplorer from "../components/workflow/WorkflowCodeExplorer.vue";
import WorkflowMarkdownPanel from "../components/workflow/WorkflowMarkdownPanel.vue";
import WorkflowConfigDrawer from "../components/workflow/WorkflowConfigDrawer.vue";
import WorkflowSidebar from "../components/workflow/WorkflowSidebar.vue";
import WorkflowTemplatePicker from "../components/workflow/WorkflowTemplatePicker.vue";
import {
  stepCodeRoot,
  stepPanelKind,
  stepReportPath,
  useWorkflow,
  type StepStatus,
  type TemplateSummary,
  type WorkflowDefinition,
  type WorkflowRunState,
  type WorkflowSummary,
} from "../composables/useWorkflow";

defineProps<{ workspace: string }>();

const workflowApi = useWorkflow();
const {
  fetchWorkflowList,
  fetchTemplates,
  fetchWorkflow,
  fetchState,
  fetchSkills,
  saveWorkflow,
  createFromTemplate,
  activateWorkflow,
  deleteWorkflow,
  advance,
  runStep,
  fetchPhase,
  fetchGates,
  fetchDeploymentConfig,
  fetchResourceContext,
  fetchTopology,
  listWorkspace,
  readWorkspaceFile,
  writeWorkspaceFile,
  deleteWorkspacePath,
} = workflowApi;

const workflows = ref<WorkflowSummary[]>([]);
const selectedWorkflowId = ref<string | null>(null);
const activeWorkflowId = ref<string | null>(null);
const showTemplatePicker = ref(false);
const showConfigDrawer = ref(false);
const configWorkflowId = ref<string | null>(null);
const configDefinition = ref<WorkflowDefinition | null>(null);
const templates = ref<TemplateSummary[]>([]);
const templatesLoading = ref(false);
const configSaving = ref(false);

const panelApi = {
  fetchPhase,
  fetchGates,
  fetchDeploymentConfig,
  fetchResourceContext,
  fetchTopology,
  listWorkspace,
  readWorkspaceFile,
  writeWorkspaceFile,
  deleteWorkspacePath,
};

const { streamChat } = useLocalChat();

const loading = ref(true);
const error = ref<string | null>(null);
const workflow = ref<WorkflowDefinition | null>(null);
const state = ref<WorkflowRunState | null>(null);
const allSkills = ref<string[]>([]);
const selectedSkills = ref<string[]>([]);
const viewingStepId = ref<string | null>(null);
const stepMessages = ref<Record<string, ChatMsg[]>>({});
const liveOutput = ref<Record<string, string>>({});
const running = ref(false);
const advancing = ref(false);
const actionError = ref<string | null>(null);
const chatMode = ref<"step" | "free">("step");

const CHAT_PERCENT_KEY = "workflow-chat-percent";
const CHAT_MIN_PERCENT = 20;
const CHAT_MAX_PERCENT = 70;
const resizeContainer = ref<HTMLElement | null>(null);
const chatPercent = ref(30);
const isResizing = ref(false);

const mainPanelWidth = computed(() => `calc(${100 - chatPercent.value}% - 4px)`);
const chatPanelWidth = computed(() => `${chatPercent.value}%`);

function loadChatPercent() {
  const stored = localStorage.getItem(CHAT_PERCENT_KEY);
  if (!stored) return;
  const value = Number(stored);
  if (Number.isFinite(value)) {
    chatPercent.value = Math.min(CHAT_MAX_PERCENT, Math.max(CHAT_MIN_PERCENT, value));
  }
}

function saveChatPercent() {
  localStorage.setItem(CHAT_PERCENT_KEY, String(chatPercent.value));
}

function onResizeMove(e: MouseEvent) {
  const el = resizeContainer.value;
  if (!el || !isResizing.value) return;
  const rect = el.getBoundingClientRect();
  const pct = ((rect.right - e.clientX) / rect.width) * 100;
  chatPercent.value = Math.min(CHAT_MAX_PERCENT, Math.max(CHAT_MIN_PERCENT, pct));
}

function stopResize() {
  if (!isResizing.value) return;
  isResizing.value = false;
  document.removeEventListener("mousemove", onResizeMove);
  document.removeEventListener("mouseup", stopResize);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
  saveChatPercent();
}

function startResize() {
  isResizing.value = true;
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
  document.addEventListener("mousemove", onResizeMove);
  document.addEventListener("mouseup", stopResize);
}

const freeThreadId = ref<string>(crypto.randomUUID());
const {
  messages: freeMessages,
  loading: freeLoading,
  addUserMessage: addFreeUserMessage,
  addAssistantChunk: addFreeAssistantChunk,
} = useMessages(freeThreadId);

const canOperateActive = computed(
  () =>
    selectedWorkflowId.value != null &&
    activeWorkflowId.value != null &&
    selectedWorkflowId.value === activeWorkflowId.value,
);

const sidebarSteps = computed(() => {
  if (!workflow.value || !state.value) return [];
  return workflow.value.steps.map((step) => ({
    id: step.id,
    title: step.title,
    status: (state.value!.stepStatuses[step.id] ?? "pending") as StepStatus,
  }));
});

const configWorkflowSummary = computed(
  () => workflows.value.find((w) => w.id === configWorkflowId.value) ?? null,
);

const activeWorkflowTitle = computed(() => {
  const active = workflows.value.find((w) => w.id === activeWorkflowId.value);
  return active?.title ?? workflow.value?.title ?? "Workflow";
});

const currentStep = computed(() => {
  const id = activeStepId.value;
  return workflow.value?.steps.find((s) => s.id === id) ?? null;
});

const currentPanel = computed(() => {
  const id = activeStepId.value;
  return id ? stepPanelKind(id) : "agent-run";
});

const currentStepMessages = computed(() => {
  const id = activeStepId.value;
  if (!id) return [];
  return stepMessages.value[id] ?? [];
});

const currentLiveOutput = computed(() => {
  const id = activeStepId.value;
  if (!id) return "";
  return liveOutput.value[id] ?? "";
});

const currentStepStatus = computed((): StepStatus => {
  const id = activeStepId.value;
  if (!id || !state.value) return "pending";
  return state.value.stepStatuses[id] ?? "pending";
});

const activeStepId = computed(() => viewingStepId.value ?? state.value?.currentStepId ?? null);

onMounted(() => {
  loadChatPercent();
  void loadData();
});

onUnmounted(stopResize);

watch(
  () => state.value?.currentStepId,
  (id) => {
    if (id && !viewingStepId.value) {
      viewingStepId.value = id;
    }
  },
);

async function loadSelectedWorkflow() {
  const id = selectedWorkflowId.value;
  if (!id) return;
  const [wf, st] = await Promise.all([fetchWorkflow(id), fetchState(id)]);
  workflow.value = wf;
  state.value = st;
  if (!viewingStepId.value || !wf.steps.some((s) => s.id === viewingStepId.value)) {
    viewingStepId.value = st.currentStepId;
  }
}

async function loadData() {
  loading.value = true;
  error.value = null;
  try {
    const [list, skills] = await Promise.all([fetchWorkflowList(), fetchSkills()]);
    workflows.value = list.workflows;
    activeWorkflowId.value = list.activeWorkflowId;
    selectedWorkflowId.value = list.activeWorkflowId;
    allSkills.value = skills;
    await loadSelectedWorkflow();
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

async function onSelectWorkflow(workflowId: string) {
  selectedWorkflowId.value = workflowId;
  try {
    await loadSelectedWorkflow();
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
  }
}

async function openTemplatePicker() {
  showTemplatePicker.value = true;
  templatesLoading.value = true;
  try {
    const res = await fetchTemplates();
    templates.value = res.templates;
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
  } finally {
    templatesLoading.value = false;
  }
}

async function onTemplateSelect(templateId: string) {
  showTemplatePicker.value = false;
  try {
    const { workflowId } = await createFromTemplate(templateId);
    const list = await fetchWorkflowList();
    workflows.value = list.workflows;
    activeWorkflowId.value = list.activeWorkflowId;
    selectedWorkflowId.value = workflowId;
    await loadSelectedWorkflow();
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
  }
}

async function openConfigDrawer(workflowId: string) {
  configWorkflowId.value = workflowId;
  showConfigDrawer.value = true;
  try {
    configDefinition.value = await fetchWorkflow(workflowId);
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
  }
}

async function onConfigSave(definition: WorkflowDefinition) {
  if (!configWorkflowId.value) return;
  configSaving.value = true;
  actionError.value = null;
  try {
    await saveWorkflow(configWorkflowId.value, definition);
    const list = await fetchWorkflowList();
    workflows.value = list.workflows;
    if (selectedWorkflowId.value === configWorkflowId.value) {
      await loadSelectedWorkflow();
    }
    showConfigDrawer.value = false;
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
  } finally {
    configSaving.value = false;
  }
}

async function onConfigActivate() {
  if (!configWorkflowId.value) return;
  try {
    await activateWorkflow(configWorkflowId.value);
    const list = await fetchWorkflowList();
    workflows.value = list.workflows;
    activeWorkflowId.value = list.activeWorkflowId;
    selectedWorkflowId.value = configWorkflowId.value;
    await loadSelectedWorkflow();
    showConfigDrawer.value = false;
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
  }
}

async function onConfigDelete() {
  if (!configWorkflowId.value) return;
  try {
    await deleteWorkflow(configWorkflowId.value);
    const list = await fetchWorkflowList();
    workflows.value = list.workflows;
    activeWorkflowId.value = list.activeWorkflowId;
    selectedWorkflowId.value = list.activeWorkflowId;
    showConfigDrawer.value = false;
    await loadSelectedWorkflow();
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
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
  liveOutput.value[stepId] = (liveOutput.value[stepId] ?? "") + content;
}

function appendToolNote(stepId: string, event: ToolEvent, phase: "start" | "end") {
  const label =
    phase === "start"
      ? `\n\n> Tool **${event.name ?? "unknown"}** started…\n`
      : `\n> Tool **${event.name ?? "unknown"}** ${event.ok === false ? "failed" : "finished"}\n`;
  appendStepAssistant(stepId, label);
}

async function onAdvance(action: "continue" | "skip" | "retry") {
  if (!canOperateActive.value || !activeWorkflowId.value) {
    actionError.value = "Switch to the active workflow to run pipeline actions.";
    return;
  }
  advancing.value = true;
  actionError.value = null;
  try {
    state.value = await advance(action, activeWorkflowId.value);
    viewingStepId.value = state.value.currentStepId;
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
  } finally {
    advancing.value = false;
  }
}

async function onStepSend(text: string) {
  if (!canOperateActive.value || !activeWorkflowId.value) {
    actionError.value = "Switch to the active workflow to run steps.";
    return;
  }
  const stepId = activeStepId.value;
  if (!stepId) return;

  if (!stepMessages.value[stepId]) {
    stepMessages.value[stepId] = [];
  }
  stepMessages.value[stepId].push({ role: "user", content: text });
  liveOutput.value[stepId] = "";

  running.value = true;
  actionError.value = null;
  try {
    const skills = selectedSkills.value.length ? selectedSkills.value : undefined;
    for await (const event of runStep(stepId, skills, activeWorkflowId.value)) {
      if (event.type === "message") {
        const content = event.chunk.content ?? "";
        if (content) appendStepAssistant(stepId, content);
      } else if (event.type === "tool_start") {
        appendToolNote(stepId, event.event, "start");
      } else if (event.type === "tool_end") {
        appendToolNote(stepId, event.event, "end");
      }
    }
    state.value = await fetchState(activeWorkflowId.value);
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
        <span
          v-if="!canOperateActive"
          class="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded"
        >
          View only — active: {{ activeWorkflowTitle }}
        </span>
        <div class="ml-auto flex flex-wrap items-center gap-2">
          <button
            class="btn-primary text-xs py-1 px-3"
            :disabled="advancing || running || !canOperateActive"
            @click="onAdvance('continue')"
          >
            Continue
          </button>
          <button
            class="text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            :disabled="advancing || running || !canOperateActive"
            @click="onAdvance('skip')"
          >
            Skip
          </button>
          <button
            class="text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
            :disabled="advancing || running || !canOperateActive"
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
        <WorkflowSidebar
          :workflows="workflows"
          :steps="sidebarSteps"
          :selected-workflow-id="selectedWorkflowId"
          :active-workflow-id="activeWorkflowId"
          :viewing-step-id="activeStepId"
          @select-workflow="onSelectWorkflow"
          @config-workflow="openConfigDrawer"
          @select-step="selectStep"
          @add-workflow="openTemplatePicker"
        />

        <div ref="resizeContainer" class="flex flex-1 min-w-0 min-h-0">
          <main
            class="flex flex-col min-w-0 min-h-0 overflow-hidden border-r border-gray-200"
            :style="{ width: mainPanelWidth }"
          >
            <WorkflowMarkdownPanel
              v-if="currentPanel === 'markdown-doc'"
              :api="panelApi"
            />
            <WorkflowArchitecturePanel
              v-else-if="currentPanel === 'architecture'"
              :api="panelApi"
            />
            <WorkflowCodeExplorer
              v-else-if="currentPanel === 'code-explorer' && activeStepId"
              :api="panelApi"
              :root="stepCodeRoot(activeStepId)"
            />
            <WorkflowAgentRunPanel
              v-else-if="currentPanel === 'agent-run' && activeStepId && currentStep"
              :api="panelApi"
              :step-id="activeStepId"
              :step-title="currentStep.title"
              :status="currentStepStatus"
              :report-path="stepReportPath(activeStepId)"
              :running="running && state.currentStepId === activeStepId"
              :live-output="currentLiveOutput"
            />
            <WorkflowCicdPanel
              v-else-if="currentPanel === 'cicd-config'"
              :api="panelApi"
            />
          </main>

          <div
            class="w-1 shrink-0 cursor-col-resize bg-gray-200 hover:bg-blue-400 active:bg-blue-500 transition-colors"
            title="Drag to resize chat panel"
            @mousedown.prevent="startResize"
          />

          <aside
            class="flex flex-col min-w-0 min-h-0 bg-white shrink-0"
            :style="{ width: chatPanelWidth }"
          >
            <div class="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
              <button
                class="text-xs px-2 py-1 rounded"
                :class="
                  chatMode === 'step'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                "
                @click="chatMode = 'step'"
              >
                Step Chat
              </button>
              <button
                class="text-xs px-2 py-1 rounded"
                :class="
                  chatMode === 'free'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                "
                @click="chatMode = 'free'"
              >
                Free Chat
              </button>
              <span
                v-if="chatMode === 'step' && currentStep"
                class="ml-auto text-[10px] text-gray-400 truncate max-w-[40%]"
              >
                {{ currentStep.title }}
              </span>
            </div>

            <div
              v-if="chatMode === 'step'"
              class="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50"
            >
              <span class="text-[10px] text-gray-500 self-center mr-1">Skills:</span>
              <button
                v-for="skill in allSkills"
                :key="skill"
                class="text-[10px] px-1.5 py-0.5 rounded-full border transition-colors"
                :class="
                  selectedSkills.includes(skill)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                "
                @click="toggleSkill(skill)"
              >
                {{ skill }}
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4 min-h-0">
              <template v-if="chatMode === 'step'">
                <ChatMessage
                  v-for="(msg, i) in currentStepMessages"
                  :key="`${activeStepId}-${i}`"
                  :msg="msg"
                />
                <div v-if="running" class="text-gray-400 text-xs">Running step…</div>
                <div
                  v-else-if="!currentStepMessages.length"
                  class="text-gray-400 text-xs"
                >
                  Chat with agent to run {{ currentStep?.title ?? "this step" }}.
                </div>
              </template>
              <template v-else>
                <ChatMessage v-for="(msg, i) in freeMessages" :key="i" :msg="msg" />
                <div v-if="freeLoading" class="text-gray-400 text-xs">Thinking…</div>
              </template>
            </div>

            <ChatInput
              v-if="chatMode === 'step'"
              :loading="running"
              :disabled="!canOperateActive"
              @send="onStepSend"
            />
            <ChatInput v-else :loading="freeLoading" @send="onFreeSend" />
          </aside>
        </div>
      </div>

      <WorkflowTemplatePicker
        :show="showTemplatePicker"
        :templates="templates"
        :loading="templatesLoading"
        @close="showTemplatePicker = false"
        @select="onTemplateSelect"
      />

      <WorkflowConfigDrawer
        :show="showConfigDrawer"
        :workflow="configWorkflowSummary"
        :definition="configDefinition"
        :saving="configSaving"
        @close="showConfigDrawer = false"
        @save="onConfigSave"
        @activate="onConfigActivate"
        @delete="onConfigDelete"
      />
    </template>
  </div>
</template>
