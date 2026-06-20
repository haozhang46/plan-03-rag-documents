<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
  ChatInput,
  ChatMessage,
  type ChatAttachment,
  type ToolEvent,
  type SseEvent,
} from "@agent-flow/shared-ui";
import { useLocalChat } from "../composables/useLocalChat";
import { useChatMemory } from "../composables/useChatMemory";
import ChatThreadSidebar from "../components/chat/ChatThreadSidebar.vue";
import { useWorkspaceConfig } from "../composables/useWorkspaceConfig";
import { expandChatMessage } from "../utils/expandChatMessage";
import { normalizeWorkspacePath } from "../utils/normalizeWorkspacePath";
import { parseWriteFilePath } from "../utils/parseWriteFilePath";
import WorkflowConfigDrawer from "../components/workflow/WorkflowConfigDrawer.vue";
import WorkspaceDesigner from "../components/workflow/WorkspaceDesigner.vue";
import WorkspaceApprovalCard from "../components/workflow/WorkspaceApprovalCard.vue";
import WorkflowSidebar from "../components/workflow/WorkflowSidebar.vue";
import WorkflowTemplatePicker from "../components/workflow/WorkflowTemplatePicker.vue";
import { getLegacyWorkspace } from "../workspace/legacyWorkspaces";
import WorkflowPanelRenderer from "../workspace/WorkflowPanelRenderer.vue";
import type { ChatFileAttachment, RuleFileEntry } from "../workspace/registryComponents";
import type { WorkspaceDefinition } from "../workspace/registry";
import { useWorkspaceApproval } from "../composables/useWorkspaceApproval";
import { parsePendingWorkspaceApproval } from "../workspace/workspaceApproval";
import {
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
const { fetchWorkspace, saveWorkspace } = useWorkspaceConfig();
const {
  fetchWorkflowList,
  fetchTemplates,
  fetchWorkflow,
  fetchState,
  fetchSkills,
  saveWorkflow,
  createFromTemplate,
  initWorkflow,
  activateWorkflow,
  deleteWorkflow,
  advance,
  runStep,
  fileChat,
  stepChat,
  fetchPhase,
  fetchGates,
  fetchDeploymentConfig,
  fetchResourceContext,
  fetchTopology,
  fetchOpsSummary,
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
const showWorkspaceDesigner = ref(false);
const configWorkflowId = ref<string | null>(null);
const configDefinition = ref<WorkflowDefinition | null>(null);
const templates = ref<TemplateSummary[]>([]);
const templatesLoading = ref(false);
const configSaving = ref(false);

const chatMode = ref<"step" | "free">("step");
const stepChatFileMode = ref(false);
const stepChatInputRef = ref<{ addAttachment: (a: ChatAttachment) => void } | null>(null);
const freeChatInputRef = ref<{ addAttachment: (a: ChatAttachment) => void } | null>(null);

function addFileToChat(item: ChatFileAttachment) {
  stepChatFileMode.value = true;
  const inputRef = chatMode.value === "step" ? stepChatInputRef : freeChatInputRef;
  inputRef.value?.addAttachment({
    path: item.path,
    label: item.label ?? item.path.split("/").pop() ?? item.path,
  });
}

async function persistRuleFiles(files: RuleFileEntry[], componentId: string) {
  const workflowId = activeWorkflowId.value;
  const stepId = activeStepId.value;
  const workspace = fetchedWorkspace.value;
  if (!workflowId || !stepId || !workspace) {
    throw new Error("Workspace not loaded");
  }

  const updated: WorkspaceDefinition = {
    ...workspace,
    components: workspace.components.map((comp) =>
      comp.id === componentId && comp.type === "agent-rules-editor"
        ? { ...comp, props: { ...comp.props, files } }
        : comp,
    ),
  };
  fetchedWorkspace.value = await saveWorkspace(workflowId, stepId, updated);
}

const fileWriteListeners = new Set<(path: string) => void>();

function notifyFileWritten(path: string) {
  const normalized = normalizeWorkspacePath(path);
  for (const fn of fileWriteListeners) fn(normalized);
}

function handleWriteFileToolEnd(event: ToolEvent) {
  if (event.name !== "write_file" || event.ok === false) return;
  const path = parseWriteFilePath(event.output);
  if (path) notifyFileWritten(path);
}

const panelApi = {
  fetchPhase,
  fetchGates,
  fetchDeploymentConfig,
  fetchResourceContext,
  fetchTopology,
  fetchOpsSummary,
  listWorkspace,
  readWorkspaceFile,
  writeWorkspaceFile,
  deleteWorkspacePath,
  addToChat: addFileToChat,
  persistRuleFiles,
  subscribeFileWrites: (fn) => {
    fileWriteListeners.add(fn);
    return () => fileWriteListeners.delete(fn);
  },
};

const { streamChatEvents } = useLocalChat();

const loading = ref(true);
const initLoading = ref(false);
const error = ref<string | null>(null);
const workflow = ref<WorkflowDefinition | null>(null);
const state = ref<WorkflowRunState | null>(null);
const allSkills = ref<string[]>([]);
const selectedSkills = ref<string[]>([]);
const viewingStepId = ref<string | null>(null);
const liveOutput = ref<Record<string, string>>({});
const running = ref(false);
const advancing = ref(false);
const actionError = ref<string | null>(null);

const WORKSPACE_MUTATING_TOOLS = new Set([
  "workspace_add_component",
  "workspace_update_component",
  "workspace_remove_component",
  "workspace_reorder",
  "workspace_set_layout",
]);

const fetchedWorkspace = ref<WorkspaceDefinition | null>(null);
const workspaceResolved = ref(false);

const {
  pending: pendingWorkspaceApproval,
  approvalError: workspaceApprovalError,
  approving: workspaceApproving,
  handleToolEndOutput,
  approvePending: onApproveWorkspaceChange,
  cancelPending: onCancelWorkspaceChange,
} = useWorkspaceApproval(async (workflowId, stepId) => {
  if (activeWorkflowId.value === workflowId) {
    await refreshWorkspaceForStep(workflowId, stepId);
  }
});

const CHAT_PERCENT_KEY = "workflow-chat-percent";
const CHAT_LIST_COLLAPSED_KEY = "workflow-chat-list-collapsed";
const CHAT_MIN_PERCENT = 20;
const CHAT_MAX_PERCENT = 70;
const resizeContainer = ref<HTMLElement | null>(null);
const chatPercent = ref(30);
const chatListCollapsed = ref(false);
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

function loadChatListCollapsed() {
  chatListCollapsed.value = localStorage.getItem(CHAT_LIST_COLLAPSED_KEY) === "true";
}

function saveChatListCollapsed() {
  localStorage.setItem(CHAT_LIST_COLLAPSED_KEY, String(chatListCollapsed.value));
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

const activeStepId = computed(() => viewingStepId.value ?? state.value?.currentStepId ?? null);

const stepChatMemory = useChatMemory({
  kind: "step",
  workflowId: activeWorkflowId,
  stepId: activeStepId,
});

const freeChatMemory = useChatMemory({
  kind: "free",
  workflowId: activeWorkflowId,
});

const freeSending = ref(false);

const activeChatMemory = computed(() =>
  chatMode.value === "step" ? stepChatMemory : freeChatMemory,
);

const activeChatThreads = computed(() => activeChatMemory.value.threads.value);
const activeChatThreadId = computed(() => activeChatMemory.value.activeThreadId.value);

async function ensureActiveChatThread() {
  const memory = activeChatMemory.value;
  if (memory.loading.value) return;
  if (memory.activeThreadId.value) return;
  if (memory.threads.value.length > 0) {
    await memory.selectThread(memory.threads.value[0]!.id);
    return;
  }
  const query =
    chatMode.value === "step"
      ? activeWorkflowId.value && activeStepId.value
      : activeWorkflowId.value;
  if (!query) return;
  try {
    await memory.createThread("New Chat");
  } catch {
    // scope not ready
  }
}

function onSelectChatThread(id: string) {
  void activeChatMemory.value.selectThread(id);
}

function onCreateChatThread() {
  void activeChatMemory.value.createThread("New Chat");
}

function activeThreadCheckpointId(): string | null {
  const memory = activeChatMemory.value;
  const id = memory.activeThreadId.value;
  if (!id) return null;
  return memory.threads.value.find((t) => t.id === id)?.checkpointThreadId ?? null;
}

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

const needsWorkflowInit = computed(
  () => !loading.value && !error.value && workflows.value.length === 0,
);

function isWorkflowSetupError(message: string): boolean {
  return (
    message.includes("Workflow not found") ||
    message.includes("No workflows configured") ||
    message.includes("/v1/workflow/state") ||
    message.includes("/v1/workflows/current")
  );
}

const showInitWorkflowAction = computed(
  () => needsWorkflowInit.value || (error.value != null && isWorkflowSetupError(error.value)),
);

const currentStep = computed(() => {
  const id = activeStepId.value;
  return workflow.value?.steps.find((s) => s.id === id) ?? null;
});

const resolvedWorkspace = computed(() => fetchedWorkspace.value);

const panelRuntime = computed(() => ({
  stepId: activeStepId.value ?? undefined,
  stepTitle: currentStep.value?.title,
  status: currentStepStatus.value,
  reportPath: activeStepId.value ? stepReportPath(activeStepId.value) : null,
  running: running.value && state.value?.currentStepId === activeStepId.value,
  liveOutput: currentLiveOutput.value,
}));

const currentStepMessages = computed(() => stepChatMemory.messages.value);
const freeChatMessages = computed(() => freeChatMemory.messages.value);

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

onMounted(() => {
  loadChatPercent();
  loadChatListCollapsed();
  void loadData();
});

watch(chatListCollapsed, saveChatListCollapsed);

watch(
  () => [chatMode.value, stepChatMemory.threads.value.length, freeChatMemory.threads.value.length] as const,
  () => {
    void ensureActiveChatThread();
  },
);

watch(
  () => stepChatMemory.loading.value || freeChatMemory.loading.value,
  (loading) => {
    if (!loading) void ensureActiveChatThread();
  },
);

onUnmounted(stopResize);

watch(
  () => state.value?.currentStepId,
  (id) => {
    if (id && !viewingStepId.value) {
      viewingStepId.value = id;
    }
  },
);

watch(
  () => [selectedWorkflowId.value, activeStepId.value] as const,
  async ([workflowId, stepId]) => {
    fetchedWorkspace.value = null;
    workspaceResolved.value = false;
    if (!workflowId || !stepId) {
      workspaceResolved.value = true;
      return;
    }
    try {
      fetchedWorkspace.value = await fetchWorkspace(workflowId, stepId);
    } catch {
      fetchedWorkspace.value = getLegacyWorkspace(stepId) ?? null;
    } finally {
      workspaceResolved.value = true;
    }
  },
  { immediate: true },
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
    allSkills.value = skills;
    if (list.workflows.length === 0) {
      workflow.value = null;
      state.value = null;
      selectedWorkflowId.value = null;
      return;
    }
    selectedWorkflowId.value = list.activeWorkflowId ?? list.workflows[0].id;
    await loadSelectedWorkflow();
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

async function initWorkflowConfig() {
  initLoading.value = true;
  error.value = null;
  try {
    await initWorkflow("default-dev-cicd");
    await loadData();
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    initLoading.value = false;
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

function openWorkspaceDesigner() {
  if (!selectedWorkflowId.value) return;
  showWorkspaceDesigner.value = true;
}

async function onWorkspaceSaved(definition: WorkspaceDefinition) {
  if (
    selectedWorkflowId.value &&
    activeStepId.value === definition.stepId
  ) {
    fetchedWorkspace.value = definition;
  }
  showWorkspaceDesigner.value = false;
}

function toggleSkill(name: string) {
  const idx = selectedSkills.value.indexOf(name);
  if (idx >= 0) {
    selectedSkills.value.splice(idx, 1);
  } else {
    selectedSkills.value.push(name);
  }
}

async function refreshWorkspaceForStep(workflowId: string, stepId: string) {
  try {
    fetchedWorkspace.value = await fetchWorkspace(workflowId, stepId);
  } catch {
    fetchedWorkspace.value = getLegacyWorkspace(stepId) ?? null;
  }
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

async function onStepSend(payload: { text: string; attachments: ChatAttachment[] }) {
  if (!canOperateActive.value || !activeWorkflowId.value) {
    actionError.value = "Switch to the active workflow to run steps.";
    return;
  }
  const stepId = activeStepId.value;
  if (!stepId) return;

  if (!stepChatMemory.activeThreadId.value) {
    await ensureActiveChatThread();
  }
  const threadId = stepChatMemory.activeThreadId.value;
  if (!threadId) return;

  let expanded: string;
  try {
    expanded = await expandChatMessage(payload.text, payload.attachments, readWorkspaceFile);
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
    return;
  }
  console.log("onStepSend", payload.text, payload.attachments, expanded);
  stepChatMemory.addUserMessage(
    payload.text,
    payload.attachments.map((a) => a.path),
  );
  liveOutput.value[stepId] = "";

  running.value = true;
  actionError.value = null;
  try {
    const skills = selectedSkills.value.length ? selectedSkills.value : undefined;
    const useFileChat = payload.attachments.length > 0;
    stepChatFileMode.value = useFileChat;

    let eventStream: AsyncGenerator<SseEvent>;
    if (useFileChat) {
      eventStream = fileChat(
        payload.attachments.map((a) => a.path),
        expanded,
        skills,
        stepId,
        threadId,
        activeWorkflowId.value,
      );
    } else {
      eventStream = stepChat(
        expanded,
        stepId,
        activeWorkflowId.value,
        threadId,
        skills,
        "agent",
      );
    }
    for await (const event of eventStream) {
      if (event.type === "message") {
        const content = event.chunk.content ?? "";
        if (content) {
          stepChatMemory.addAssistantChunk(content);
          liveOutput.value[stepId] = (liveOutput.value[stepId] ?? "") + content;
        }
      } else if (event.type === "tool_start") {
        stepChatMemory.applyToolStart(event.event);
      } else if (event.type === "tool_end") {
        stepChatMemory.applyToolEnd(event.event);
        handleWriteFileToolEnd(event.event);
        const toolName = event.event.name;
        const output = event.event.output;
        if (output) {
          handleToolEndOutput(output);
        }
        if (
          toolName &&
          WORKSPACE_MUTATING_TOOLS.has(toolName) &&
          event.event.ok !== false &&
          activeWorkflowId.value &&
          event.event.output &&
          !parsePendingWorkspaceApproval(event.event.output)
        ) {
          await refreshWorkspaceForStep(activeWorkflowId.value, stepId);
        }
      }
    }
    state.value = await fetchState(activeWorkflowId.value);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    stepChatMemory.addAssistantChunk(`\n\nError: ${message}`);
    actionError.value = message;
  } finally {
    running.value = false;
  }
}

async function onFreeSend(payload: { text: string; attachments: ChatAttachment[] }) {
  if (!freeChatMemory.activeThreadId.value) {
    await ensureActiveChatThread();
  }
  const checkpointThreadId = activeThreadCheckpointId();
  if (!checkpointThreadId) return;

  let expanded: string;
  try {
    expanded = await expandChatMessage(payload.text, payload.attachments, readWorkspaceFile);
  } catch (err) {
    actionError.value = err instanceof Error ? err.message : String(err);
    return;
  }

  freeChatMemory.addUserMessage(payload.text, payload.attachments.map((a) => a.path));
  freeSending.value = true;
  try {
    for await (const event of streamChatEvents(checkpointThreadId, expanded, { mode: "agent" })) {
      if (event.type === "message") {
        if (event.chunk.content) {
          freeChatMemory.addAssistantChunk(event.chunk.content, event.chunk.citations);
        }
      } else if (event.type === "tool_start") {
        freeChatMemory.applyToolStart(event.event);
      } else if (event.type === "tool_end") {
        freeChatMemory.applyToolEnd(event.event);
        handleWriteFileToolEnd(event.event);
        handleToolEndOutput(event.event.output);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    freeChatMemory.addAssistantChunk(`Error: ${message}`);
  } finally {
    freeSending.value = false;
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
      v-else-if="error || needsWorkflowInit"
      class="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center"
    >
      <p v-if="needsWorkflowInit && !error" class="text-gray-600">
        This project has no workflow configuration yet.
      </p>
      <p v-if="error" class="text-red-600">{{ error }}</p>
      <div class="flex flex-wrap items-center justify-center gap-2">
        <button
          v-if="showInitWorkflowAction"
          class="btn-primary text-sm"
          :disabled="initLoading"
          @click="initWorkflowConfig"
        >
          {{ initLoading ? "Initializing…" : "Initialize workflow config" }}
        </button>
        <button
          v-if="error"
          class="btn-primary text-sm bg-gray-600 hover:bg-gray-700"
          :disabled="initLoading"
          @click="loadData"
        >
          Retry
        </button>
      </div>
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
          @design-workspace="openWorkspaceDesigner"
          @select-step="selectStep"
          @add-workflow="openTemplatePicker"
        />

        <div ref="resizeContainer" class="flex flex-1 min-w-0 min-h-0">
          <main
            class="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden border-r border-gray-200"
            :style="{ width: mainPanelWidth }"
          >
            <WorkflowPanelRenderer
              v-if="workspaceResolved && resolvedWorkspace"
              :workspace="resolvedWorkspace"
              :api="panelApi"
              :runtime="panelRuntime"
            />
            <p
              v-else-if="workspaceResolved"
              class="flex flex-1 items-center justify-center text-sm text-gray-500"
            >
              No workspace configured for this step.
            </p>
          </main>

          <div
            class="w-1 shrink-0 cursor-col-resize bg-gray-200 hover:bg-blue-400 active:bg-blue-500 transition-colors"
            title="Drag to resize chat panel"
            @mousedown.prevent="startResize"
          />

          <aside
            class="flex flex-row min-w-0 min-h-0 bg-white shrink-0"
            :style="{ width: chatPanelWidth }"
          >
            <ChatThreadSidebar
              :threads="activeChatThreads"
              :active-id="activeChatThreadId"
              v-model:collapsed="chatListCollapsed"
              @select="onSelectChatThread"
              @create="onCreateChatThread"
            />

            <div class="flex flex-col flex-1 min-w-0 min-h-0">
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
                <span
                  v-if="stepChatFileMode"
                  class="mr-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200"
                >
                  File mode
                </span>
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
                <div
                  v-if="!running && !currentStepMessages.length"
                  class="text-gray-400 text-xs"
                >
                  Chat with agent to run {{ currentStep?.title ?? "this step" }}.
                </div>
              </template>
              <template v-else>
                <ChatMessage v-for="(msg, i) in freeChatMessages" :key="i" :msg="msg" />
                <div v-if="freeSending" class="text-gray-400 text-xs">Thinking…</div>
              </template>
            </div>

            <div
              v-if="pendingWorkspaceApproval"
              class="shrink-0 px-4 py-2 border-t border-amber-100 bg-white space-y-1"
            >
              <WorkspaceApprovalCard
                compact
                :summary="pendingWorkspaceApproval.summary"
                :before="pendingWorkspaceApproval.before"
                :after="pendingWorkspaceApproval.after"
                :approving="workspaceApproving"
                @approve="onApproveWorkspaceChange"
                @cancel="onCancelWorkspaceChange"
              />
              <p v-if="workspaceApprovalError" class="text-xs text-red-600">
                {{ workspaceApprovalError }}
              </p>
            </div>

            <ChatInput
              v-if="chatMode === 'step'"
              ref="stepChatInputRef"
              :loading="running"
              :disabled="!canOperateActive"
              @send="onStepSend"
            />
            <ChatInput v-else ref="freeChatInputRef" :loading="freeSending" @send="onFreeSend" />
            </div>
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

      <WorkspaceDesigner
        :show="showWorkspaceDesigner"
        :workflow-id="selectedWorkflowId"
        :steps="workflow.steps.map((s) => ({ id: s.id, title: s.title }))"
        :initial-step-id="activeStepId"
        :skills="allSkills"
        :panel-api="panelApi"
        @close="showWorkspaceDesigner = false"
        @saved="onWorkspaceSaved"
      />
    </template>
  </div>
</template>
