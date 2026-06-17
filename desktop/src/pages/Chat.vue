<script setup lang="ts">
import { ref, watch } from "vue";
import { ChatMessage, useMessages } from "@agent-flow/shared-ui";
import ChatInputWithSlash from "../components/chat/ChatInputWithSlash.vue";
import PlanApprovalCard from "../components/chat/PlanApprovalCard.vue";
import { useLocalChat } from "../composables/useLocalChat";
import {
  loadThreadMeta,
  removeThreadSkill,
  saveThreadMeta,
  toggleThreadSkill,
  type ChatMode,
  type ChatThreadMeta,
} from "../composables/useChatThreadMeta";
import { useDesktopThreads } from "../composables/useDesktopThreads";

const MODES: { id: ChatMode; label: string }[] = [
  { id: "ask", label: "Ask" },
  { id: "plan", label: "Plan" },
  { id: "agent", label: "Agent" },
];

const { threads, activeThreadId, create, select, updateTitle } = useDesktopThreads();
const { streamChatEvents, fetchSkillCatalog } = useLocalChat();

const skillCatalog = ref<{ name: string; description: string }[]>([]);
const threadMeta = ref<ChatThreadMeta>({ mode: "agent", skills: [] });
const pendingPlan = ref<string | null>(null);
const loading = ref(false);

const workspace = defineModel<string>("workspace", { required: true });

const { messages, addUserMessage, addAssistantChunk } = useMessages(activeThreadId);

void fetchSkillCatalog()
  .then((skills) => {
    skillCatalog.value = skills;
  })
  .catch(() => {
    skillCatalog.value = [];
  });

watch(
  activeThreadId,
  (id) => {
    if (!id) {
      create();
      return;
    }
    threadMeta.value = loadThreadMeta(id);
    pendingPlan.value = null;
  },
  { immediate: true },
);

watch(
  threadMeta,
  (meta) => {
    const id = activeThreadId.value;
    if (id) saveThreadMeta(id, meta);
  },
  { deep: true },
);

function newChat() {
  create();
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
    threadId = create();
  }

  addUserMessage(text);
  const lastUser = messages.value[messages.value.length - 1];
  if (lastUser?.role === "user") {
    updateTitle(threadId, text);
  }

  loading.value = true;
  pendingPlan.value = null;
  try {
    for await (const event of streamChatEvents(threadId, text, {
      mode: threadMeta.value.mode,
      skills: threadMeta.value.skills,
    })) {
      if (event.type === "message") {
        if (event.chunk.content) {
          addAssistantChunk(event.chunk.content, event.chunk.citations);
        }
      } else if (event.type === "plan_ready") {
        pendingPlan.value = event.content;
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
        <PlanApprovalCard
          v-if="pendingPlan && threadMeta.mode === 'plan'"
          :plan-content="pendingPlan"
          @approve="onApprovePlan"
          @edit="onEditPlan"
          @cancel="onCancelPlan"
        />
        <div v-if="loading" class="text-gray-400 text-sm">Thinking...</div>
      </div>

      <ChatInputWithSlash
        :loading="loading"
        :skills="skillCatalog"
        :selected-skills="threadMeta.skills"
        @send="onSend"
        @toggle-skill="onToggleSkill"
        @remove-skill="onRemoveSkill"
      />
    </main>
  </div>
</template>
