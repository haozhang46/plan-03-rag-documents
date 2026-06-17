<script setup lang="ts">
import { computed, ref, watch } from "vue";

export interface SkillOption {
  name: string;
  description: string;
}

const props = defineProps<{
  loading: boolean;
  skills: SkillOption[];
  selectedSkills: string[];
}>();

const emit = defineEmits<{
  send: [text: string];
  "toggle-skill": [name: string];
  "remove-skill": [name: string];
}>();

const text = ref("");
const showSlashMenu = ref(false);
const slashFilter = ref("");

const filteredSkills = computed(() => {
  const q = slashFilter.value.toLowerCase();
  if (!q) return props.skills;
  return props.skills.filter(
    (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q),
  );
});

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 200) + "px";
}

function onInput(e: Event) {
  autoResize(e);
  const value = text.value;
  const slashIdx = value.lastIndexOf("/");
  if (slashIdx >= 0 && (slashIdx === 0 || value[slashIdx - 1] === " " || value[slashIdx - 1] === "\n")) {
    const query = value.slice(slashIdx + 1);
    if (!query.includes(" ")) {
      showSlashMenu.value = true;
      slashFilter.value = query;
      return;
    }
  }
  showSlashMenu.value = false;
  slashFilter.value = "";
}

function pickSkill(name: string) {
  emit("toggle-skill", name);
  const value = text.value;
  const slashIdx = value.lastIndexOf("/");
  if (slashIdx >= 0) {
    text.value = value.slice(0, slashIdx).trimEnd();
  }
  showSlashMenu.value = false;
  slashFilter.value = "";
}

function send() {
  const trimmed = text.value.trim();
  if (!trimmed || props.loading) return;
  emit("send", trimmed);
  text.value = "";
  showSlashMenu.value = false;
}

watch(
  () => props.loading,
  (isLoading) => {
    if (!isLoading) showSlashMenu.value = false;
  },
);
</script>

<template>
  <div class="relative border-t border-gray-200 bg-white">
    <div
      v-if="selectedSkills.length"
      class="flex flex-wrap gap-1 px-4 pt-2"
    >
      <span
        v-for="skill in selectedSkills"
        :key="skill"
        class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800"
      >
        {{ skill }}
        <button type="button" class="hover:text-blue-950" @click="emit('remove-skill', skill)">×</button>
      </span>
    </div>

    <div
      v-if="showSlashMenu && filteredSkills.length"
      class="absolute bottom-full left-4 right-4 mb-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg z-10"
    >
      <button
        v-for="skill in filteredSkills"
        :key="skill.name"
        type="button"
        class="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
        @mousedown.prevent="pickSkill(skill.name)"
      >
        <div class="text-sm font-medium text-gray-800">/{{ skill.name }}</div>
        <div class="text-[10px] text-gray-500 truncate">{{ skill.description }}</div>
      </button>
    </div>

    <form class="flex items-end gap-3 p-4" @submit.prevent="send">
      <textarea
        v-model="text"
        class="input-field resize-none min-h-[44px] max-h-[200px] flex-1"
        rows="1"
        placeholder="Type a message… (/ for skills)"
        :disabled="loading"
        @keydown.enter.exact.prevent="send"
        @input="onInput"
      />
      <button type="submit" class="btn-primary flex-shrink-0" :disabled="!text.trim() || loading">
        {{ loading ? "..." : "Send" }}
      </button>
    </form>
  </div>
</template>
