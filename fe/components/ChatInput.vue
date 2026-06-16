<template>
  <SharedChatInput v-bind="$attrs" @send="(text: string) => $emit('send', text)" />
</template>

<script setup lang="ts">
import { ChatInput as SharedChatInput } from "@agent-flow/shared-ui";

defineEmits<{ send: [text: string] }>();
</script>
