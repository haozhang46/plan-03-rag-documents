# Agent Rules Live Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When Chat AI completes `write_file`, `MarkdownFilePanel` preview refreshes immediately via a Chat event bus.

**Architecture:** `WorkflowRun` parses `write_file` tool_end output, broadcasts path via `PanelApi.subscribeFileWrites`. `MarkdownFilePanel` reloads selected file or marks sidebar dot for non-selected paths.

**Tech Stack:** Vue 3, TypeScript, Vitest, `@vue/test-utils`, happy-dom

**Spec:** `docs/superpowers/specs/2026-06-20-agent-rules-live-preview-design.md`

---

## File Map

| File | Responsibility |
|------|----------------|
| `desktop/src/utils/parseWriteFilePath.ts` | Parse `Wrote {path} (N bytes)` tool output |
| `desktop/src/utils/normalizeWorkspacePath.ts` | Normalize paths for comparison |
| `desktop/src/workspace/registryComponents.ts` | `subscribeFileWrites?` on `PanelApi` |
| `desktop/src/pages/WorkflowRun.vue` | Listener registry + hook both chat handlers |
| `desktop/src/components/workflow/MarkdownFilePanel.vue` | Subscribe, reload, sidebar dots |
| `desktop/tests/utils/parseWriteFilePath.test.ts` | Parser unit tests |
| `desktop/tests/components/MarkdownFilePanel.test.ts` | Live refresh + dot tests |

---

### Task 1: Path parser utility

**Files:**
- Create: `desktop/src/utils/parseWriteFilePath.ts`
- Create: `desktop/src/utils/normalizeWorkspacePath.ts`
- Create: `desktop/tests/utils/parseWriteFilePath.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// desktop/tests/utils/parseWriteFilePath.test.ts
import { describe, expect, it } from "vitest";
import { parseWriteFilePath } from "../../src/utils/parseWriteFilePath";
import { normalizeWorkspacePath } from "../../src/utils/normalizeWorkspacePath";

describe("parseWriteFilePath", () => {
  it("extracts path from write_file output", () => {
    expect(parseWriteFilePath("Wrote AGENTS.md (42 bytes)")).toBe("AGENTS.md");
    expect(parseWriteFilePath("Wrote fe/GEMINI.md (100 bytes)")).toBe("fe/GEMINI.md");
  });

  it("returns null for missing or malformed output", () => {
    expect(parseWriteFilePath(undefined)).toBeNull();
    expect(parseWriteFilePath("")).toBeNull();
    expect(parseWriteFilePath("Error: denied")).toBeNull();
  });
});

describe("normalizeWorkspacePath", () => {
  it("normalizes slashes and strips leading ./", () => {
    expect(normalizeWorkspacePath(".\\fe/AGENTS.md")).toBe("fe/AGENTS.md");
    expect(normalizeWorkspacePath("./AGENTS.md")).toBe("AGENTS.md");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd desktop && pnpm test tests/utils/parseWriteFilePath.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement**

```ts
// desktop/src/utils/parseWriteFilePath.ts
const WRITE_FILE_OUTPUT_RE = /^Wrote (.+?) \(\d+ bytes\)$/;

export function parseWriteFilePath(output: string | undefined): string | null {
  if (!output) return null;
  const m = output.match(WRITE_FILE_OUTPUT_RE);
  return m?.[1]?.trim() ?? null;
}
```

```ts
// desktop/src/utils/normalizeWorkspacePath.ts
export function normalizeWorkspacePath(relPath: string): string {
  return relPath.replace(/\\/g, "/").replace(/^\.\//, "");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd desktop && pnpm test tests/utils/parseWriteFilePath.test.ts`
Expected: PASS

---

### Task 2: Chat event bus in WorkflowRun

**Files:**
- Modify: `desktop/src/workspace/registryComponents.ts`
- Modify: `desktop/src/pages/WorkflowRun.vue`

- [ ] **Step 1: Extend PanelApi**

Add to `PanelApi` in `registryComponents.ts`:

```ts
subscribeFileWrites?: (handler: (path: string) => void) => () => void;
```

- [ ] **Step 2: Add listener registry in WorkflowRun.vue**

Import `parseWriteFilePath` and `normalizeWorkspacePath`. Before `panelApi` definition:

```ts
const fileWriteListeners = new Set<(path: string) => void>();

function notifyFileWritten(path: string) {
  const normalized = normalizeWorkspacePath(path);
  for (const fn of fileWriteListeners) fn(normalized);
}

function handleWriteFileToolEnd(event: { name?: string; ok?: boolean; output?: string }) {
  if (event.name !== "write_file" || event.ok === false) return;
  const path = parseWriteFilePath(event.output);
  if (path) notifyFileWritten(path);
}
```

Add to `panelApi`:

```ts
subscribeFileWrites: (fn) => {
  fileWriteListeners.add(fn);
  return () => fileWriteListeners.delete(fn);
},
```

- [ ] **Step 3: Wire onStepSend and onFreeSend**

In both `tool_end` branches (after existing handlers), add:

```ts
handleWriteFileToolEnd(event.event);
```

- [ ] **Step 4: Run existing tests**

Run: `cd desktop && pnpm test tests/pages/WorkflowRun.test.ts`
Expected: PASS (no regressions)

---

### Task 3: MarkdownFilePanel live sync + sidebar dots

**Files:**
- Modify: `desktop/src/components/workflow/MarkdownFilePanel.vue`
- Modify: `desktop/tests/components/MarkdownFilePanel.test.ts`

- [ ] **Step 1: Write failing component tests**

Add describe block `MarkdownFilePanel live file sync`:

```ts
describe("MarkdownFilePanel live file sync", () => {
  it("reloads content when subscribed path matches selected file", async () => {
    const listeners = new Set<(path: string) => void>();
    const readWorkspaceFile = vi
      .fn()
      .mockResolvedValueOnce({ content: "# Old" })
      .mockResolvedValueOnce({ content: "# Updated by AI" });
    const api = mockApi({
      readWorkspaceFile,
      subscribeFileWrites: (fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
    });
    const wrapper = mount(MarkdownFilePanel, {
      props: {
        api,
        mode: "file-list",
        files: [{ path: "AGENTS.md", label: "AGENTS.md" }],
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain("Old");
    for (const fn of listeners) fn("AGENTS.md");
    await flushPromises();
    expect(readWorkspaceFile).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain("Updated by AI");
  });

  it("shows dot for non-selected file and clears on select", async () => {
    const listeners = new Set<(path: string) => void>();
    const readWorkspaceFile = vi.fn().mockImplementation(async (path: string) => ({
      content: path === "AGENTS.md" ? "# A" : "# C",
    }));
    const api = mockApi({
      readWorkspaceFile,
      subscribeFileWrites: (fn) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
    });
    const wrapper = mount(MarkdownFilePanel, {
      props: {
        api,
        mode: "file-list",
        files: [
          { path: "AGENTS.md", label: "AGENTS.md" },
          { path: "CLAUDE.md", label: "CLAUDE.md" },
        ],
      },
    });
    await flushPromises();
    const buttons = wrapper.findAll("aside button");
    await buttons[1]!.trigger("click");
    await flushPromises();
    for (const fn of listeners) fn("AGENTS.md");
    await flushPromises();
    expect(wrapper.find('[data-testid="file-updated-dot"]').exists()).toBe(true);
    await buttons[0]!.trigger("click");
    await flushPromises();
    expect(wrapper.find('[data-testid="file-updated-dot"]').exists()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd desktop && pnpm test tests/components/MarkdownFilePanel.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement in MarkdownFilePanel.vue**

Add imports: `normalizeWorkspacePath`, store `updatedPaths = ref<Set<string>>(new Set())`, `unsubFileWrites` ref.

Add helpers:

```ts
function isPathInSidebar(path: string): boolean {
  if (isFileListMode.value) {
    return fileListFiles.value.some((f) => normalizeWorkspacePath(f.path) === path);
  }
  return directoryFiles.value.some((f) => normalizeWorkspacePath(f.path) === path);
}

async function reloadSelectedFile() {
  if (!selectedPath.value) return;
  loading.value = true;
  error.value = null;
  try {
    const file = await props.api.readWorkspaceFile(selectedPath.value);
    content.value = file.content;
    draft.value = file.content;
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
}

async function onExternalFileWrite(path: string) {
  const normalized = normalizeWorkspacePath(path);
  if (selectedPath.value && normalizeWorkspacePath(selectedPath.value) === normalized) {
    await reloadSelectedFile();
    updatedPaths.value.delete(normalized);
    updatedPaths.value = new Set(updatedPaths.value);
    return;
  }
  if (isPathInSidebar(normalized)) {
    updatedPaths.value.add(normalized);
    updatedPaths.value = new Set(updatedPaths.value);
  }
}

function clearUpdatedDot(path: string) {
  const normalized = normalizeWorkspacePath(path);
  if (updatedPaths.value.has(normalized)) {
    updatedPaths.value.delete(normalized);
    updatedPaths.value = new Set(updatedPaths.value);
  }
}
```

In `onMounted`, subscribe:

```ts
const unsub = props.api.subscribeFileWrites?.((path) => void onExternalFileWrite(path));
if (unsub) {
  onUnmounted(unsub);
}
```

Note: use a variable `let unsubFileWrites: (() => void) | undefined` and call in `onUnmounted` alongside existing cleanup.

In `loadListFile` / `selectDirectoryFile` start: call `clearUpdatedDot(path)`.

Template — sidebar buttons (both modes), wrap label + dot:

```vue
<span class="flex items-center gap-1.5 min-w-0">
  <span class="truncate">{{ file.label }}</span>
  <span
    v-if="updatedPaths.has(normalizeWorkspacePath(file.path))"
    class="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
    data-testid="file-updated-dot"
    aria-label="Updated by AI"
  />
</span>
```

Expose `normalizeWorkspacePath` to template via importing in script (call in template as function — may need helper `isPathUpdated(path: string)` instead for cleaner template).

Prefer:

```ts
function isPathUpdated(path: string): boolean {
  return updatedPaths.value.has(normalizeWorkspacePath(path));
}
```

- [ ] **Step 4: Run all related tests**

Run: `cd desktop && pnpm test tests/components/MarkdownFilePanel.test.ts tests/utils/parseWriteFilePath.test.ts`
Expected: PASS

- [ ] **Step 5: Full desktop test suite**

Run: `cd desktop && pnpm test`
Expected: PASS
