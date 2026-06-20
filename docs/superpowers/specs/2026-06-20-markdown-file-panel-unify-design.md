# Markdown File Panel Unification — Design Spec

**Status:** Approved — 2026-06-20

**Goal:** Reduce duplicate code between `markdown-doc` and `agent-rules-editor` by extracting a shared `MarkdownFilePanel.vue`, while keeping both registry entries and existing workspace JSON unchanged.

## 1. Problem

`WorkflowMarkdownPanel.vue` (used by `markdown-doc`) and `AgentRulesEditorWidget.vue` share ~80% UI: left file list, right markdown preview/edit, Edit/Save/Cancel toolbar. Divergence causes duplicate maintenance (e.g. Add to chat added only to markdown-doc).

## 2. Approach (Option A)

- Extract **`MarkdownFilePanel.vue`** with `mode: 'directory' | 'file-list'`
- Keep registry types **`markdown-doc`** and **`agent-rules-editor`** unchanged
- Thin wrapper widgets pass mode-specific props

**Not in scope:**
- Merging registry entries into one type
- Changing workspace JSON schemas
- New npm dependencies

## 3. Component Structure

```text
MarkdownFilePanel.vue          ← shared UI + logic
├── MarkdownDocWidget.vue      ← mode=directory, docsDir prop
└── AgentRulesEditorWidget.vue ← mode=file-list, files/editable props
```

Delete `WorkflowMarkdownPanel.vue` after migration.

## 4. Props

```ts
type MarkdownFile = { path: string; label: string };

type MarkdownFilePanelProps = {
  api: PanelApi;
  mode: "directory" | "file-list";
  docsDir?: string;              // directory mode, default "docs"
  files?: MarkdownFile[];        // file-list mode
  defaultFiles?: MarkdownFile[]; // file-list fallback when files empty
  editable?: boolean;            // default true
  sidebarTitle?: string;
  allowDelete?: boolean;         // default: true in directory, false in file-list
};
```

Wrappers set defaults:

| Wrapper | mode | sidebarTitle | allowDelete | defaultFiles |
|---------|------|--------------|-------------|--------------|
| MarkdownDocWidget | directory | "Documents" | true | — |
| AgentRulesEditorWidget | file-list | "Agent Rules" | false | AGENTS.md + CLAUDE.md |

## 5. Mode Behavior

| Capability | directory | file-list |
|------------|-----------|-----------|
| List source | `listWorkspace(docsDir)` → `.md` files | props `files` or `defaultFiles` |
| New file | `+ New` → prompt, write to docsDir | inline form (path + label) |
| Delete | yes (`deleteWorkspacePath`) | no |
| Missing file | show error | template via `defaultContent(path)` |
| Add to chat | right-click context menu | same |
| List display | file name | `label` |

`defaultContent(path)` for file-list mode (preserve existing agent-rules logic):

- `CLAUDE.md` → `@AGENTS.md` + Claude instructions stub
- `AGENTS.md` → project rules stub
- other → `# {basename}` stub

## 6. Add to Chat

Both modes expose right-click **Add to chat** when `api.addToChat` is defined. Calls `addToChat({ path, label })`.

## 7. Files

| File | Change |
|------|--------|
| `desktop/src/components/workflow/MarkdownFilePanel.vue` | New — unified panel |
| `desktop/src/components/workflow/defaultRuleContent.ts` | New — `defaultContent(path)` helper |
| `desktop/src/workspace/widgets/MarkdownDocWidget.vue` | Thin wrapper |
| `desktop/src/workspace/widgets/AgentRulesEditorWidget.vue` | Thin wrapper |
| `desktop/src/components/workflow/WorkflowMarkdownPanel.vue` | Delete |
| `desktop/tests/components/MarkdownFilePanel.test.ts` | New |
| `desktop/tests/components/WorkflowMarkdownPanel.test.ts` | Migrate/rename |

No registry, schema, or backend changes.

## 8. Testing

`cd desktop && pnpm test`:

- directory mode: list scan, create, delete, add-to-chat context menu
- file-list mode: default files, add path form, missing-file template, add-to-chat
- existing `feWidgets.test.ts` agent-rules tests pass
- all existing tests pass

## 9. Success Criteria

- [ ] Single `MarkdownFilePanel.vue` serves both widgets
- [ ] Registry types and workspace JSON unchanged
- [ ] Agent Rules Editor gains Add to chat
- [ ] `WorkflowMarkdownPanel.vue` removed
- [ ] All desktop tests pass
