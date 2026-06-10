<template>
  <section class="border-t border-gray-200 dark:border-gray-700 flex flex-col max-h-72">
    <div class="px-3 py-2 flex items-center justify-between gap-2">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
        知识库
      </h2>
      <span
        v-if="selectedIds.length"
        class="text-xs text-blue-600 dark:text-blue-400"
      >
        {{ selectedIds.length }} 已选
      </span>
    </div>

    <div class="px-3 pb-2 text-xs text-gray-500 dark:text-gray-400">
      嵌入: {{ embeddingModel }} ({{ embeddingDimensions }}d)
    </div>

    <div class="px-3 pb-2 flex gap-2">
      <input
        ref="fileInput"
        type="file"
        accept=".txt,.md,.pdf"
        class="hidden"
        @change="onFileChange"
      />
      <button
        type="button"
        class="flex-1 text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        :disabled="uploading"
        @click="fileInput?.click()"
      >
        {{ uploading ? "上传中..." : "+ 上传文件" }}
      </button>
      <button
        type="button"
        class="text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        :disabled="loading"
        title="刷新列表"
        @click="refresh"
      >
        ↻
      </button>
    </div>

    <p v-if="error" class="px-3 pb-2 text-xs text-red-500 truncate" :title="error">
      {{ error }}
    </p>

    <div class="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
      <p
        v-if="!documents.length && !loading"
        class="px-1 py-2 text-xs text-gray-400 text-center"
      >
        上传 TXT / MD / PDF 用于 RAG 检索
      </p>

      <label
        v-for="doc in documents"
        :key="doc.document_id"
        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group cursor-pointer"
      >
        <input
          type="checkbox"
          class="rounded border-gray-300 dark:border-gray-600 flex-shrink-0"
          :checked="selectedIds.includes(doc.document_id)"
          @change="toggleSelected(doc.document_id)"
        />
        <span class="flex-1 min-w-0 text-xs truncate" :title="doc.filename">
          {{ doc.filename }}
        </span>
        <button
          type="button"
          class="flex-shrink-0 w-5 h-5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
          title="删除"
          @click.stop="onRemove(doc.document_id)"
        >
          ×
        </button>
      </label>
    </div>

    <div
      v-if="documents.length"
      class="px-3 py-2 border-t border-gray-200 dark:border-gray-700 flex gap-2"
    >
      <button
        type="button"
        class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        @click="selectAll"
      >
        全选
      </button>
      <button
        type="button"
        class="text-xs text-gray-500 hover:underline"
        @click="clearSelection"
      >
        清空
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RagDocument } from "~/types";

defineProps<{
  documents: RagDocument[];
  selectedIds: string[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  embeddingModel: string;
  embeddingDimensions: number;
}>();

const emit = defineEmits<{
  refresh: [];
  upload: [file: File];
  remove: [documentId: string];
  "toggle-selected": [documentId: string];
  "select-all": [];
  "clear-selection": [];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

function refresh() {
  emit("refresh");
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  emit("upload", file);
  if (fileInput.value) fileInput.value.value = "";
}

function onRemove(documentId: string) {
  emit("remove", documentId);
}

function toggleSelected(documentId: string) {
  emit("toggle-selected", documentId);
}

function selectAll() {
  emit("select-all");
}

function clearSelection() {
  emit("clear-selection");
}
</script>
