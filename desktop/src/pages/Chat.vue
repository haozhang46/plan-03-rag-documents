<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ChatMessage } from "@agent-flow/shared-ui";
import ChatInputWithSlash from "../components/chat/ChatInputWithSlash.vue";
import ChatThreadSidebar from "../components/chat/ChatThreadSidebar.vue";
import PlanApprovalCard from "../components/chat/PlanApprovalCard.vue";
import WorkspaceApprovalCard from "../components/workflow/WorkspaceApprovalCard.vue";
import { useLocalChat } from "../composables/useLocalChat";
import { useChatMemory } from "../composables/useChatMemory";
import { migrateLocalChatIfNeeded } from "../composables/migrateLocalChat";
import { useWorkspaceApproval } from "../composables/useWorkspaceApproval";
import {
  removeThreadSkill,
  toggleThreadSkill,
  type ChatMode,
} from "../composables/useChatThreadMeta";

const MODES: { id: ChatMode; label: string }[] = [
  { id: "ask", label: "Ask" },
  { id: "plan", label: "Plan" },
  { id: "agent", label: "Agent" },
];

const chatMemory = useChatMemory({ kind: "app" });
const {
  threads,
  activeThreadId,
  messages,
  loadThreads,
  createThread,
  selectThread,
  updateTitle,
  updateThreadMeta,
  addUserMessage,
  addAssistantChunk,
  applyToolStart,
  applyToolEnd,
} = chatMemory;

const { streamChatEvents, fetchSkillCatalog } = useLocalChat();

const {
  pending: pendingWorkspaceApproval,
  approvalError: workspaceApprovalError,
  approving: workspaceApproving,
  handleToolEndOutput,
  approvePending: onApproveWorkspaceChange,
  cancelPending: onCancelWorkspaceChange,
} = useWorkspaceApproval();

const skillCatalog = ref<{ name: string; description: string }[]>([]);
const threadMeta = ref<{ mode: ChatMode; skills: string[] }>({ mode: "agent", skills: [] });
const normalizedSelectedSkills = computed(() => threadMeta.value.skills ?? []);
const sidebarCollapsed = ref(false);
const pendingPlan = ref<string | null>(null);
const loading = ref(false);
let syncingMeta = false;

const workspace = defineModel<string>("workspace", { required: true });

void fetchSkillCatalog()
  .then((skills) => {
    skillCatalog.value = skills;
  })
  .catch(() => {
    skillCatalog.value = [];
  });

function applyThreadMeta(mode?: ChatMode, skills?: string[]) {
  syncingMeta = true;
  threadMeta.value = {
    mode: mode ?? "agent",
    skills: skills ?? [],
  };
  syncingMeta = false;
}

function activeCheckpointThreadId(): string | null {
  const id = activeThreadId.value;
  if (!id) return null;
  return threads.value.find((t) => t.id === id)?.checkpointThreadId ?? null;
}

async function ensureActiveThread() {
  if (activeThreadId.value) return;
  if (threads.value.length > 0) {
    const meta = await selectThread(threads.value[0]!.id);
    if (meta) applyThreadMeta(meta.mode, meta.skills);
    return;
  }
  const id = await createThread("New Chat");
  const thread = threads.value.find((t) => t.id === id);
  applyThreadMeta(thread?.mode, thread?.skills);
}

onMounted(async () => {
  await migrateLocalChatIfNeeded({
    fetchApiBase: async () => {
      const port = await window.desktop.getSidecarPort();
      return `http://127.0.0.1:${port}`;
    },
    loadThreads,
    getServerThreadCount: () => threads.value.length,
    createThread,
  });
  await loadThreads();
  await ensureActiveThread();
});

watch(
  threadMeta,
  (meta) => {
    if (syncingMeta || !activeThreadId.value) return;
    void updateThreadMeta({ mode: meta.mode, skills: meta.skills }).catch(() => {
      // error surfaced via chatMemory.error if needed
    });
  },
  { deep: true },
);

async function onSelectThread(id: string) {
  const meta = await selectThread(id);
  if (meta) applyThreadMeta(meta.mode, meta.skills);
  pendingPlan.value = null;
}

async function onNewChat() {
  const id = await createThread("New Chat");
  const thread = threads.value.find((t) => t.id === id);
  applyThreadMeta(thread?.mode, thread?.skills);
  pendingPlan.value = null;
}

function setMode(mode: ChatMode) {
  threadMeta.value = { ...threadMeta.value, mode };
  pendingPlan.value = null;
}

function onToggleSkill(name: string) {
  threadMeta.value = toggleThreadSkill(threadMeta.value, name);
}

function onRemoveSkill(name: string) {
  threadMeta.value = removeThreadSkill(threadMeta.value, name);
}

async function onSend(text: string) {
  let threadId = activeThreadId.value;
  if (!threadId) {
    threadId = await createThread("New Chat");
    const thread = threads.value.find((t) => t.id === threadId);
    applyThreadMeta(thread?.mode, thread?.skills);
  }

  const checkpointThreadId = activeCheckpointThreadId();
  if (!checkpointThreadId) return;

  addUserMessage(text);
  const lastUser = messages.value[messages.value.length - 1];
  if (lastUser?.role === "user") {
    await updateTitle(threadId, text);
  }

  loading.value = true;
  pendingPlan.value = null;
  try {
    for await (const event of streamChatEvents(checkpointThreadId, text, {
      mode: threadMeta.value.mode,
      skills: threadMeta.value.skills,
    })) {
      if (event.type === "message") {
        // Plan mode: exploration + plan text only via plan_ready → PlanApprovalCard, not chat bubble
        if (threadMeta.value.mode !== "plan" && event.chunk.content) {
          addAssistantChunk(event.chunk.content, event.chunk.citations);
        }
      } else if (event.type === "plan_ready") {
        pendingPlan.value = event.content;
      } else if (threadMeta.value.mode === "agent" && event.type === "tool_start") {
        applyToolStart(event.event);
      } else if (threadMeta.value.mode === "agent" && event.type === "tool_end") {
        applyToolEnd(event.event);
        handleToolEndOutput(event.event.output);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    addAssistantChunk(`Error: ${message}`);
  } finally {
    loading.value = false;
  }
}

async function onApprovePlan() {
  if (!pendingPlan.value) return;
  const plan = pendingPlan.value;
  pendingPlan.value = null;
  threadMeta.value = { ...threadMeta.value, mode: "agent" };
  await onSend(
    `Execute the following approved plan step by step. Confirm before destructive changes.\n\n${plan}`,
  );
}

function onEditPlan() {
  pendingPlan.value = null;
}

function onCancelPlan() {
  pendingPlan.value = null;
}
</script>

<template>
  <div class="flex flex-1 min-h-0">
    <div class="flex flex-col shrink-0 min-h-0">
      <ChatThreadSidebar
        class="flex-1 min-h-0"
        :threads="threads"
        :active-id="activeThreadId"
        v-model:collapsed="sidebarCollapsed"
        @select="onSelectThread"
        @create="onNewChat"
      />
      <p class="p-2 text-xs text-gray-400 truncate border-t border-gray-200 bg-gray-50" :title="workspace">
        {{ workspace }}
      </p>
    </div>

    <main class="flex-1 flex flex-col min-w-0">
      <div class="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <button
          v-for="m in MODES"
          :key="m.id"
          type="button"
          class="text-xs px-3 py-1 rounded-full border transition-colors"
          :class="
            threadMeta.mode === m.id
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          "
          @click="setMode(m.id)"
        >
          {{ m.label }}
        </button>
        <span class="ml-auto text-[10px] text-gray-400">
          {{ threadMeta.mode === "ask" ? "No tools" : threadMeta.mode === "plan" ? "Read-only" : "Full agent" }}
        </span>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <ChatMessage v-for="(msg, i) in messages" :key="i" :msg="msg" />
        <p v-if="loading && threadMeta.mode === 'plan'" class="text-gray-400 text-xs">
          Exploring workspace and drafting plan…
        </p>
        <PlanApprovalCard
          v-if="pendingPlan && threadMeta.mode === 'plan'"
          :plan-content="pendingPlan"
          @approve="onApprovePlan"
          @edit="onEditPlan"
          @cancel="onCancelPlan"
        />
      </div>

      <div
        v-if="pendingWorkspaceApproval && threadMeta.mode === 'agent'"
        class="shrink-0 px-6 py-3 border-t border-amber-100 bg-white space-y-1"
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

      <ChatInputWithSlash
        :loading="loading"
        :skills="skillCatalog"
        :selected-skills="normalizedSelectedSkills"
        @send="onSend"
        @toggle-skill="onToggleSkill"
        @remove-skill="onRemoveSkill"
      />
    </main>
  </div>
</template>
