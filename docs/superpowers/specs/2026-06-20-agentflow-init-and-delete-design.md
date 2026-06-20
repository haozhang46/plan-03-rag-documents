# AgentFlow Init & Agent Rules Delete — Design Spec

**Status:** Approved — 2026-06-20

**Goal:** Fix Agent Rules panel delete not surviving reload, and simplify `.agentflow` initialization so existing projects are never overwritten.

## 1. Problem

### 1.1 Delete does not persist (user scenario B)

In the Agent Rules panel (`agent-rules-editor`), clicking **Delete** on `CLAUDE.md`:

1. Deletes the disk file via `deleteWorkspacePath` (when not `isNewFile`)
2. Removes the entry from the in-memory sidebar list (`fileListFiles`)

It does **not** update `.agentflow/workspaces/fe-dev.workspace.json` (or the modern path under `.agentflow/workflows/{id}/workspaces/`). On reload, the workspace JSON still lists `CLAUDE.md`, so the sidebar shows it again. If the disk file was deleted, `loadListFile` fills a stub template and marks `isNewFile`, which looks like the file "came back."

### 1.2 Init overwrites or re-materializes user config

`ensureProjectWorkflow` runs on every `openProject` (including dev reload). Current behavior:

- `initProjectFromTemplate` does a full `fs.cp` of the template into `.agentflow`
- `materializeWorkflowFromTemplate` and `ensureWorkspacesForWorkflow` may copy workspace JSON from templates

Users who customize workspace JSON (e.g. remove `CLAUDE.md` from the files list) expect `.agentflow` to be left alone once it exists.

## 2. Init Logic (approved rule)

**Simple binary rule — no per-file manifest:**

| Condition | Action |
|-----------|--------|
| `.agentflow` directory **does not exist** | `fs.cp(templateDir, .agentflow, { recursive: true })` — full template copy |
| `.agentflow` directory **already exists** | **Skip initialization entirely** — no copy, no materialize, no workspace ensure |

### 2.1 `agentflowExists(projectRoot)`

```ts
async function agentflowExists(projectRoot: string): Promise<boolean> {
  try {
    const stat = await fs.stat(path.join(projectRoot, ".agentflow"));
    return stat.isDirectory();
  } catch {
    return false;
  }
}
```

### 2.2 `ensureProjectWorkflow` (revised)

```ts
export async function ensureProjectWorkflow(projectRoot, templateId = "default-dev-cicd") {
  if (await agentflowExists(projectRoot)) {
    const list = await listWorkflows(projectRoot);
    if (list.length > 0) {
      try {
        return await getActiveWorkflowId(projectRoot);
      } catch {
        return list[0].id;
      }
    }
    throw new Error("No workflows configured");
  }
  await initProjectFromTemplate(projectRoot, templateId);
  return templateId;
}
```

Remove calls to `materializeWorkflowFromTemplate`, `ensureAllWorkspaces`, and `ensureWorkspacesForWorkflow` from the open-project path.

### 2.3 `initProjectFromTemplate` (revised)

Guard at entry:

```ts
if (await agentflowExists(projectRoot)) return;
await fs.cp(src, dest, { recursive: true });
```

`project:init` IPC still calls `initProjectFromTemplate` then `openProject`. If the user picks a directory that already has `.agentflow`, init is a no-op and the existing config is preserved.

### 2.4 `loadWorkflow` materialize fallback

Today `loadWorkflow` calls `materializeWorkflowFromTemplate` when a workflow id is missing. Under the new rule:

- If `.agentflow` exists → do **not** materialize; throw `Workflow not found: {id}` as today when entry is missing after list refresh
- If `.agentflow` does not exist → caller should have run `ensureProjectWorkflow` first (full cp)

### 2.5 Trade-off (accepted)

If `.agentflow` exists but is incomplete (e.g. missing `workflow.yaml` or a workspace JSON), the app will not auto-repair. The user must fix manually or delete `.agentflow` and re-init. This is intentional: **never overwrite user data.**

### 2.6 Dead code removal

After refactor, remove or inline-unused:

- `materializeWorkflowFromTemplate` (if no other callers)
- `ensureWorkspacesForWorkflow`
- `ensureAllWorkspaces`

Keep `createWorkflowFromTemplate` unchanged — explicit user action to add a new workflow from template.

## 3. Delete Persistence

### 3.1 Behavior

When user deletes a rule file in `agent-rules-editor` (file-list mode):

1. Delete disk file (`deleteWorkspacePath`) — skip if `isNewFile`
2. Remove from sidebar list
3. **Persist** updated `files` array to workspace JSON via `saveWorkspace`

After reload, the file no longer appears in the sidebar and is not recreated from template defaults.

### 3.2 API extension

Add optional callback to `PanelApi`:

```ts
type ListFile = { path: string; label: string };

type PanelApi = {
  // ...existing
  persistRuleFiles?: (files: ListFile[]) => Promise<void>;
};
```

`WorkflowRun.vue` implements `persistRuleFiles` when building `panelApi`:

1. Clone `resolvedWorkspace`
2. Find the `agent-rules-editor` component (match by `comp.id` passed from widget, or first `agent-rules-editor` in workspace)
3. Set `comp.props.files = files`
4. Call `saveWorkspace(activeWorkflowId, stepId, updatedDefinition)`
5. Refresh local `resolvedWorkspace` ref so UI stays in sync

Pass `componentId` from workspace into the widget via existing `comp.props` or a new `panelComponentId` on bind props.

### 3.3 `MarkdownFilePanel` changes

In `deleteDoc` for file-list mode, after updating `fileListFiles`:

```ts
if (props.api.persistRuleFiles) {
  await props.api.persistRuleFiles(fileListFiles.value);
}
```

In `confirmAdd` (add rule file), also call `persistRuleFiles` so additions survive reload.

### 3.4 Missing file UX (unchanged)

If a file is listed in workspace JSON but missing on disk, `loadListFile` still shows the stub template with `isNewFile = true`. User must explicitly Save to create the file. No auto-write on load.

## 4. Files to Change

| File | Change |
|------|--------|
| `electron/workflow/loader.ts` | `agentflowExists`, simplify `ensureProjectWorkflow` / `initProjectFromTemplate`, remove materialize/ensure workspace paths |
| `electron/main.ts` | No change (still calls `ensureProjectWorkflow` on open) |
| `src/workspace/registryComponents.ts` | Add `persistRuleFiles?` to `PanelApi` |
| `src/pages/WorkflowRun.vue` | Implement `persistRuleFiles` on `panelApi` |
| `src/components/workflow/MarkdownFilePanel.vue` | Call `persistRuleFiles` on delete/add |
| `tests/workflow/loader.test.ts` | Update tests: existing `.agentflow` → no copy; missing `.agentflow` → full cp |
| `tests/components/MarkdownFilePanel.test.ts` | Assert `persistRuleFiles` called on delete |
| `tests/workspace/feWidgets.test.ts` | Update delete test expectations if needed |

**Not in scope:**

- Removing `CLAUDE.md` from bundled templates (user deletes via UI + persisted JSON)
- Cursor IDE rules loading (`CLAUDE.md` at repo root is separate from AgentFlow workspace JSON)
- Per-file required-files manifest (superseded by binary exists/skip rule)

## 5. Testing

### Init

- Empty project, no `.agentflow` → `ensureProjectWorkflow` copies full template; `workflow.yaml` and workspaces exist
- Project with `.agentflow` and custom `fe-dev.workspace.json` (no `CLAUDE.md` in files) → `ensureProjectWorkflow` does not modify any file
- `project:init` on directory with existing `.agentflow` → no-op copy; `openProject` uses existing workflows

### Delete

- Delete `CLAUDE.md` in Agent Rules panel → disk file gone, workspace JSON `files` no longer includes it
- Reload step/workspace → sidebar does not list `CLAUDE.md`
- Add `GEMINI.md` via + Add → appears after reload

## 6. Error Handling

- `persistRuleFiles` failure → show error in `MarkdownFilePanel` `error` ref; do not roll back sidebar (user can retry save via workspace designer)
- `ensureProjectWorkflow` with existing `.agentflow` but zero workflows → throw clear error: `"No workflows configured"`
