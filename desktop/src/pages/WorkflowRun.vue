<script setup lang="ts">
defineProps<{ workspace: string }>();
</script>

<template>
  <div class="flex-1 flex items-center justify-center p-8 bg-gray-50">
    <p class="text-gray-600">Workflow Run — {{ workspace }}</p>
  </div>
</template>
