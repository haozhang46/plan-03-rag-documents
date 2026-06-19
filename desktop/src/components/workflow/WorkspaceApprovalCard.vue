<script setup lang="ts">
import type { WorkspaceDefinition } from "../../workspace/registry";

const props = defineProps<{
  summary: string;
  before: WorkspaceDefinition | null;
  after: WorkspaceDefinition;
}>();

const emit = defineEmits<{
  approve: [];
  cancel: [];
}>();

function formatJson(def: WorkspaceDefinition | null): string {
  if (!def) return "(empty)";
  return JSON.stringify(def, null, 2);
}
</script>

<template>
  <div class="my-3 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
    <p class="text-xs font-medium text-amber-900 uppercase tracking-wide">
      Workspace change pending approval
    </p>
    <p class="text-xs text-gray-700">{{ summary }}</p>
    <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
      <div>
        <p class="text-[10px] font-medium text-gray-500 mb-1">Before</p>
        <pre class="text-[10px] whitespace-pre-wrap text-gray-700 max-h-32 overflow-y-auto bg-white border border-gray-200 rounded p-2">{{ formatJson(before) }}</pre>
      </div>
      <div>
        <p class="text-[10px] font-medium text-gray-500 mb-1">After</p>
        <pre class="text-[10px] whitespace-pre-wrap text-gray-700 max-h-32 overflow-y-auto bg-white border border-gray-200 rounded p-2">{{ formatJson(after) }}</pre>
      </div>
    </div>
    <div class="flex flex-wrap gap-2">
      <button type="button" class="btn-primary text-xs py-1 px-3" @click="emit('approve')">
        Approve &amp; Apply
      </button>
      <button
        type="button"
        class="text-xs px-3 py-1 rounded-lg border border-gray-300 hover:bg-white"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </div>
</template>
