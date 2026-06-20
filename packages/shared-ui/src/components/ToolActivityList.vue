<template>
  <div v-if="runs.length" class="mb-2 space-y-1" data-testid="tool-activity-list">
    <div v-for="run in runs" :key="run.callId" class="text-xs">
      <button
        type="button"
        class="flex items-center gap-2 w-full text-left rounded px-2 py-1 hover:bg-gray-200/60 dark:hover:bg-gray-600/40"
        :class="statusClass(run.status)"
        @click="toggle(run.callId)"
      >
        <span class="w-4 flex-shrink-0 text-center">{{ statusIcon(run.status) }}</span>
        <span class="font-medium">{{ run.name }}</span>
        <span v-if="run.status === 'running'" class="text-gray-400 animate-pulse">…</span>
      </button>
      <pre
        v-if="expanded[run.callId] && run.output"
        class="mt-1 ml-6 p-2 rounded bg-gray-900/5 dark:bg-black/20 text-[10px] overflow-auto max-h-[120px] whitespace-pre-wrap"
        data-testid="tool-output"
      >{{ run.output }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import type { ToolRun } from "../types/chat";

const props = defineProps<{ runs: ToolRun[] }>();
const expanded = reactive<Record<string, boolean>>({});

watch(
  () => props.runs,
  (runs) => {
    for (const run of runs) {
      if (run.status === "error") expanded[run.callId] = true;
    }
  },
  { deep: true, immediate: true },
);

function toggle(callId: string) {
  expanded[callId] = !expanded[callId];
}

function statusIcon(status: ToolRun["status"]) {
  if (status === "running") return "●";
  if (status === "error") return "✗";
  return "✓";
}

function statusClass(status: ToolRun["status"]) {
  if (status === "error") return "text-red-600 dark:text-red-400";
  if (status === "running") return "text-gray-500";
  return "text-gray-600 dark:text-gray-300";
}
</script>
