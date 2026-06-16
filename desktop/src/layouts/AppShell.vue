<script setup lang="ts">
import { onMounted, ref } from "vue";
import ChatPage from "../pages/Chat.vue";
import LangflowEditorPage from "../pages/LangflowEditor.vue";
import ProjectHomePage from "../pages/ProjectHome.vue";
import SettingsPage from "../pages/Settings.vue";
import WorkflowRunPage from "../pages/WorkflowRun.vue";

type AppView = "home" | "workflow" | "chat" | "langflow" | "settings";

const view = ref<AppView>("home");
const workspace = ref("");

onMounted(async () => {
  workspace.value = await window.desktop.getWorkspace();
  const recent = await window.desktop.getRecentProjects();
  view.value =
    workspace.value && recent.includes(workspace.value) ? "workflow" : "home";
});

function onProjectOpened(path: string) {
  workspace.value = path;
  view.value = "workflow";
}

const navItems: { id: AppView; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "workflow", label: "Workflow" },
  { id: "chat", label: "Chat" },
  { id: "langflow", label: "Langflow" },
  { id: "settings", label: "Settings" },
];
</script>

<template>
  <div class="flex flex-col h-full">
    <header class="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white">
      <strong>Agent Flow Desktop</strong>
      <nav class="flex gap-2 ml-4">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="text-sm px-2 py-1 rounded"
          :class="view === item.id ? 'bg-blue-100 text-blue-700' : 'text-gray-600'"
          @click="view = item.id"
        >
          {{ item.label }}
        </button>
      </nav>
      <span class="text-xs text-gray-500 truncate flex-1">{{ workspace }}</span>
    </header>

    <ProjectHomePage v-if="view === 'home'" @opened="onProjectOpened" />
    <WorkflowRunPage v-else-if="view === 'workflow'" :workspace="workspace" />
    <ChatPage v-else-if="view === 'chat'" v-model:workspace="workspace" />
    <LangflowEditorPage v-else-if="view === 'langflow'" />
    <SettingsPage v-else @back="view = 'home'" />
  </div>
</template>
