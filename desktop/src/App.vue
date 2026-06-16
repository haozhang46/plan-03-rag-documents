<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ChatInput, ChatMessage, useMessages } from "@agent-flow/shared-ui";
import { useLocalChat } from "./composables/useLocalChat";

const threadId = ref(crypto.randomUUID());
const { messages, loading, addUserMessage, addAssistantChunk } = useMessages(threadId);
const { streamChat } = useLocalChat();

const workspace = ref("");
const apiKeyStatus = ref("");
const settingsOpen = ref(false);
const apiKeyInput = ref("");

onMounted(async () => {
  workspace.value = await window.desktop.getWorkspace();
  apiKeyStatus.value = await window.desktop.getApiKeyStatus();
});

async function pickWorkspace() {
  workspace.value = await window.desktop.pickWorkspace();
}

async function saveApiKey() {
  await window.desktop.setApiKey(apiKeyInput.value);
  apiKeyInput.value = "";
  apiKeyStatus.value = await window.desktop.getApiKeyStatus();
  settingsOpen.value = false;
}

async function onSend(text: string) {
  loading.value = true;
  addUserMessage(text);
  try {
    for await (const chunk of streamChat(threadId.value, text)) {
      if (chunk.content) addAssistantChunk(chunk.content);
    }
  } catch (err) {
    addAssistantChunk(`\n\nError: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <header class="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white">
      <strong>Agent Flow Desktop</strong>
      <span class="text-xs text-gray-500 truncate flex-1">{{ workspace }}</span>
      <button class="btn-primary text-sm" @click="pickWorkspace">Workspace</button>
      <button class="btn-primary text-sm" @click="settingsOpen = !settingsOpen">Settings</button>
    </header>

    <div v-if="settingsOpen" class="p-4 border-b bg-gray-50">
      <p class="text-sm mb-2">DeepSeek API Key: {{ apiKeyStatus || "not set" }}</p>
      <input v-model="apiKeyInput" type="password" class="input-field mb-2" placeholder="sk-..." />
      <button class="btn-primary" @click="saveApiKey">Save Key</button>
    </div>

    <main class="flex-1 overflow-y-auto p-6">
      <ChatMessage v-for="(msg, i) in messages" :key="i" :msg="msg" />
      <div v-if="loading" class="text-gray-400 text-sm">Thinking...</div>
    </main>

    <ChatInput :loading="loading" @send="onSend" />
  </div>
</template>
