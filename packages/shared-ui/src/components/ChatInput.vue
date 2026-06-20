<template>
  <form class="flex items-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" @submit.prevent="send">
    <div class="flex-1 flex flex-col gap-2">
      <div v-if="attachments.length" class="flex flex-wrap gap-2">
        <span
          v-for="attachment in attachments"
          :key="attachment.path"
          data-testid="chat-attachment-chip"
          class="inline-flex items-center gap-1 px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          {{ attachment.label }}
          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            :disabled="props.loading || props.disabled"
            @click="removeAttachment(attachment.path)"
          >
            ×
          </button>
        </span>
      </div>
      <textarea
        ref="textareaRef"
        v-model="text"
        class="input-field resize-none min-h-[44px]"
        rows="1"
        placeholder="Type a message..."
        :disabled="props.loading || props.disabled"
        @compositionstart="onCompositionStart"
        @compositionend="onCompositionEnd"
        @keydown="onHistoryKeydown"
        @keydown.enter.exact="onEnterKeydown"
        @input="onInput"
      />
    </div>
    <button
      type="submit"
      class="btn-primary flex-shrink-0"
      :disabled="(!text.trim() && !attachments.length) || props.loading || props.disabled"
    >
      {{ props.loading ? "..." : "Send" }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useSubmitOnEnter } from "../composables/useSubmitOnEnter";
import { useTextareaHistoryKeydown } from "../composables/useTextareaHistoryKeydown";
import { useTextareaUndo } from "../composables/useTextareaUndo";
import type { ChatAttachment } from "../types/chat";

const props = defineProps<{ loading: boolean; disabled?: boolean }>();
const emit = defineEmits<{ send: [payload: { text: string; attachments: ChatAttachment[] }] }>();

const text = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const attachments = ref<ChatAttachment[]>([]);
const { record, undo, redo } = useTextareaUndo();

function addAttachment(item: ChatAttachment) {
  if (attachments.value.some((a) => a.path === item.path)) return;
  attachments.value.push(item);
}

function removeAttachment(path: string) {
  attachments.value = attachments.value.filter((a) => a.path !== path);
}

defineExpose({ addAttachment });

function resizeTextarea(el?: HTMLTextAreaElement | null) {
  const target = el ?? textareaRef.value;
  if (!target) return;
  target.style.height = "auto";
  target.style.height = target.scrollHeight + "px";
}

function onInput(e: Event) {
  const el = e.target as HTMLTextAreaElement;
  record(el.value);
  resizeTextarea(el);
}

function send() {
  const trimmed = text.value.trim();
  if ((!trimmed && !attachments.value.length) || props.loading) return;
  emit("send", { text: trimmed, attachments: [...attachments.value] });
  text.value = "";
  record("");
  attachments.value = [];
}

const { composing, onCompositionStart, onCompositionEnd, onEnterKeydown } = useSubmitOnEnter(send);
const { onHistoryKeydown } = useTextareaHistoryKeydown({
  composing,
  text,
  undo,
  redo,
  onResize: () => resizeTextarea(),
});
</script>
