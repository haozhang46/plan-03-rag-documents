# Agent Rules Live Preview — Design Spec

**Date:** 2026-06-20  
**Status:** Approved — 2026-06-20

**Goal:** When Chat AI writes a file via `write_file`, the Agent Rules Editor (and other `MarkdownFilePanel` instances) update preview content immediately without manual reload.

## 1. Problem

Agent Rules Editor (`MarkdownFilePanel` file-list mode) loads file content once on selection via `readWorkspaceFile`. File Chat AI writes via `write_file` (`fileChatTools.ts` → disk). `WorkflowRun` receives `tool_end` but does not notify the panel. Users see stale preview while Chat confirms the write succeeded.

`write_file` completes atomically at `tool_end` (not character-by-character). "Live" means **refresh after each successful write**, not streaming typing.

## 2. Decisions (approved in brainstorming)

| Topic | Choice |
|-------|--------|
| Trigger scope | **All Chat `write_file`** — Step Chat (file mode) + Free Chat in `WorkflowRun` |
| Edit conflict | **Silent overwrite** — replace `content` + `draft` with disk content |
| Non-selected file | **Sidebar dot** — blue indicator, no auto-switch |
| Implementation | **Chat event bus** via `PanelApi.subscribeFileWrites` |

## 3. Architecture

```
WorkflowRun (onStepSend / onFreeSend)
  └─ tool_end: name === "write_file" && ok
       └─ parseWriteFilePath(output)
            └─ notifyFileWritten(path)
                 └─ MarkdownFilePanel.subscribeFileWrites
                      ├─ selectedPath === path → readWorkspaceFile → overwrite content + draft
                      └─ else → updatedPaths.add(path) → sidebar blue dot
```

### 3.1 Components

| Unit | Responsibility |
|------|----------------|
| `WorkflowRun.vue` | Parse `write_file` tool_end, call `notifyFileWritten` |
| `PanelApi` | Expose `subscribeFileWrites(handler) => unsubscribe` |
| `MarkdownFilePanel.vue` | Subscribe on mount; refresh or mark updated paths |
| `parseWriteFilePath` | Extract path from tool output string |

### 3.2 Scope

Applies to all `MarkdownFilePanel` consumers:

- `agent-rules-editor` (file-list mode)
- `markdown-doc` / `architecture-docs` (directory mode)

Standalone `Chat.vue` page has no panel — out of scope.

Currently `write_file` exists only in File Chat (`fileChatTools.ts`). The hook in `WorkflowRun` is future-proof for when other chat modes gain `write_file`.

## 4. Panel Behavior

### 4.1 Selected file written by AI

1. `readWorkspaceFile(path)` reload from disk
2. Set `content` and `draft` to new content (silent overwrite)
3. Keep `isEditing` unchanged (if editing, draft now matches AI version)
4. Remove `path` from `updatedPaths`

### 4.2 Non-selected file written by AI

1. Add `path` to `updatedPaths: Set<string>`
2. Show blue dot next to sidebar item (`w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0`)
3. On user click → normal load → clear dot

### 4.3 Directory mode caveat (v1)

If AI writes a file not yet in `directoryFiles` (new file under `docs/`), the sidebar list is **not** refreshed automatically. Only paths already visible or currently selected get live updates. Refreshing directory listing on write is a follow-up.

## 5. Path Parsing

`fileChatTools` returns: `Wrote {path} ({n} bytes)`

```typescript
const WRITE_FILE_OUTPUT_RE = /^Wrote (.+?) \(\d+ bytes\)$/;

export function parseWriteFilePath(output: string | undefined): string | null {
  if (!output) return null;
  const m = output.match(WRITE_FILE_OUTPUT_RE);
  return m?.[1]?.trim() ?? null;
}
```

If parse fails, skip notification (no error toast).

Future: add explicit `path` field on `StepEvent` for `tool_end` if output format diversifies.

## 6. API

### 6.1 PanelApi extension

```typescript
type PanelApi = {
  // ...existing
  subscribeFileWrites?: (handler: (path: string) => void) => () => void;
};
```

### 6.2 WorkflowRun listener registry

```typescript
const fileWriteListeners = new Set<(path: string) => void>();

function notifyFileWritten(path: string) {
  for (const fn of fileWriteListeners) fn(path);
}

const panelApi: PanelApi = {
  // ...existing
  subscribeFileWrites: (fn) => {
    fileWriteListeners.add(fn);
    return () => fileWriteListeners.delete(fn);
  },
};
```

Call `handleWriteFileToolEnd(event)` from both `onStepSend` and `onFreeSend` `tool_end` branches (before or after existing handlers).

### 6.3 MarkdownFilePanel subscription

```typescript
onMounted(() => {
  // ...existing
  const unsub = props.api.subscribeFileWrites?.((path) => void onExternalFileWrite(path));
  onUnmounted(() => unsub?.());
});

async function onExternalFileWrite(path: string) {
  const normalized = normalizePath(path); // match panel path format
  if (selectedPath.value === normalized) {
    await reloadSelectedFile(); // readWorkspaceFile, overwrite content + draft
    updatedPaths.delete(normalized);
  } else if (isPathInSidebar(normalized)) {
    updatedPaths.add(normalized);
  }
}
```

Path normalization: compare using same rules as workspace paths (forward slashes, no leading `./`).

## 7. UI

- **Dot:** small blue circle to the right of file label in sidebar; `aria-label="Updated by AI"` for accessibility
- **No toast, no modal** — silent overwrite per approved conflict policy
- **No auto tab switch** — user stays on current file

## 8. Error Handling

- `readWorkspaceFile` fails after write notification → set `error` ref, keep previous content
- Parse failure → no-op
- `subscribeFileWrites` not provided (Designer preview, tests) → panel works as today

## 9. Files to Change

| File | Change |
|------|--------|
| `desktop/src/workspace/registryComponents.ts` | Add `subscribeFileWrites?` to `PanelApi` |
| `desktop/src/pages/WorkflowRun.vue` | Listener registry, `handleWriteFileToolEnd`, wire both chat handlers |
| `desktop/src/utils/parseWriteFilePath.ts` | Path parser (new) |
| `desktop/src/components/workflow/MarkdownFilePanel.vue` | Subscribe, `updatedPaths`, dot UI, reload on write |
| `desktop/tests/utils/parseWriteFilePath.test.ts` | Parser unit tests |
| `desktop/tests/components/MarkdownFilePanel.test.ts` | Live refresh + dot behavior |

## 10. Testing

### Unit

- `parseWriteFilePath`: valid output, missing output, malformed string

### Component

- Panel subscribed: notify matching selected path → `content` updates
- Panel subscribed: notify non-selected path in list → dot visible; click file → dot gone
- Notify path not in sidebar → no dot, no error
- Selected + editing: notify → draft overwritten (silent)

### Manual

- fe-dev → Agent Rules → Add AGENTS.md to chat → send file-scoped message → preview updates after `write_file` completes
- Switch to another rule file before AI writes → dot on AGENTS.md → click → see new content

## 11. Non-Goals

- Filesystem watch for external/IDE edits
- Character-level streaming preview during AI generation
- Auto-refresh directory file list when AI creates new files
- Conflict prompt / merge UI
- Pinia store (listener on `PanelApi` is sufficient; WorkflowRun owns both chat and panel)
