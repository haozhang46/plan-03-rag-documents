# Markdown File Panel Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract shared `MarkdownFilePanel.vue` for `markdown-doc` and `agent-rules-editor`, eliminating duplicate UI while preserving both registry types.

**Architecture:** Single panel component with `mode: 'directory' | 'file-list'`. Wrapper widgets pass mode-specific props. `defaultRuleContent.ts` holds agent-rules template logic. Delete `WorkflowMarkdownPanel.vue`.

**Tech Stack:** Vue 3, TypeScript, Vitest, `@vue/test-utils`, happy-dom

**Spec:** `docs/superpowers/specs/2026-06-20-markdown-file-panel-unify-design.md`

---

## File Map

| File | Responsibility |
|------|----------------|
| `desktop/src/components/workflow/defaultRuleContent.ts` | Template strings for missing agent rule files |
| `desktop/src/components/workflow/MarkdownFilePanel.vue` | Unified file list + editor panel |
| `desktop/src/workspace/widgets/MarkdownDocWidget.vue` | Wrapper: directory mode |
| `desktop/src/workspace/widgets/AgentRulesEditorWidget.vue` | Wrapper: file-list mode |
| `desktop/tests/components/MarkdownFilePanel.test.ts` | Panel unit tests (both modes) |

---

### Task 1: defaultRuleContent helper + directory-mode tests

**Files:**
- Create: `desktop/src/components/workflow/defaultRuleContent.ts`
- Create: `desktop/tests/components/MarkdownFilePanel.test.ts` (directory tests only initially)
- Create: `desktop/src/components/workflow/MarkdownFilePanel.vue` (minimal directory mode)

- [ ] **Step 1: Write defaultRuleContent**

```ts
// desktop/src/components/workflow/defaultRuleContent.ts
export function defaultRuleContent(path: string): string {
  const name = path.split("/").pop() ?? path;
  if (name.toUpperCase() === "CLAUDE.md") {
    return "@AGENTS.md\n\n# Claude-Specific Instructions\n\n## Behavioral Rules\n\n- Follow the project rules in AGENTS.md exactly.\n";
  }
  if (name.toUpperCase() === "AGENTS.md") {
    return "# Project Agent Rules\n\n## Stack\n\n_Describe stack and conventions here._\n\n## What NOT to Do\n\n-\n";
  }
  return `# ${name.replace(/\.md$/i, "")}\n\n_Agent instructions for this file._\n`;
}
```

- [ ] **Step 2: Write failing directory-mode tests**

```ts
// desktop/tests/components/MarkdownFilePanel.test.ts
// @vitest-environment happy-dom
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import MarkdownFilePanel from "../../src/components/workflow/MarkdownFilePanel.vue";
import type { PanelApi } from "../../src/workspace/registryComponents";

function mockApi(overrides: Partial<PanelApi> = {}): PanelApi {
  return {
    fetchPhase: vi.fn(),
    fetchGates: vi.fn(),
    fetchDeploymentConfig: vi.fn(),
    fetchResourceContext: vi.fn(),
    fetchTopology: vi.fn(),
    fetchOpsSummary: vi.fn(),
    listWorkspace: vi.fn().mockResolvedValue({
      entries: [{ path: "docs/PRD.md", name: "PRD.md", type: "file" }],
    }),
    readWorkspaceFile: vi.fn().mockResolvedValue({ content: "# PRD" }),
    writeWorkspaceFile: vi.fn(),
    deleteWorkspacePath: vi.fn(),
    ...overrides,
  };
}

describe("MarkdownFilePanel directory mode", () => {
  it("lists md files from docsDir and shows add-to-chat menu", async () => {
    const addToChat = vi.fn().mockResolvedValue(undefined);
    const wrapper = mount(MarkdownFilePanel, {
      props: { api: mockApi({ addToChat }), mode: "directory", docsDir: "docs" },
      attachTo: document.body,
    });
    await flushPromises();
    expect(wrapper.find('[data-testid="markdown-file-item"]').exists()).toBe(true);
    await wrapper.find('[data-testid="markdown-file-item"]').trigger("contextmenu");
    await wrapper.vm.$nextTick();
    expect(document.querySelector('[data-testid="markdown-file-context-menu"]')).not.toBeNull();
    (document.querySelector('[data-testid="markdown-add-to-chat"]') as HTMLButtonElement).click();
    await flushPromises();
    expect(addToChat).toHaveBeenCalledWith({ path: "docs/PRD.md", label: "PRD.md" });
    wrapper.unmount();
  });
});
```

- [ ] **Step 3: Run test — expect FAIL** (component missing)

Run: `cd desktop && pnpm test tests/components/MarkdownFilePanel.test.ts`

- [ ] **Step 4: Implement MarkdownFilePanel directory mode**

Move logic from `WorkflowMarkdownPanel.vue` into `MarkdownFilePanel.vue` with props:
- `mode: 'directory'`
- `docsDir`, `sidebarTitle` (default "Documents"), `allowDelete` (default true)

Keep same data-testids: `markdown-file-item`, `markdown-file-context-menu`, `markdown-add-to-chat`.

- [ ] **Step 5: Run test — expect PASS**

Run: `cd desktop && pnpm test tests/components/MarkdownFilePanel.test.ts`

---

### Task 2: file-list mode + agent-rules tests

**Files:**
- Modify: `desktop/src/components/workflow/MarkdownFilePanel.vue`
- Modify: `desktop/tests/components/MarkdownFilePanel.test.ts`

- [ ] **Step 1: Write failing file-list tests**

```ts
describe("MarkdownFilePanel file-list mode", () => {
  it("loads configured files and shows default template for missing file", async () => {
    const api = mockApi({
      readWorkspaceFile: vi.fn().mockRejectedValue(new Error("ENOENT: not found")),
    });
    const wrapper = mount(MarkdownFilePanel, {
      props: {
        api,
        mode: "file-list",
        files: [{ path: "AGENTS.md", label: "AGENTS.md" }],
        sidebarTitle: "Agent Rules",
      },
    });
    await flushPromises();
    expect(wrapper.find('[data-testid="rule-file-editor"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="rule-file-editor"]').element.value).toContain("Project Agent Rules");
  });

  it("adds new file via inline form", async () => {
    const api = mockApi({
      readWorkspaceFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
    });
    const wrapper = mount(MarkdownFilePanel, {
      props: { api, mode: "file-list", files: [{ path: "AGENTS.md", label: "AGENTS.md" }] },
    });
    await flushPromises();
    await wrapper.find('[data-testid="add-rule-file"]').trigger("click");
    await wrapper.find('[data-testid="new-rule-path"]').setValue("fe/GEMINI.md");
    await wrapper.find('[data-testid="confirm-add-rule"]').trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("fe/GEMINI.md");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

- [ ] **Step 3: Add file-list mode to MarkdownFilePanel**

Port from `AgentRulesEditorWidget.vue`:
- `initFileList` from props.files / defaultFiles
- inline add form
- `defaultRuleContent` on ENOENT
- `allowDelete: false` — no Delete button
- preserve data-testids: `add-rule-file`, `new-rule-path`, `confirm-add-rule`, `rule-file-editor`, `save-rule-file`

- [ ] **Step 4: Run tests — expect PASS**

Run: `cd desktop && pnpm test tests/components/MarkdownFilePanel.test.ts`

---

### Task 3: Wire wrappers, delete old panel, full suite

**Files:**
- Modify: `desktop/src/workspace/widgets/MarkdownDocWidget.vue`
- Modify: `desktop/src/workspace/widgets/AgentRulesEditorWidget.vue`
- Delete: `desktop/src/components/workflow/WorkflowMarkdownPanel.vue`
- Delete: `desktop/tests/components/WorkflowMarkdownPanel.test.ts`

- [ ] **Step 1: MarkdownDocWidget wrapper**

```vue
<script setup lang="ts">
import MarkdownFilePanel from "../../components/workflow/MarkdownFilePanel.vue";
import type { PanelApi } from "../registryComponents";

defineProps<{ api: PanelApi; docsDir?: string }>();
</script>

<template>
  <MarkdownFilePanel
    :api="api"
    mode="directory"
    :docs-dir="docsDir"
    sidebar-title="Documents"
    :allow-delete="true"
  />
</template>
```

- [ ] **Step 2: AgentRulesEditorWidget wrapper**

```vue
<script setup lang="ts">
import MarkdownFilePanel from "../../components/workflow/MarkdownFilePanel.vue";
import type { PanelApi } from "../registryComponents";

const DEFAULT_FILES = [
  { path: "AGENTS.md", label: "AGENTS.md" },
  { path: "CLAUDE.md", label: "CLAUDE.md" },
];

defineProps<{
  api: PanelApi;
  files?: { path: string; label: string }[];
  editable?: boolean;
}>();
</script>

<template>
  <MarkdownFilePanel
    :api="api"
    mode="file-list"
    :files="files"
    :default-files="DEFAULT_FILES"
    :editable="editable"
    sidebar-title="Agent Rules"
    :allow-delete="false"
  />
</template>
```

- [ ] **Step 3: Delete WorkflowMarkdownPanel.vue and its test file**

- [ ] **Step 4: Run full desktop test suite**

Run: `cd desktop && pnpm test`
Expected: all tests pass (including `feWidgets.test.ts` agent-rules tests)

---

## Spec Coverage Check

| Spec requirement | Task |
|------------------|------|
| Shared MarkdownFilePanel | Task 1–2 |
| Both modes | Task 1–2 |
| Add to chat both modes | Task 1–2 |
| Thin wrappers | Task 3 |
| Delete WorkflowMarkdownPanel | Task 3 |
| Registry unchanged | No task needed |
| defaultRuleContent | Task 1 |
