# Langflow Editor Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the JSON-paste Langflow placeholder with a split-pane tab: left flow sidelist, right embedded Langflow WebView editor, proxied via Agent sidecar with Set-as-Active compile bridge.

**Architecture:** Settings store `langflowBaseUrl` + `langflowApiKey` in `~/.agentflow/settings.json`. New `electron/langflow/` modules proxy Langflow REST API from Agent sidecar (8765). Per-project `.agentflow/langflow.json` maps workspace → Langflow `projectId` + `activeFlowId`. Renderer uses `useLangflow` composable; WebView loads `{baseUrl}/flow/{id}`.

**Tech Stack:** Electron, Vue 3, Vitest, existing `workflowCompiler`, Langflow REST `/api/v1/flows`.

**Spec:** `docs/superpowers/specs/2026-06-16-langflow-editor-tab-design.md`

---

## File Map

| Path | Responsibility |
|------|----------------|
| `desktop/electron/langflow/types.ts` | Langflow API + langflow.json types |
| `desktop/electron/langflow/config.ts` | Read langflow settings from settings.json |
| `desktop/electron/langflow/store.ts` | Read/write `.agentflow/langflow.json` |
| `desktop/electron/langflow/client.ts` | HTTP client to Langflow API |
| `desktop/electron/langflow/service.ts` | ensureProject, listFlows, createFlow, setActiveFlow |
| `desktop/electron/langflow/routes.ts` | Sidecar route handlers |
| `desktop/electron/agent/server.ts` | Wire langflow routes + pass getLangflowConfig |
| `desktop/electron/main.ts` | Extend settings type + IPC; `webviewTag: true` |
| `desktop/electron/preload.ts` | Optional langflow settings getters |
| `desktop/src/composables/useLangflow.ts` | Renderer API client |
| `desktop/src/components/LangflowFlowSidebar.vue` | Flow list UI |
| `desktop/src/components/LangflowWebView.vue` | WebView wrapper |
| `desktop/src/pages/LangflowEditor.vue` | Split layout orchestration |
| `desktop/src/pages/Settings.vue` | Langflow URL + API key fields |
| `desktop/src/layouts/AppShell.vue` | Pass `workspace` to LangflowEditor |
| `desktop/tests/langflow/` | Unit tests |

---

### Task 1: Langflow settings & config

**Files:**
- Create: `desktop/electron/langflow/types.ts`
- Create: `desktop/electron/langflow/config.ts`
- Modify: `desktop/electron/main.ts`
- Modify: `desktop/src/pages/Settings.vue`
- Modify: `desktop/electron/preload.ts`
- Test: `desktop/tests/langflow/config.test.ts`

- [ ] **Step 1: Write failing test for config defaults**

```typescript
// desktop/tests/langflow/config.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getLangflowConfig } from "../../electron/langflow/config";

describe("getLangflowConfig", () => {
  let settingsDir: string;
  let prevHome: string | undefined;

  beforeEach(async () => {
    settingsDir = await fs.mkdtemp(path.join(os.tmpdir(), "af-settings-"));
    prevHome = process.env.HOME;
    process.env.HOME = settingsDir;
    await fs.mkdir(path.join(settingsDir, ".agentflow"), { recursive: true });
  });

  afterEach(async () => {
    process.env.HOME = prevHome;
    await fs.rm(settingsDir, { recursive: true, force: true });
  });

  it("returns defaults when settings file missing", async () => {
    const cfg = await getLangflowConfig();
    expect(cfg.baseUrl).toBe("http://127.0.0.1:7860");
    expect(cfg.apiKey).toBe("");
  });

  it("reads langflowBaseUrl and langflowApiKey from settings.json", async () => {
    await fs.writeFile(
      path.join(settingsDir, ".agentflow/settings.json"),
      JSON.stringify({ langflowBaseUrl: "http://localhost:9999", langflowApiKey: "lf-key" }),
    );
    const cfg = await getLangflowConfig();
    expect(cfg.baseUrl).toBe("http://localhost:9999");
    expect(cfg.apiKey).toBe("lf-key");
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `cd desktop && pnpm test tests/langflow/config.test.ts`

- [ ] **Step 3: Implement types + config**

```typescript
// desktop/electron/langflow/types.ts
export type LangflowConfig = {
  baseUrl: string;
  apiKey: string;
};

export type LangflowProjectState = {
  projectId?: string;
  activeFlowId?: string;
  lastSyncedAt?: string;
};

export type LangflowFlowSummary = {
  id: string;
  name: string;
  updated_at?: string;
};

export type LangflowStatus = {
  ok: boolean;
  baseUrl: string;
  mode: "external";
  detail?: string;
};
```

```typescript
// desktop/electron/langflow/config.ts
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { LangflowConfig } from "./types";

const DEFAULT_BASE_URL = "http://127.0.0.1:7860";

export async function getLangflowConfig(): Promise<LangflowConfig> {
  const settingsPath = path.join(os.homedir(), ".agentflow/settings.json");
  try {
    const raw = await fs.readFile(settingsPath, "utf8");
    const parsed = JSON.parse(raw) as {
      langflowBaseUrl?: string;
      langflowApiKey?: string;
    };
    return {
      baseUrl: (parsed.langflowBaseUrl?.trim() || DEFAULT_BASE_URL).replace(/\/$/, ""),
      apiKey: parsed.langflowApiKey?.trim() ?? "",
    };
  } catch {
    return { baseUrl: DEFAULT_BASE_URL, apiKey: "" };
  }
}
```

- [ ] **Step 4: Extend main.ts settings + IPC**

Extend `AgentflowSettings`:

```typescript
type AgentflowSettings = {
  resourceServerUrl?: string;
  langflowBaseUrl?: string;
  langflowApiKey?: string;
};
```

Add IPC handlers:

```typescript
ipcMain.handle("settings:getLangflowBaseUrl", async () => {
  const s = await loadSettings();
  return s.langflowBaseUrl ?? "http://127.0.0.1:7860";
});
ipcMain.handle("settings:getLangflowApiKeyStatus", async () => {
  const s = await loadSettings();
  return s.langflowApiKey ? "***configured***" : "";
});
ipcMain.handle("settings:setLangflow", async (_e, baseUrl: string, apiKey: string) => {
  await saveSettings({
    langflowBaseUrl: baseUrl.trim(),
    langflowApiKey: apiKey.trim(),
  });
  return true;
});
```

- [ ] **Step 5: Settings.vue — Langflow section**

Add inputs for Langflow Server URL and API Key (password), Save button calling `window.desktop.setLangflow(url, key)`.

- [ ] **Step 6: preload.ts expose methods**

- [ ] **Step 7: Run tests — expect PASS**

---

### Task 2: Langflow client, store, and service

**Files:**
- Create: `desktop/electron/langflow/store.ts`
- Create: `desktop/electron/langflow/client.ts`
- Create: `desktop/electron/langflow/service.ts`
- Test: `desktop/tests/langflow/service.test.ts`

- [ ] **Step 1: Write failing tests**

Test `readLangflowState` / `writeLangflowState` roundtrip.

Test `mapLangflowExportToCompilerInput` — given Langflow flow `data` with nodes containing `metadata`, produces `LangflowJson` for compiler.

Test `setActiveFlow` with mocked `fetch` — writes `workflow.yaml` and updates `langflow.json`.

- [ ] **Step 2: Implement store.ts**

```typescript
export async function readLangflowState(projectRoot: string): Promise<LangflowProjectState>
export async function writeLangflowState(projectRoot: string, state: LangflowProjectState): Promise<void>
```

Path: `{projectRoot}/.agentflow/langflow.json`

- [ ] **Step 3: Implement client.ts**

Functions using native `fetch`:
- `checkHealth(config)` → GET `{baseUrl}/health` or `/api/v1/flows/?page=1&size=1`
- `listFlows(config, projectId?)` → GET `/api/v1/flows/`
- `createFlow(config, name, projectId?)` → POST `/api/v1/flows/`
- `getFlow(config, flowId)` → GET `/api/v1/flows/{id}`
- `ensureProject(config, projectRoot)` → read state or create project via API, save projectId

Headers: `x-api-key` when apiKey set.

- [ ] **Step 4: Implement service.ts**

```typescript
export function mapLangflowExportToCompilerInput(flow: { id: string; name: string; data: unknown }): LangflowJson
export async function getLangflowStatus(): Promise<LangflowStatus>
export async function listWorkspaceFlows(projectRoot: string): Promise<{ flows: LangflowFlowSummary[]; activeFlowId?: string }>
export async function createWorkspaceFlow(projectRoot: string, name?: string): Promise<LangflowFlowSummary>
export async function setActiveWorkspaceFlow(projectRoot: string, flowId: string): Promise<WorkflowDefinition>
```

`mapLangflowExportToCompilerInput` extracts `data.nodes`, `data.edges`; maps flow id/name; validates at least one node has `data.metadata.id` or returns error for setActive.

`setActiveWorkspaceFlow` calls `getFlow`, maps, `compileAndWriteWorkflow`, updates langflow.json.

- [ ] **Step 5: Run tests — expect PASS**

---

### Task 3: Sidecar Langflow routes

**Files:**
- Create: `desktop/electron/langflow/routes.ts`
- Modify: `desktop/electron/agent/server.ts`
- Test: `desktop/tests/langflow/routes.test.ts`

- [ ] **Step 1: Write failing route tests**

Use pattern from `desktop/tests/workflow/server.test.ts` — start server on ephemeral port, mock service layer or use vi.mock on service.

Endpoints:
- `GET /v1/langflow/status` → 200 `{ ok, baseUrl, mode }`
- `GET /v1/langflow/flows` → list for workspace
- `POST /v1/langflow/flows` body `{ name? }` → create
- `POST /v1/langflow/active` body `{ flowId }` → compile

- [ ] **Step 2: Implement routes.ts**

Export `handleLangflowRequest(req, res, url, method, getWorkspaceRoot): Promise<boolean>` returning true if handled.

- [ ] **Step 3: Wire into server.ts** early in request handler after OPTIONS.

- [ ] **Step 4: Run tests — expect PASS**

---

### Task 4: Renderer composable & components

**Files:**
- Create: `desktop/src/composables/useLangflow.ts`
- Create: `desktop/src/components/LangflowFlowSidebar.vue`
- Create: `desktop/src/components/LangflowWebView.vue`
- Test: `desktop/tests/pages/LangflowEditor.test.ts`

- [ ] **Step 1: useLangflow.ts**

```typescript
export function useLangflow() {
  async function fetchStatus(): Promise<LangflowStatus>
  async function fetchFlows(): Promise<{ flows: LangflowFlowSummary[]; activeFlowId?: string }>
  async function createFlow(name?: string): Promise<LangflowFlowSummary>
  async function setActive(flowId: string): Promise<void>
  return { fetchStatus, fetchFlows, createFlow, setActive }
}
```

Uses `getSidecarPort()` + fetch like `useWorkflow.ts`.

- [ ] **Step 2: LangflowFlowSidebar.vue**

Props: `flows`, `selectedId`, `activeFlowId`, `loading`, `offline`
Emits: `select`, `refresh`, `create`

- [ ] **Step 3: LangflowWebView.vue**

Props: `baseUrl`, `flowId`, `offline`
Renders `<webview>` when flowId set; `src` = `${baseUrl}/flow/${flowId}`
Emit `load-error` on did-fail-load

- [ ] **Step 4: Write component test stubbing webview**

---

### Task 5: LangflowEditor page integration

**Files:**
- Modify: `desktop/src/pages/LangflowEditor.vue`
- Modify: `desktop/src/layouts/AppShell.vue`
- Modify: `desktop/electron/main.ts` — `webviewTag: true` on BrowserWindow

- [ ] **Step 1: AppShell pass workspace**

```vue
<LangflowEditorPage v-else-if="view === 'langflow'" :workspace="workspace" />
```

- [ ] **Step 2: Rewrite LangflowEditor.vue**

Layout per spec §2:
- No workspace → open project CTA
- Load status on mount; if !ok show offline panel with Retry + link to Settings
- Left sidebar + toolbar (Set as Active, Refresh)
- Right LangflowWebView
- On mount load flows; select first or activeFlowId
- Remove JSON textarea primary UI

- [ ] **Step 3: Enable webviewTag in createWindow**

```typescript
webPreferences: {
  preload: ...,
  contextIsolation: true,
  nodeIntegration: false,
  webviewTag: true,
},
```

- [ ] **Step 4: Run full desktop tests**

Run: `cd desktop && pnpm test`

---

### Task 6: Spec status update

**Files:**
- Modify: `docs/superpowers/specs/2026-06-16-langflow-editor-tab-design.md` — Status: Implemented

- [ ] Update spec status line after all tests pass.
