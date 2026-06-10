<template>
  <section class="border-t border-gray-200 dark:border-gray-700 flex flex-col max-h-72">
    <div class="px-3 py-2 flex items-center justify-between gap-2">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-gray-500">
        RAGFlow 知识库
      </h2>
      <span
        v-if="selectedIds.length"
        class="text-xs text-blue-600 dark:text-blue-400"
      >
        {{ selectedIds.length }} 已选
      </span>
    </div>

    <div class="px-3 pb-2 flex gap-2">
      <button
        type="button"
        class="flex-1 text-xs px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
        :disabled="loading"
        title="刷新列表"
        @click="refresh"
      >
        {{ loading ? "加载中..." : "↻ 刷新知识库" }}
      </button>
    </div>

    <p v-if="error" class="px-3 pb-2 text-xs text-red-500 truncate" :title="error">
      {{ error }}
    </p>

    <div class="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
      <p
        v-if="!datasets.length && !loading"
        class="px-1 py-2 text-xs text-gray-400 text-center"
      >
        无可用知识库（需配置 tenant 绑定）
      </p>

      <label
        v-for="ds in datasets"
        :key="ds.id"
        class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
      >
        <input
          type="checkbox"
          class="rounded border-gray-300 dark:border-gray-600 flex-shrink-0"
          :checked="selectedIds.includes(ds.id)"
          @change="toggleSelected(ds.id)"
        />
        <span class="flex-1 min-w-0 text-xs truncate" :title="ds.name">
          {{ ds.name }}
        </span>
        <span class="text-[10px] text-gray-400 flex-shrink-0">{{ ds.permission }}</span>
      </label>
    </div>

    <div
      v-if="datasets.length"
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
import type { RagDataset } from "~/types";

defineProps<{
  datasets: RagDataset[];
  selectedIds: string[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  refresh: [];
  "toggle-selected": [datasetId: string];
  "select-all": [];
  "clear-selection": [];
}>();

function refresh() {
  emit("refresh");
}

function toggleSelected(datasetId: string) {
  emit("toggle-selected", datasetId);
}

function selectAll() {
  emit("select-all");
}

function clearSelection() {
  emit("clear-selection");
}
</script>
