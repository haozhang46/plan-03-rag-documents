<template>
  <form class="flex items-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" @submit.prevent="send">
    <textarea
      v-model="text"
      class="input-field resize-none min-h-[44px] max-h-[200px]"
      rows="1"
      placeholder="Type a message..."
      :disabled="props.loading"
      @keydown.enter.exact.prevent="send"
      @input="autoResize"
    />
    <button type="submit" class="btn-primary flex-shrink-0" :disabled="!text.trim() || props.loading">
      {{ props.loading ? "..." : "Send" }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{ loading: boolean }>();
const emit = defineEmits<{ send: [text: string] }>();

const text = ref("");

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 200) + "px";
}

function send() {
  const trimmed = text.value.trim();
  if (!trimmed || props.loading) return;
  emit("send", trimmed);
  text.value = "";
}
</script>
