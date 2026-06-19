<script setup lang="ts">
import WorkflowMarkdownPanel from "../../components/workflow/WorkflowMarkdownPanel.vue";
import type { PanelApi } from "../registryComponents";

defineProps<{
  api: PanelApi;
  docsDir?: string;
}>();
</script>

<template>
  <WorkflowMarkdownPanel :api="api" :docs-dir="docsDir" />
</template>
