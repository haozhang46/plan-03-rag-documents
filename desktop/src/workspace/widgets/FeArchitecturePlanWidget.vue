<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import MarkdownPreview from "../../components/workflow/MarkdownPreview.vue";
import type { PanelApi } from "../registryComponents";

const props = defineProps<{
  api: PanelApi;
  output: string;
  layers: string[];
}>();

const content = ref("");
const draft = ref("");
const checkedLayers = ref<string[]>([]);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const isEditing = ref(false);

const isDirty = computed(() => isEditing.value && draft.value !== content.value);

function syncCheckedFromContent() {
  const present = props.layers.filter((layer) => {
    const re = new RegExp(`^[-*]\\s*${layer}\\b`, "im");
    return re.test(content.value) || content.value.toLowerCase().includes(layer.toLowerCase());
  });
  checkedLayers.value = present.length ? present : [...props.layers];
}

async function loadOutput() {
  loading.value = true;
  error.value = null;
  try {
    const file = await props.api.readWorkspaceFile(props.output);
    content.value = file.content;
    draft.value = file.content;
    syncCheckedFromContent();
    isEditing.value = false;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("ENOENT") || message.includes("not found")) {
      const initial = buildInitialMarkdown();
      content.value = initial;
      draft.value = initial;
      checkedLayers.value = [...props.layers];
      isEditing.value = true;
    } else {
      error.value = message;
    }
  } finally {
    loading.value = false;
  }
}

function buildInitialMarkdown(): string {
  const lines = ["# Frontend Architecture Plan", "", "## Layers", ""];
  for (const layer of props.layers) {
    lines.push(`- [ ] **${layer}** — describe responsibilities`);
  }
  lines.push("", "## Notes", "", "_Add architecture decisions here._", "");
  return lines.join("\n");
}

function toggleLayer(layer: string) {
  if (checkedLayers.value.includes(layer)) {
    checkedLayers.value = checkedLayers.value.filter((l) => l !== layer);
  } else {
    checkedLayers.value = [...checkedLayers.value, layer];
  }
  if (isEditing.value) {
    draft.value = applyLayersToMarkdown(draft.value);
  }
}

function applyLayersToMarkdown(md: string): string {
  const lines = md.split("\n");
  const layerSectionIdx = lines.findIndex((l) => /^##\s+layers/i.test(l.trim()));
  const nextSectionIdx =
    layerSectionIdx >= 0
      ? lines.findIndex((l, i) => i > layerSectionIdx && /^##\s+/.test(l.trim()))
      : -1;

  const layerLines = props.layers.map((layer) => {
    const checked = checkedLayers.value.includes(layer);
    return `- [${checked ? "x" : " "}] **${layer}**`;
  });

  if (layerSectionIdx >= 0) {
    const end = nextSectionIdx >= 0 ? nextSectionIdx : lines.length;
    const before = lines.slice(0, layerSectionIdx + 1);
    const after = nextSectionIdx >= 0 ? lines.slice(nextSectionIdx) : [];
    return [...before, "", ...layerLines, "", ...after].join("\n");
  }

  return [`## Layers`, "", ...layerLines, "", md].join("\n");
}

function startEdit() {
  draft.value = content.value;
  syncCheckedFromContent();
  isEditing.value = true;
}

async function saveDoc() {
  saving.value = true;
  error.value = null;
  try {
    const body = isEditing.value ? draft.value : applyLayersToMarkdown(content.value);
    await props.api.writeWorkspaceFile(props.output, body);
    content.value = body;
    draft.value = body;
    isEditing.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  void loadOutput();
});

watch(
  () => props.output,
  () => {
    void loadOutput();
  },
);
</script>

<template>
  <div class="flex flex-1 min-h-0">
    <aside class="w-52 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
      <div class="p-3 border-b border-gray-200">
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Layers</span>
      </div>
      <ul class="flex-1 overflow-y-auto p-2 space-y-1">
        <li v-for="layer in layers" :key="layer">
          <label class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 cursor-pointer text-sm text-gray-700">
            <input
              type="checkbox"
              class="rounded border-gray-300"
              :checked="checkedLayers.includes(layer)"
              @change="toggleLayer(layer)"
            />
            <span>{{ layer }}</span>
          </label>
        </li>
      </ul>
      <p class="p-3 text-xs text-gray-400 border-t border-gray-200">
        Output: {{ output }}
      </p>
    </aside>

    <section class="flex-1 flex flex-col min-w-0">
      <div class="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <span class="text-sm font-medium text-gray-700">Architecture Plan</span>
        <div class="ml-auto flex gap-2">
          <button
            v-if="!isEditing"
            class="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
            :disabled="loading"
            @click="startEdit"
          >
            Edit
          </button>
          <button
            v-if="isEditing || checkedLayers.length"
            class="text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
            :disabled="saving || (isEditing && !isDirty && !checkedLayers.length)"
            @click="saveDoc"
          >
            Save
          </button>
          <button
            v-if="isEditing"
            class="text-xs px-2 py-1 rounded border border-gray-300"
            @click="isEditing = false; draft = content"
          >
            Cancel
          </button>
        </div>
      </div>

      <p v-if="error" class="px-4 py-1 text-xs text-red-600 bg-red-50">{{ error }}</p>

      <div v-if="loading" class="flex-1 flex items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
      <textarea
        v-else-if="isEditing"
        v-model="draft"
        class="flex-1 p-4 font-mono text-sm resize-none outline-none border-0"
        spellcheck="false"
        data-testid="fe-arch-editor"
      />
      <div v-else class="flex-1 overflow-y-auto p-6">
        <MarkdownPreview :content="content" />
      </div>
    </section>
  </div>
</template>
