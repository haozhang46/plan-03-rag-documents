<template>
  <SharedChatMessage v-bind="$attrs" />
</template>

<script setup lang="ts">
import { ChatMessage as SharedChatMessage } from "@agent-flow/shared-ui";
</script>
