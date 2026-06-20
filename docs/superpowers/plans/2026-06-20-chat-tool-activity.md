# Chat Tool Activity UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace markdown tool spam with Cursor-style collapsible tool activity lists on WorkflowRun step chat and Desktop Chat Agent mode.

**Architecture:** Extend `ChatMessage` with `toolRuns[]`; pure `useToolRuns` helpers mutate runs; `ToolActivityList` component in shared-ui; pages wire SSE `tool_start`/`tool_end` to message state instead of `appendToolNote`.

**Tech Stack:** Vue 3, TypeScript, Vitest + happy-dom, UnoCSS utility classes

**Spec:** `docs/superpowers/specs/2026-06-20-chat-tool-activity-design.md`

**Worktree:** `/Users/hz/Desktop/fe/agentFlowContainer/.worktrees/feat-chat-tool-activity`

---

### Task 1: Types + `useToolRuns` helpers + unit tests

**Files:**
- Modify: `packages/shared-ui/src/types/chat.ts`
- Create: `packages/shared-ui/src/composables/useToolRuns.ts`
- Create: `packages/shared-ui/tests/useToolRuns.test.ts`
- Modify: `packages/shared-ui/src/index.ts` (export types/helpers)

- [ ] **Step 1: Extend types in `chat.ts`**

Add after `ToolEvent`:

```ts
export type ToolRunStatus = "running" | "done" | "error";

export interface ToolRun {
  callId: string;
  name: string;
  status: ToolRunStatus;
  output?: string;
}
```

Add to `ChatMessage`:

```ts
  toolRuns?: ToolRun[];
```

- [ ] **Step 2: Write failing tests**

Create `packages/shared-ui/tests/useToolRuns.test.ts`:

```ts
// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import type { ToolEvent, ToolRun } from "../src/types/chat";
import { applyToolEnd, upsertToolStart } from "../src/composables/useToolRuns";

describe("useToolRuns", () => {
  it("upsertToolStart adds a running run", () => {
    const event: ToolEvent = { call_id: "c1", name: "read_file" };
    const runs = upsertToolStart([], event);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toEqual({ callId: "c1", name: "read_file", status: "running" });
  });

  it("upsertToolStart updates existing callId", () => {
    const existing: ToolRun[] = [{ callId: "c1", name: "read_file", status: "done" }];
    const runs = upsertToolStart(existing, { call_id: "c1", name: "read_file" });
    expect(runs).toHaveLength(1);
    expect(runs[0]!.status).toBe("running");
  });

  it("applyToolEnd marks done when ok", () => {
    const runs: ToolRun[] = [{ callId: "c1", name: "read_file", status: "running" }];
    const next = applyToolEnd(runs, { call_id: "c1", name: "read_file", ok: true, output: "ok" });
    expect(next[0]!.status).toBe("done");
    expect(next[0]!.output).toBe("ok");
  });

  it("applyToolEnd marks error when ok is false", () => {
    const runs: ToolRun[] = [{ callId: "c1", name: "write_file", status: "running" }];
    const next = applyToolEnd(runs, { call_id: "c1", name: "write_file", ok: false, output: "denied" });
    expect(next[0]!.status).toBe("error");
  });

  it("uses fallback callId when call_id missing", () => {
    const runs = upsertToolStart([], { name: "list_dir" });
    expect(runs[0]!.callId).toMatch(/^list_dir-/);
  });
});
```

- [ ] **Step 3: Run tests — expect FAIL**

Run: `cd packages/shared-ui && npx vitest run tests/useToolRuns.test.ts`

- [ ] **Step 4: Implement `useToolRuns.ts`**

```ts
import type { ToolEvent, ToolRun } from "../types/chat";

function resolveCallId(event: ToolEvent, existing: ToolRun[]): string {
  if (event.call_id) return event.call_id;
  const base = event.name ?? "tool";
  let n = existing.length;
  let id = `${base}-${n}`;
  while (existing.some((r) => r.callId === id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

export function upsertToolStart(runs: ToolRun[], event: ToolEvent): ToolRun[] {
  const callId = resolveCallId(event, runs);
  const name = event.name ?? "unknown";
  const idx = runs.findIndex((r) => r.callId === callId);
  if (idx >= 0) {
    const next = [...runs];
    next[idx] = { ...next[idx]!, callId, name, status: "running" };
    return next;
  }
  return [...runs, { callId, name, status: "running" }];
}

export function applyToolEnd(runs: ToolRun[], event: ToolEvent): ToolRun[] {
  const callId = event.call_id ?? runs.find((r) => r.name === event.name && r.status === "running")?.callId;
  if (!callId) return runs;
  const next = [...runs];
  const idx = next.findIndex((r) => r.callId === callId);
  if (idx < 0) return runs;
  next[idx] = {
    ...next[idx]!,
    status: event.ok === false ? "error" : "done",
    output: event.output,
  };
  return next;
}
```

- [ ] **Step 5: Export from index.ts**

```ts
export { upsertToolStart, applyToolEnd } from "./composables/useToolRuns";
export type { ToolRun, ToolRunStatus } from "./types/chat";
```

- [ ] **Step 6: Run tests — expect PASS**

Run: `cd packages/shared-ui && npx vitest run tests/useToolRuns.test.ts`

---

### Task 2: `ToolActivityList` component + `ChatMessage` integration

**Files:**
- Create: `packages/shared-ui/src/components/ToolActivityList.vue`
- Create: `packages/shared-ui/tests/ToolActivityList.test.ts`
- Modify: `packages/shared-ui/src/components/ChatMessage.vue`
- Modify: `packages/shared-ui/src/index.ts`

- [ ] **Step 1: Create `ToolActivityList.vue`**

```vue
<template>
  <div v-if="runs.length" class="mb-2 space-y-1" data-testid="tool-activity-list">
    <div v-for="run in runs" :key="run.callId" class="text-xs">
      <button
        type="button"
        class="flex items-center gap-2 w-full text-left rounded px-2 py-1 hover:bg-gray-200/60 dark:hover:bg-gray-600/40"
        :class="statusClass(run.status)"
        @click="toggle(run.callId)"
      >
        <span class="w-4 flex-shrink-0 text-center">{{ statusIcon(run.status) }}</span>
        <span class="font-medium">{{ run.name }}</span>
        <span v-if="run.status === 'running'" class="text-gray-400 animate-pulse">…</span>
      </button>
      <pre
        v-if="expanded[run.callId] && run.output"
        class="mt-1 ml-6 p-2 rounded bg-gray-900/5 dark:bg-black/20 text-[10px] overflow-auto max-h-[120px] whitespace-pre-wrap"
        data-testid="tool-output"
      >{{ run.output }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import type { ToolRun } from "../types/chat";

const props = defineProps<{ runs: ToolRun[] }>();
const expanded = reactive<Record<string, boolean>>({});

watch(
  () => props.runs,
  (runs) => {
    for (const run of runs) {
      if (run.status === "error") expanded[run.callId] = true;
    }
  },
  { deep: true, immediate: true },
);

function toggle(callId: string) {
  expanded[callId] = !expanded[callId];
}

function statusIcon(status: ToolRun["status"]) {
  if (status === "running") return "●";
  if (status === "error") return "✗";
  return "✓";
}

function statusClass(status: ToolRun["status"]) {
  if (status === "error") return "text-red-600 dark:text-red-400";
  if (status === "running") return "text-gray-500";
  return "text-gray-600 dark:text-gray-300";
}
</script>
```

- [ ] **Step 2: Write component test**

```ts
// @vitest-environment happy-dom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ToolActivityList from "../src/components/ToolActivityList.vue";

describe("ToolActivityList", () => {
  it("renders runs and expands on click", async () => {
    const wrapper = mount(ToolActivityList, {
      props: {
        runs: [{ callId: "c1", name: "read_file", status: "done", output: "file contents" }],
      },
    });
    expect(wrapper.find('[data-testid="tool-activity-list"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("read_file");
    expect(wrapper.find('[data-testid="tool-output"]').exists()).toBe(false);
    await wrapper.find("button").trigger("click");
    expect(wrapper.find('[data-testid="tool-output"]').text()).toBe("file contents");
  });

  it("auto-expands error runs", () => {
    const wrapper = mount(ToolActivityList, {
      props: {
        runs: [{ callId: "c1", name: "write_file", status: "error", output: "fail" }],
      },
    });
    expect(wrapper.find('[data-testid="tool-output"]').exists()).toBe(true);
  });
});
```

- [ ] **Step 3: Update `ChatMessage.vue`**

Import and render above markdown for assistant:

```vue
import ToolActivityList from "./ToolActivityList.vue";
```

Inside assistant bubble div, before markdown:

```vue
<ToolActivityList v-if="msg.toolRuns?.length" :runs="msg.toolRuns" />
```

- [ ] **Step 4: Run tests**

Run: `cd packages/shared-ui && npx vitest run`

---

### Task 3: WorkflowRun step chat integration

**Files:**
- Modify: `desktop/src/pages/WorkflowRun.vue`

- [ ] **Step 1: Import helpers**

```ts
import {
  ...
  upsertToolStart,
  applyToolEnd,
} from "@agent-flow/shared-ui";
```

- [ ] **Step 2: Replace assistant append helpers**

Add:

```ts
function ensureStepAssistantShell(stepId: string) {
  if (!stepMessages.value[stepId]) stepMessages.value[stepId] = [];
  const msgs = stepMessages.value[stepId];
  const last = msgs[msgs.length - 1];
  if (last?.role !== "assistant") {
    msgs.push({ role: "assistant", content: "", toolRuns: [] });
  } else if (!last.toolRuns) {
    last.toolRuns = [];
  }
}

function applyStepToolStart(stepId: string, event: ToolEvent) {
  ensureStepAssistantShell(stepId);
  const msgs = stepMessages.value[stepId]!;
  const last = msgs[msgs.length - 1]!;
  last.toolRuns = upsertToolStart(last.toolRuns ?? [], event);
}

function applyStepToolEnd(stepId: string, event: ToolEvent) {
  ensureStepAssistantShell(stepId);
  const msgs = stepMessages.value[stepId]!;
  const last = msgs[msgs.length - 1]!;
  last.toolRuns = applyToolEnd(last.toolRuns ?? [], event);
}
```

Update `appendStepAssistant` to call `ensureStepAssistantShell` before appending content.

- [ ] **Step 3: Delete `appendToolNote` and update event loop**

Replace:
```ts
} else if (event.type === "tool_start") {
  appendToolNote(stepId, event.event, "start");
} else if (event.type === "tool_end") {
  appendToolNote(stepId, event.event, "end");
```
With:
```ts
} else if (event.type === "tool_start") {
  applyStepToolStart(stepId, event.event);
} else if (event.type === "tool_end") {
  applyStepToolEnd(stepId, event.event);
```

Keep existing workspace approval / refresh logic on tool_end.

- [ ] **Step 4: Remove "Running step…" when tools active (optional polish)**

In template, change running indicator to only show when running && no tool runs on last message — or remove line entirely since tool list shows progress.

- [ ] **Step 5: Before user send, don't pre-create assistant shell** — only on first chunk or tool event.

Call `ensureStepAssistantShell` at start of stream loop first iteration OR on first message/tool event.

In `onStepSend`, after pushing user message, set `liveOutput` but do NOT push assistant until first event.

---

### Task 4: Desktop Chat Agent mode integration

**Files:**
- Modify: `packages/shared-ui/src/useMessages.ts`
- Modify: `desktop/src/pages/Chat.vue`

- [ ] **Step 1: Extend `useMessages.ts`**

Add:

```ts
import type { ToolEvent, ToolRun } from "./types/chat";
import { applyToolEnd, upsertToolStart } from "./composables/useToolRuns";

function ensureAssistantShell(messages: ChatMessage[]) {
  const last = messages[messages.length - 1];
  if (last?.role !== "assistant") {
    messages.push({ role: "assistant", content: "", toolRuns: [] });
  } else if (!last.toolRuns) {
    last.toolRuns = [];
  }
}

function applyToolStart(event: ToolEvent) {
  ensureAssistantShell(messages.value);
  const last = messages.value[messages.value.length - 1]!;
  last.toolRuns = upsertToolStart(last.toolRuns ?? [], event);
  save();
}

function applyToolEnd(event: ToolEvent) {
  ensureAssistantShell(messages.value);
  const last = messages.value[messages.value.length - 1]!;
  last.toolRuns = applyToolEnd(last.toolRuns ?? [], event);
  save();
}
```

Export `applyToolStart`, `applyToolEnd` from composable return.

Update `addAssistantChunk` to call `ensureAssistantShell` before appending.

- [ ] **Step 2: Wire `Chat.vue` `onSend`**

Destructure `applyToolStart`, `applyToolEnd` from `useMessages`.

In event loop, when `threadMeta.mode === "agent"`:

```ts
} else if (event.type === "tool_start") {
  applyToolStart(event.event);
} else if (event.type === "tool_end") {
  applyToolEnd(event.event);
}
```

Skip tool handling for ask/plan modes.

- [ ] **Step 3: Run shared-ui tests**

Run: `cd packages/shared-ui && npx vitest run`

- [ ] **Step 4: Manual smoke**

WorkflowRun step chat: agent run with read_file — activity list updates in place, no markdown blockquotes. Chat Agent mode: same behavior.
