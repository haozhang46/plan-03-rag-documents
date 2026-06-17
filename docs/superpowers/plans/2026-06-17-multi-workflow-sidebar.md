# Multi-Workflow Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-workflow support with 2-level sidebar and config drawer to Agent Flow Desktop Workflow Run page.

**Architecture:** Extend `loader.ts` / `stateFile.ts` / `phases.ts` for per-workflow files with legacy shim; scope `workflowService` runner cache by `workflowId`; new REST routes; Vue components `WorkflowSidebar`, `WorkflowTemplatePicker`, `WorkflowConfigDrawer` integrated into `WorkflowRun.vue`.

**Tech Stack:** Electron, Vue 3, TypeScript, Vitest, yaml, Zod.

**Spec:** `docs/superpowers/specs/2026-06-17-multi-workflow-sidebar-design.md`

---

## File Map

| Path | Responsibility |
|------|----------------|
| `desktop/electron/workflow/loader.ts` | Multi-workflow list/load/save/active/template CRUD |
| `desktop/electron/workflow/stateFile.ts` | Per-workflow state paths |
| `desktop/electron/workflow/phases.ts` | Per-workflow phase paths + legacy fallback |
| `desktop/electron/workflow/workflowService.ts` | Runner keyed by workflowId |
| `desktop/electron/agent/server.ts` | New `/v1/workflows*` routes |
| `desktop/src/composables/useWorkflow.ts` | Client API for multi-workflow |
| `desktop/src/components/workflow/WorkflowSidebar.vue` | 2-level sidebar |
| `desktop/src/components/workflow/WorkflowTemplatePicker.vue` | Template import dialog |
| `desktop/src/components/workflow/WorkflowConfigDrawer.vue` | Metadata + steps editor |
| `desktop/src/pages/WorkflowRun.vue` | Integrate sidebar + drawer |
| `desktop/tests/workflow/loader.test.ts` | Loader tests |
| `desktop/tests/workflow/phases.test.ts` | Phase path tests |
| `desktop/tests/workflow/server.test.ts` | API tests |
| `desktop/tests/pages/WorkflowRun.test.ts` | UI tests |

---

### Task 1: Multi-Workflow Loader & Active Workflow Registry

**Files:**
- Modify: `desktop/electron/workflow/loader.ts`
- Modify: `desktop/tests/workflow/loader.test.ts`

- [ ] **Step 1: Write failing tests**

Add to `desktop/tests/workflow/loader.test.ts`:

```typescript
import {
  listWorkflows,
  getActiveWorkflowId,
  setActiveWorkflowId,
  loadWorkflow,
  saveWorkflow,
  createWorkflowFromTemplate,
  deleteWorkflow,
  listTemplates,
} from "../../electron/workflow/loader";

describe("multi-workflow loader", () => {
  it("lists legacy root workflow as single entry", async () => {
    // setup root .agentflow/workflow.yaml id: legacy-wf
    const list = await listWorkflows(tmp);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("legacy-wf");
    expect(list[0].isLegacy).toBe(true);
  });

  it("lists workflows under .agentflow/workflows/", async () => {
    // root yaml + workflows/hotfix/workflow.yaml
    const list = await listWorkflows(tmp);
    expect(list.map((w) => w.id).sort()).toEqual(["hotfix", "legacy-wf"].sort());
  });

  it("getActiveWorkflowId reads active-workflow.json", async () => {
    await setActiveWorkflowId(tmp, "hotfix");
    expect(await getActiveWorkflowId(tmp)).toBe("hotfix");
  });

  it("loadWorkflow(projectRoot, id) loads specific workflow", async () => {
    const wf = await loadWorkflow(tmp, "hotfix");
    expect(wf.id).toBe("hotfix");
  });

  it("createWorkflowFromTemplate copies into workflows/{id}", async () => {
    const id = await createWorkflowFromTemplate(tmp, "default-dev-cicd", "my-copy");
    expect(id).toBe("my-copy");
    const wf = await loadWorkflow(tmp, "my-copy");
    expect(wf.steps.length).toBeGreaterThan(0);
  });

  it("deleteWorkflow removes workflows/{id} only", async () => {
    await deleteWorkflow(tmp, "my-copy");
    await expect(loadWorkflow(tmp, "my-copy")).rejects.toThrow();
  });

  it("listTemplates includes default-dev-cicd", async () => {
    const templates = await listTemplates();
    expect(templates.some((t) => t.id === "default-dev-cicd")).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `cd desktop && pnpm test tests/workflow/loader.test.ts`
Expected: FAIL — exports not defined

- [ ] **Step 3: Implement loader extensions**

Add types and functions to `loader.ts`:

```typescript
export interface WorkflowSummary {
  id: string;
  title: string;
  isLegacy: boolean;
}

export interface TemplateSummary {
  id: string;
  title: string;
  source: "builtin" | "user";
}

const ACTIVE_FILE = ".agentflow/active-workflow.json";
const WORKFLOWS_DIR = ".agentflow/workflows";

export function userTemplatesRoot(): string {
  return path.join(os.homedir(), ".agentflow/templates");
}

export function workflowYamlPath(projectRoot: string, workflowId: string, isLegacy: boolean): string {
  if (isLegacy) return path.join(projectRoot, ".agentflow/workflow.yaml");
  return path.join(projectRoot, WORKFLOWS_DIR, workflowId, "workflow.yaml");
}

export async function listWorkflows(projectRoot: string): Promise<WorkflowSummary[]> {
  const out: WorkflowSummary[] = [];
  const legacyPath = path.join(projectRoot, ".agentflow/workflow.yaml");
  try {
    const wf = await loadWorkflowFile(legacyPath);
    out.push({ id: wf.id, title: wf.title, isLegacy: true });
  } catch { /* no legacy */ }

  const workflowsDir = path.join(projectRoot, WORKFLOWS_DIR);
  try {
    const entries = await fs.readdir(workflowsDir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const yamlPath = path.join(workflowsDir, ent.name, "workflow.yaml");
      try {
        const wf = await loadWorkflowFile(yamlPath);
        out.push({ id: wf.id, title: wf.title, isLegacy: false });
      } catch { /* skip invalid */ }
    }
  } catch { /* no dir */ }
  return out;
}

export async function getActiveWorkflowId(projectRoot: string): Promise<string> {
  try {
    const raw = await fs.readFile(path.join(projectRoot, ACTIVE_FILE), "utf8");
    const parsed = JSON.parse(raw) as { workflowId: string };
    return parsed.workflowId;
  } catch {
    const list = await listWorkflows(projectRoot);
    if (list.length === 0) {
      const wf = await loadWorkflow(projectRoot);
      return wf.id;
    }
    return list[0].id;
  }
}

export async function setActiveWorkflowId(projectRoot: string, workflowId: string): Promise<void> {
  const list = await listWorkflows(projectRoot);
  if (!list.some((w) => w.id === workflowId)) {
    throw new Error(`Unknown workflow: ${workflowId}`);
  }
  const dest = path.join(projectRoot, ACTIVE_FILE);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, JSON.stringify({ workflowId }, null, 2), "utf8");
}

export async function loadWorkflow(projectRoot: string, workflowId?: string): Promise<WorkflowDefinition> {
  const id = workflowId ?? (await getActiveWorkflowId(projectRoot));
  const list = await listWorkflows(projectRoot);
  const entry = list.find((w) => w.id === id);
  if (!entry) throw new Error(`Workflow not found: ${id}`);
  const yamlPath = workflowYamlPath(projectRoot, id, entry.isLegacy);
  return loadWorkflowFile(yamlPath);
}

// saveWorkflow, createWorkflowFromTemplate, deleteWorkflow, listTemplates — implement per spec
```

Refactor existing `loadWorkflow` single-arg path to use `loadWorkflowFile` helper.

- [ ] **Step 4: Run tests — expect PASS**

Run: `cd desktop && pnpm test tests/workflow/loader.test.ts`

- [ ] **Step 5: Commit**

```bash
git add desktop/electron/workflow/loader.ts desktop/tests/workflow/loader.test.ts
git commit -m "feat(desktop): multi-workflow loader with active registry"
```

---

### Task 2: Per-Workflow State Paths

**Files:**
- Modify: `desktop/electron/workflow/stateFile.ts`
- Create: `desktop/tests/workflow/stateFile.test.ts` (or extend existing)

- [ ] **Step 1: Write failing test**

```typescript
import { stateFilePath, loadStateFile, saveStateFile } from "../../electron/workflow/stateFile";

it("legacy workflow uses root state.json", () => {
  expect(stateFilePath(tmp, "legacy-wf", true)).toEndWith(".agentflow/state.json");
});

it("non-legacy uses workflows/{id}/state.json", () => {
  expect(stateFilePath(tmp, "hotfix", false)).toEndWith(".agentflow/workflows/hotfix/state.json");
});
```

Update all `loadStateFile` / `saveStateFile` call sites to pass `workflowId` + `isLegacy`.

- [ ] **Step 2–4: Implement, run tests, commit**

Run: `cd desktop && pnpm test tests/workflow/stateFile.test.ts`

Commit: `feat(desktop): per-workflow state file paths`

---

### Task 3: Per-Workflow Phase Paths

**Files:**
- Modify: `desktop/electron/workflow/phases.ts`
- Modify: `desktop/tests/workflow/phases.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
it("writes phase under phases/{workflowId}/{stepId}.md when workflowId set", async () => {
  await writePhaseOutput(tmp, "be-dev", "summary", undefined, "default-dev-cicd");
  const content = await readPhaseOutput(tmp, "be-dev", undefined, "default-dev-cicd");
  expect(content).toBe("summary");
});

it("readPhaseOutput falls back to legacy phases/{stepId}.md", async () => {
  // write legacy path only, read with workflowId
});
```

- [ ] **Step 2–4: Implement optional `workflowId` param on read/write; update stepRunner; run tests; commit**

Commit: `feat(desktop): workflow-scoped phase handoff paths`

---

### Task 4: Scope workflowService Runner by workflowId

**Files:**
- Modify: `desktop/electron/workflow/workflowService.ts`
- Modify: `desktop/electron/workflow/stepRunner.ts` (if needed)
- Modify: `desktop/tests/workflow/server.test.ts`

- [ ] **Step 1: Change runner cache key to `${workspaceRoot}:${workflowId}`**
- [ ] **Step 2: Add optional `workflowId` to getRunner, getWorkflowState, runWorkflowStep, advanceWorkflow, etc.**
- [ ] **Step 3: clearRunner(workspace, workflowId?) clears one or all**
- [ ] **Step 4: Run `cd desktop && pnpm test tests/workflow/`**
- [ ] **Step 5: Commit**

Commit: `feat(desktop): scope workflow runner by active workflow id`

---

### Task 5: HTTP API Routes for Multi-Workflow

**Files:**
- Modify: `desktop/electron/agent/server.ts`
- Modify: `desktop/tests/workflow/server.test.ts`

- [ ] **Step 1: Write failing API tests**

```typescript
it("GET /v1/workflows returns list with active flag", async () => {
  const res = await request(port, "GET", "/v1/workflows");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.workflows)).toBe(true);
  expect(typeof res.body.activeWorkflowId).toBe("string");
});

it("POST /v1/workflows/from-template creates workflow", async () => {
  const res = await request(port, "POST", "/v1/workflows/from-template", {
    templateId: "default-dev-cicd",
    newId: "test-wf",
  });
  expect(res.status).toBe(201);
});

it("POST /v1/workflows/:id/activate switches active", async () => {
  const res = await request(port, "POST", "/v1/workflows/test-wf/activate");
  expect(res.status).toBe(200);
});
```

- [ ] **Step 2–4: Implement routes; add workflowId query to existing `/v1/workflow/*` where needed**
- [ ] **Step 5: Run server tests; commit**

Commit: `feat(desktop): multi-workflow HTTP API routes`

---

### Task 6: useWorkflow Composable

**Files:**
- Modify: `desktop/src/composables/useWorkflow.ts`

- [ ] **Step 1: Add types `WorkflowSummary`, `TemplateSummary`**
- [ ] **Step 2: Add `fetchWorkflowList`, `fetchTemplates`, `saveWorkflow`, `createFromTemplate`, `activateWorkflow`, `deleteWorkflow`**
- [ ] **Step 3: Update `fetchWorkflow(workflowId?)`, `fetchState(workflowId?)`, `advance`, `runStep` to pass workflowId when provided**
- [ ] **Step 4: Commit**

Commit: `feat(desktop): useWorkflow multi-workflow client API`

---

### Task 7: WorkflowSidebar Component

**Files:**
- Create: `desktop/src/components/workflow/WorkflowSidebar.vue`
- Create: `desktop/tests/components/WorkflowSidebar.test.ts`

- [ ] **Step 1: Write component test**

```typescript
it("renders workflow list and steps for selected workflow", async () => {
  const wrapper = mount(WorkflowSidebar, {
    props: {
      workflows: [{ id: "a", title: "A", isLegacy: true, isActive: true }],
      steps: [{ id: "prd", title: "PRD", status: "pending" }],
      selectedWorkflowId: "a",
      activeWorkflowId: "a",
      viewingStepId: "prd",
    },
  });
  expect(wrapper.text()).toContain("A");
  expect(wrapper.text()).toContain("PRD");
});
```

- [ ] **Step 2: Implement sidebar with emits: `select-workflow`, `config-workflow`, `select-step`, `add-workflow`**
- [ ] **Step 3: Run tests; commit**

Commit: `feat(desktop): WorkflowSidebar two-level navigation`

---

### Task 8: WorkflowTemplatePicker

**Files:**
- Create: `desktop/src/components/workflow/WorkflowTemplatePicker.vue`

- [ ] **Step 1: Modal listing templates from `fetchTemplates()`**
- [ ] **Step 2: Emit `select(templateId)` → parent calls `createFromTemplate`**
- [ ] **Step 3: Commit**

Commit: `feat(desktop): WorkflowTemplatePicker for template import`

---

### Task 9: WorkflowConfigDrawer

**Files:**
- Create: `desktop/src/components/workflow/WorkflowConfigDrawer.vue`

- [ ] **Step 1: Drawer with title/id fields, steps list (add/remove/reorder via up-down buttons v1), Save / Set Active / Delete / Cancel**
- [ ] **Step 2: On Save call `saveWorkflow`; validate required step fields client-side**
- [ ] **Step 3: Commit**

Commit: `feat(desktop): WorkflowConfigDrawer for pipeline editing`

---

### Task 10: Integrate WorkflowRun Page

**Files:**
- Modify: `desktop/src/pages/WorkflowRun.vue`
- Modify: `desktop/tests/pages/WorkflowRun.test.ts`

- [ ] **Step 1: Replace flat aside with `WorkflowSidebar`**
- [ ] **Step 2: Load `fetchWorkflowList` on mount; track `selectedWorkflowId`, `activeWorkflowId`**
- [ ] **Step 3: When selected !== active, disable run/chat/advance with message**
- [ ] **Step 4: Wire config drawer and template picker**
- [ ] **Step 5: Run `cd desktop && pnpm test`; commit**

Commit: `feat(desktop): integrate multi-workflow sidebar into WorkflowRun`

---

### Task 11: Full Test Suite & Docs

**Files:**
- Modify: `desktop/README.md` (brief multi-workflow section)

- [ ] **Step 1: Run `cd desktop && pnpm test` — all pass**
- [ ] **Step 2: Update README with `.agentflow/workflows/` layout**
- [ ] **Step 3: Commit**

Commit: `docs(desktop): document multi-workflow layout`
