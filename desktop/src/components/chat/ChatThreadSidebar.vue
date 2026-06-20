<script setup lang="ts">
export interface ChatThreadItem {
  id: string;
  title: string;
  updatedAt?: string;
}

const props = defineProps<{
  threads: ChatThreadItem[];
  activeId: string | null;
  collapsed: boolean;
}>();

const emit = defineEmits<{
  "update:collapsed": [value: boolean];
  select: [id: string];
  create: [];
}>();

function toggleCollapsed() {
  emit("update:collapsed", !props.collapsed);
}
</script>

<template>
  <aside
    class="flex flex-col shrink-0 border-r border-gray-200 bg-gray-50 transition-[width]"
    :class="collapsed ? 'w-7' : 'w-40'"
    data-testid="chat-thread-sidebar"
  >
    <template v-if="collapsed">
      <button
        type="button"
        class="flex flex-1 items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Expand thread list"
        data-testid="chat-thread-toggle"
        @click="toggleCollapsed"
      >
        ▶
      </button>
    </template>

    <template v-else>
      <div class="flex items-center gap-1 border-b border-gray-200 p-2">
        <button
          type="button"
          class="shrink-0 px-1 text-gray-500 hover:text-gray-700"
          aria-label="Collapse thread list"
          data-testid="chat-thread-toggle"
          @click="toggleCollapsed"
        >
          ◀
        </button>
        <button
          type="button"
          class="min-w-0 flex-1 truncate rounded px-2 py-1 text-xs text-blue-700 hover:bg-blue-50"
          data-testid="chat-thread-create"
          @click="emit('create')"
        >
          + New
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <button
          v-for="thread in threads"
          :key="thread.id"
          type="button"
          class="w-full truncate px-3 py-2 text-left text-sm hover:bg-gray-100"
          :class="activeId === thread.id ? 'bg-blue-50 text-blue-700' : ''"
          :data-testid="`chat-thread-item-${thread.id}`"
          @click="emit('select', thread.id)"
        >
          {{ thread.title }}
        </button>
      </div>
    </template>
  </aside>
</template>
