<template>
  <div class="relative">
    <input
      ref="fileInput"
      type="file"
      accept=".pdf,.txt,.md"
      class="hidden"
      @change="handleFile"
    />
    <button
      class="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      :disabled="uploading"
      @click="fileInput?.click()"
    >
      {{ uploading ? "Uploading..." : "+ File" }}
    </button>
    <div v-if="documentIds.length" class="mt-2 flex flex-wrap gap-1">
      <span
        v-for="id in documentIds"
        :key="id"
        class="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full"
      >
        {{ id.slice(0, 8) }}...
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const fileInput = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const documentIds = ref<string[]>([]);

const emit = defineEmits<{ uploaded: [id: string] }>();

async function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const { uploadDocument } = useChat();
    const { document_id } = await uploadDocument(file);
    documentIds.value.push(document_id);
    emit("uploaded", document_id);
  } finally {
    uploading.value = false;
  }
}
</script>
