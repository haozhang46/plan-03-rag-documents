<template>
  <div class="px-3 py-2 border-b border-gray-200 dark:border-gray-700 space-y-2 bg-gray-50 dark:bg-gray-900/50">
    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
      Agent Flow Debug
    </div>

    <label class="block text-xs text-gray-500">
      Flow
      <select
        class="mt-0.5 w-full text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
        :value="flowId"
        @change="onFlowChange"
      >
        <option v-for="f in flows" :key="f.flow_id" :value="f.flow_id">
          {{ f.title }} ({{ f.flow_id }})
        </option>
      </select>
    </label>

    <details class="text-xs">
      <summary class="cursor-pointer text-gray-500 hover:text-gray-700">
        Skills
        <span v-if="selectedNames.length" class="text-blue-600">
          ({{ selectedNames.length }})
        </span>
      </summary>
      <div class="mt-1 max-h-24 overflow-y-auto space-y-0.5 pl-1">
        <label
          v-for="s in skills"
          :key="s.name"
          class="flex items-center gap-1.5 cursor-pointer"
        >
          <input
            type="checkbox"
            class="rounded"
            :checked="selectedNames.includes(s.name)"
            @change="emit('toggle-skill', s.name)"
          />
          <span class="truncate" :title="s.description">{{ s.name }}</span>
        </label>
        <p v-if="!skills.length" class="text-gray-400">No skills loaded</p>
      </div>
    </details>

    <p v-if="error" class="text-xs text-red-500 truncate" :title="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type { FlowInfo, SkillInfo } from "~/types";

defineProps<{
  flows: FlowInfo[];
  flowId: string;
  skills: SkillInfo[];
  selectedNames: string[];
  error: string | null;
}>();

const emit = defineEmits<{
  "flow-change": [flowId: string];
  "toggle-skill": [name: string];
}>();

function onFlowChange(e: Event) {
  emit("flow-change", (e.target as HTMLSelectElement).value);
}
</script>
