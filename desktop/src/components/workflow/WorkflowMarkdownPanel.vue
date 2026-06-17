<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import MarkdownPreview from "./MarkdownPreview.vue";
import type { useWorkflow } from "../../composables/useWorkflow";

type WorkflowApi = Pick<
  ReturnType<typeof useWorkflow>,
  "listWorkspace" | "readWorkspaceFile" | "writeWorkspaceFile" | "deleteWorkspacePath"
>;

const props = defineProps<{
  api: WorkflowApi;
  docsDir?: string;
}>();

const docsDir = computed(() => props.docsDir ?? "docs");
const files = ref<{ path: string; name: string }[]>([]);
const selectedPath = ref<string | null>(null);
const content = ref("");
const draft = ref("");
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const isEditing = ref(false);

const isDirty = computed(() => isEditing.value && draft.value !== content.value);

async function loadFileList() {
  loading.value = true;
  error.value = null;
  try {
    const { entries } = await props.api.listWorkspace(docsDir.value);
    files.value = entries
      .filter((e) => e.type === "file" && e.name.endsWith(".md"))
      .map((e) => ({ path: e.path, name: e.name }));
    if (!selectedPath.value && files.value.length) {
      await selectFile(files.value[0].path);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

async function selectFile(path: string) {
  loading.value = true;
  error.value = null;
  try {
    const file = await props.api.readWorkspaceFile(path);
    selectedPath.value = path;
    content.value = file.content;
    draft.value = file.content;
    isEditing.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

async function createDoc() {
  const name = window.prompt("New document name (e.g. PRD.md):", "PRD.md");
  if (!name?.trim()) return;
  const fileName = name.endsWith(".md") ? name : `${name}.md`;
  const path = `${docsDir.value}/${fileName}`;
  await props.api.writeWorkspaceFile(path, `# ${fileName.replace(/\.md$/, "")}\n\n`);
  await loadFileList();
  await selectFile(path);
  isEditing.value = true;
}

async function saveDoc() {
  if (!selectedPath.value) return;
  saving.value = true;
  error.value = null;
  try {
    await props.api.writeWorkspaceFile(selectedPath.value, draft.value);
    content.value = draft.value;
    isEditing.value = false;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    saving.value = false;
  }
}

async function deleteDoc() {
  if (!selectedPath.value) return;
  if (!window.confirm(`Delete ${selectedPath.value}?`)) return;
  error.value = null;
  try {
    await props.api.deleteWorkspacePath(selectedPath.value);
    selectedPath.value = null;
    content.value = "";
    draft.value = "";
    await loadFileList();
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  }
}

function startEdit() {
  draft.value = content.value;
  isEditing.value = true;
}

onMounted(() => {
  void loadFileList();
});

watch(
  () => docsDir.value,
  () => {
    void loadFileList();
  },
);
</script>

<template>
  <div class="flex flex-1 min-h-0">
    <aside class="w-48 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
      <div class="p-2 border-b border-gray-200 flex items-center justify-between">
        <span class="text-xs font-medium text-gray-500">Documents</span>
        <button class="text-xs text-blue-600 hover:underline" @click="createDoc">+ New</button>
      </div>
      <div class="flex-1 overflow-y-auto">
        <button
          v-for="file in files"
          :key="file.path"
          class="w-full text-left px-3 py-2 text-xs border-b border-gray-100 hover:bg-gray-100 truncate"
          :class="selectedPath === file.path ? 'bg-blue-50 text-blue-700' : 'text-gray-700'"
          @click="selectFile(file.path)"
        >
          {{ file.name }}
        </button>
        <p v-if="!files.length && !loading" class="p-3 text-xs text-gray-400">
          No markdown files yet.
        </p>
      </div>
    </aside>

    <section class="flex-1 flex flex-col min-w-0">
      <div class="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <span class="text-sm font-medium text-gray-700 truncate">
          {{ selectedPath ?? "Select a document" }}
        </span>
        <div class="ml-auto flex gap-2">
          <button
            v-if="selectedPath && !isEditing"
            class="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
            @click="startEdit"
          >
            Edit
          </button>
          <button
            v-if="isEditing"
            class="text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
            :disabled="saving || !isDirty"
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
          <button
            v-if="selectedPath"
            class="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
            @click="deleteDoc"
          >
            Delete
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
      />
      <div v-else-if="selectedPath" class="flex-1 overflow-y-auto p-6">
        <MarkdownPreview :content="content" />
      </div>
      <div v-else class="flex-1 flex items-center justify-center text-sm text-gray-400">
        Create or select a PRD document.
      </div>
    </section>
  </div>
</template>
