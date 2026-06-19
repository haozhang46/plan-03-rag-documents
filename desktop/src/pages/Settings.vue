<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const emit = defineEmits<{ back: [] }>();

const apiKeyStatus = ref("");
const apiKeyInput = ref("");
const resourceServerUrl = ref("");
const workspacePath = ref("");
const langflowBaseUrl = ref("");
const langflowApiKeyStatus = ref("");
const langflowApiKeyInput = ref("");
const langflowAutoStart = ref(true);

onMounted(async () => {
  apiKeyStatus.value = await window.desktop.getApiKeyStatus();
  resourceServerUrl.value = await window.desktop.getResourceServerUrl();
  workspacePath.value = await window.desktop.getWorkspace();
  langflowBaseUrl.value = await window.desktop.getLangflowBaseUrl();
  langflowApiKeyStatus.value = await window.desktop.getLangflowApiKeyStatus();
  langflowAutoStart.value = await window.desktop.getLangflowAutoStart();
});

async function saveApiKey() {
  await window.desktop.setApiKey(apiKeyInput.value);
  apiKeyInput.value = "";
  apiKeyStatus.value = await window.desktop.getApiKeyStatus();
}

async function clearApiKey() {
  await window.desktop.clearApiKey();
  apiKeyStatus.value = "";
}

async function saveResourceServerUrl() {
  await window.desktop.setResourceServerUrl(resourceServerUrl.value);
}

const topologyPanelUrl = computed(() => {
  const base = resourceServerUrl.value.trim().replace(/\/$/, "");
  if (!base) return "";
  const project = workspacePath.value.split(/[/\\]/).filter(Boolean).pop() ?? "demo";
  return `${base}/ui/?project=${encodeURIComponent(project)}`;
});

async function saveLangflow() {
  await window.desktop.setLangflow(langflowBaseUrl.value, langflowApiKeyInput.value);
  langflowApiKeyInput.value = "";
  langflowApiKeyStatus.value = await window.desktop.getLangflowApiKeyStatus();
}

async function toggleLangflowAutoStart() {
  langflowAutoStart.value = !langflowAutoStart.value;
  await window.desktop.setLangflowAutoStart(langflowAutoStart.value);
}
</script>

<template>
  <div class="max-w-lg mx-auto p-8">
    <button class="text-sm text-blue-600 mb-6" @click="emit('back')">← Back</button>
    <h1 class="text-xl font-semibold mb-4">Settings</h1>

    <section class="mb-8">
      <h2 class="text-sm font-medium mb-2">DeepSeek API Key</h2>
      <p class="text-sm text-gray-500 mb-3">
        Status: {{ apiKeyStatus || "not set" }}
      </p>
      <input
        v-model="apiKeyInput"
        type="password"
        class="input-field mb-3 w-full"
        placeholder="sk-..."
      />
      <div class="flex gap-2">
        <button class="btn-primary" @click="saveApiKey">Save Key</button>
        <button class="btn-primary bg-gray-500" @click="clearApiKey">Clear</button>
      </div>
    </section>

    <section class="mb-8">
      <h2 class="text-sm font-medium mb-2">Resource Server URL</h2>
      <p class="text-sm text-gray-500 mb-3">
        Optional team resource config server. AI uses connection details when generating backend
        configs (application.yml, .env). Leave empty to use project
        .agentflow/resource-instances.yaml only.
      </p>
      <input
        v-model="resourceServerUrl"
        type="url"
        class="input-field mb-3 w-full"
        placeholder="http://localhost:9000"
      />
      <button class="btn-primary" @click="saveResourceServerUrl">Save URL</button>
      <p v-if="topologyPanelUrl" class="text-sm mt-3">
        <a :href="topologyPanelUrl" target="_blank" rel="noopener noreferrer" class="text-blue-600">
          Open Topology Panel
        </a>
      </p>
    </section>

    <section>
      <h2 class="text-sm font-medium mb-2">Langflow Server</h2>
      <p class="text-sm text-gray-500 mb-3">
        URL of your local Langflow instance. When auto-start is on, Desktop spawns Langflow on
        port 17860 if the URL below is unreachable.
      </p>
      <label class="flex items-center gap-2 text-sm mb-3 cursor-pointer">
        <input
          type="checkbox"
          :checked="langflowAutoStart"
          @change="toggleLangflowAutoStart"
        />
        Start Langflow with Agent Flow Desktop
      </label>
      <input
        v-model="langflowBaseUrl"
        type="url"
        class="input-field mb-3 w-full"
        placeholder="http://127.0.0.1:7860"
      />
      <p class="text-sm text-gray-500 mb-3">
        API Key status: {{ langflowApiKeyStatus || "not set" }}
      </p>
      <input
        v-model="langflowApiKeyInput"
        type="password"
        class="input-field mb-3 w-full"
        placeholder="Optional Langflow API key"
      />
      <button class="btn-primary" @click="saveLangflow">Save</button>
    </section>
  </div>
</template>
