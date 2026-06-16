# Langflow Editor Tab — Design Spec

**Status:** Implemented — 2026-06-16  
**Parent:** `docs/superpowers/specs/2026-06-16-desktop-dev-cicd-workflow-design.md` §6  
**Goal:** Replace the JSON-paste Langflow placeholder with a split-pane UI: left flow sidelist, right embedded Langflow visual editor.

## 1. Purpose

When the user opens the top **Langflow** tab in Agent Flow Desktop:

- **Left:** sidelist of all flows for the current workspace project
- **Right:** embedded Langflow UI to create and edit the selected flow
- **Bridge:** user can mark one flow as **Active** and compile it into `.agentflow/workflow.yaml` for the Workflow Run page (LangGraph.js runtime unchanged)

Langflow remains **design-time only**. Workflow execution still reads `workflow.yaml` only; Langflow native LLM nodes are not executed in v1.

## 2. Layout & Interaction

```text
┌─────────────────────────────────────────────────────────────┐
│ App header: Home | Workflow | Chat | Langflow | Settings    │
├──────────┬──────────────────────────────────────────────────┤
│ Flows    │  Langflow editor (WebView)                         │
│          │                                                  │
│ [Refresh]│  http://127.0.0.1:{port}/flow/{flowId}           │
│          │                                                  │
│ ● Flow A │                                                  │
│   Flow B │                                                  │
│          │                                                  │
│ [+ New]  │                                                  │
├──────────┴──────────────────────────────────────────────────┤
│ Toolbar: Set as Active Workflow | (optional) Open in Browser │
└─────────────────────────────────────────────────────────────┘
```

| Region | Behavior |
|--------|----------|
| Left sidelist (~240px) | Lists flows: name, updated time; selected item highlighted; **Active** badge on the flow bound to `workflow.yaml` |
| Right pane (flex-1) | `<webview>` loads Langflow editor for selected `flowId`; empty state when none selected |
| Page toolbar | **Refresh** list; **Set as Active Workflow** compiles selected flow → `workflow.yaml`; **Delete** with confirm (v1.1) |
| **+ New Flow** | `POST` create empty flow in workspace project → refresh → auto-select |

**Tab entry:** Reuse existing `AppShell` nav item `langflow` → enhanced `LangflowEditor.vue` (not a new top-level tab).

**Workspace gate:** If no project open, show CTA to open/create project (same pattern as Workflow page).

## 3. Langflow Server Lifecycle

### 3.1 Startup modes (phased)

| Phase | Mode | Behavior |
|-------|------|----------|
| **v1** | External (default) | User runs Langflow locally; Desktop connects via Settings URL |
| **v1.1** | Auto-spawn (opt-in) | If Settings `langflowAutoStart` and `langflow` on PATH, Electron spawns on app ready |

Electron already starts in-process sidecars (Agent `8765`, Executor `17351`). Langflow is a **separate Python subprocess** on a dedicated port (default **`17860`**, not 7860, to avoid clashes).

### 3.2 Auto-spawn (v1.1)

```text
app.whenReady()
  → if langflowAutoStart && which(langflow)
      spawn: langflow run --host 127.0.0.1 --port 17860 --no-open-browser
      env: LANGFLOW_CONFIG_DIR=~/.agentflow/langflow/
  → poll GET http://127.0.0.1:17860/health until 200 or timeout (120s)
app.on('before-quit') → SIGTERM child; wait up to 5s then SIGKILL
```

| Flag / env | Purpose |
|------------|---------|
| `--no-open-browser` | Do not open system browser |
| `--host 127.0.0.1` | Bind localhost only |
| `LANGFLOW_CONFIG_DIR` | Isolate Langflow DB from other installs |
| No `--backend-only` | Frontend required for embedded editor |

### 3.3 Failure & degradation

| Scenario | UI |
|----------|-----|
| Langflow not running (v1 external) | Right pane: install hint + Settings link + **Retry** |
| Spawn failed (binary missing) | Toast + Settings: disable auto-start or install Langflow |
| Health check timeout | Spinner → "Langflow is starting…" with elapsed time; allow Retry |
| Port in use | Main process tries next free port in range 17860–17869; persist chosen port in settings for session |
| WebView load error | Inline error + "Open in Browser" fallback |

**v1 default:** external connection only; auto-spawn documented but implemented in v1.1.

## 4. Settings

Extend `~/.agentflow/settings.json` and Settings page:

```json
{
  "langflowBaseUrl": "http://127.0.0.1:7860",
  "langflowApiKey": "",
  "langflowAutoStart": false,
  "langflowPort": 17860
}
```

| Field | v1 | Notes |
|-------|-----|-------|
| `langflowBaseUrl` | Yes | Default `http://127.0.0.1:7860`; user override if Langflow runs elsewhere |
| `langflowApiKey` | Yes | Stored in settings file (same trust model as Resource Server URL); sent only from main/sidecar, never from WebView |
| `langflowAutoStart` | v1.1 | Spawn on app launch |
| `langflowPort` | v1.1 | Used when auto-spawn enabled |

API key is optional for local dev; required if Langflow auth is enabled.

## 5. Workspace ↔ Langflow Project Mapping

Per-project file: `.agentflow/langflow.json`

```json
{
  "projectId": "uuid-from-langflow",
  "activeFlowId": "uuid-of-flow-compiled-to-workflow-yaml",
  "lastSyncedAt": "2026-06-16T12:00:00Z"
}
```

**On first Langflow tab open for a workspace:**

1. If `projectId` missing → `POST /api/v1/projects/` (or use default project) → save id
2. List flows with `GET /api/v1/flows/?project_id={projectId}&get_all=true`
3. If no flows → offer **Import template** (upload default-dev-cicd as Langflow JSON) or **+ New Flow**

Legacy single file `.agentflow/workflow.langflow.json` remains supported as import source; not the primary list store.

## 6. Architecture

```text
Renderer (LangflowEditor.vue)
  ├─ FlowSidebar          GET /v1/langflow/flows (sidecar proxy)
  ├─ LangflowWebView      <webview src="{baseUrl}/flow/{id}">
  └─ useLangflow.ts       composable

Electron Main
  ├─ langflowManager.ts   optional spawn, health, baseUrl resolution
  └─ IPC: langflow:status, langflow:restart

Agent Sidecar (8765) — new routes
  ├─ GET  /v1/langflow/status
  ├─ GET  /v1/langflow/flows?project_id=
  ├─ POST /v1/langflow/flows          (create)
  ├─ GET  /v1/langflow/flows/:id      (read JSON for compile)
  ├─ POST /v1/langflow/active         (set active + compile → workflow.yaml)
  └─ (proxies to Langflow API with x-api-key from settings)

Existing
  └─ POST /v1/workflow/compile        (unchanged; used by active endpoint)
```

**Why proxy via sidecar:** Keep API key off the renderer; single CORS-free origin for the Vue app; consistent with `useWorkflow.ts` → `getSidecarPort()` pattern.

**WebView security:**

- `webPreferences.webviewTag: true` on BrowserWindow
- Allow navigation only to `langflowBaseUrl` origin
- Do not expose Node integration inside WebView

**Editor URL:** `{langflowBaseUrl}/flow/{flowId}` (verify against installed Langflow version during implementation; fallback `/flows/{id}` if needed).

**Hide Langflow chrome (optional v1.1):** Inject CSS or use query param if Langflow supports embed mode; v1 may show Langflow's own top bar inside WebView (acceptable).

## 7. Active Workflow Compile Bridge

**Set as Active Workflow** flow:

1. `GET /api/v1/flows/{activeFlowId}` → `data` (nodes/edges)
2. Map Langflow export shape → `LangflowJson` expected by `workflowCompiler` (existing `metadata` on nodes)
3. `compileLangflowToYaml` → write `.agentflow/workflow.yaml`
4. Update `langflow.json` `activeFlowId` + `lastSyncedAt`
5. Toast success; Workflow tab reload picks up new definition

**Node metadata contract** (unchanged from compiler):

```json
{
  "data": {
    "metadata": {
      "id": "be-dev",
      "title": "Backend Development",
      "executor": "deepseek",
      "skills": ["test-driven-development"],
      "gates": [{ "id": "backend-tests", "type": "shell", "command": "pytest -q", "cwd": "backend" }]
    }
  }
}
```

Flows without Agent Flow metadata still open in Langflow for general editing; **Set as Active** warns if zero step nodes found.

## 8. API Summary (Desktop Sidecar)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/langflow/status` | `{ ok, baseUrl, mode: "external" \| "spawned" }` |
| GET | `/v1/langflow/flows` | List flows for workspace project |
| POST | `/v1/langflow/flows` | Create flow `{ name? }` |
| POST | `/v1/langflow/active` | `{ flowId }` → compile + update langflow.json |
| POST | `/v1/workflow/compile` | Existing; keep for JSON paste fallback |

## 9. File Map

| Path | Change |
|------|--------|
| `desktop/src/pages/LangflowEditor.vue` | Split layout: sidebar + webview + toolbar |
| `desktop/src/components/LangflowFlowSidebar.vue` | New |
| `desktop/src/components/LangflowWebView.vue` | New |
| `desktop/src/composables/useLangflow.ts` | New |
| `desktop/electron/langflow/manager.ts` | New (v1.1 spawn) |
| `desktop/electron/langflow/proxy.ts` | New |
| `desktop/electron/agent/server.ts` | Register langflow routes |
| `desktop/electron/main.ts` | IPC + optional spawn hook |
| `desktop/electron/preload.ts` | `getLangflowStatus` if needed |
| `desktop/src/pages/Settings.vue` | Langflow URL + API key |
| `desktop/tests/langflow/` | Proxy + compile bridge tests |

## 10. Error Handling

| Scenario | Behavior |
|----------|----------|
| Langflow unreachable | Block webview; sidelist shows offline banner |
| Create flow 4xx/5xx | Toast with API detail |
| Compile with invalid metadata | 400 from sidecar; show which nodes lack `metadata.id` |
| Active flow deleted in Langflow | Clear `activeFlowId` on next list refresh; warn user |
| Workspace switch | Reload project flows; webview navigates to new project's active or blank |

## 11. Testing

- **proxy:** mock Langflow HTTP; list/create/active routes
- **compile bridge:** Langflow `data` export → valid `workflow.yaml`
- **LangflowEditor.vue:** Vitest + stub webview; list selection changes editor URL
- **manager (v1.1):** spawn mocked; health poll success/timeout

## 12. v1 Scope

**In:**

- Enhanced Langflow tab: left flow list + right WebView editor
- External Langflow connection (Settings URL + API key)
- Per-workspace `langflow.json` + project-scoped flow list
- Set as Active → `workflow.yaml` via existing compiler
- Sidecar proxy for Langflow API
- JSON paste fallback removed from primary UI (keep compile API for tests)

**v1.1:**

- Auto-spawn Langflow with Electron
- Delete flow, import/export ZIP
- Optional WebView chrome trimming

**Out:**

- Bundled Python/Langflow in installer
- Executing Langflow LLM nodes at runtime
- Replacing LangGraph.js with Langflow run API

## 13. Relation to Parent Spec

Updates intent of parent spec §6:

- **Before:** "save → `.agentflow/workflow.langflow.json`" + JSON paste placeholder
- **After:** Langflow Server as design surface; **active** flow compiles to `workflow.yaml`; optional `workflow.langflow.json` export for backup only

Runtime, gates, dispatcher, and executors unchanged.
