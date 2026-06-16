# Desktop Dev→CI/CD Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend Agent Flow Desktop with project-scoped Dev→CI/CD workflow (global template + local override, pluggable executors, resource bridge, hybrid UI, Langflow design-time editor).

**Architecture:** Electron main hosts `workflowLoader`, `workflowCompiler`, `stepRunner`, `executorRegistry`, `skillLoader`, `resourceBridge`. Renderer adds Project Home, Workflow Run, Langflow Editor. LangGraph.js executes compiled `workflow.yaml`. Spec: `docs/superpowers/specs/2026-06-16-desktop-dev-cicd-workflow-design.md`.

**Tech Stack:** Electron, Vue 3, LangGraph.js, TypeScript, Vitest, optional gRPC Resource Server.

---

## File Map

| Path | Responsibility |
|------|----------------|
| `desktop/electron/workflow/types.ts` | Workflow YAML Zod schemas |
| `desktop/electron/workflow/loader.ts` | Global + local workflow load |
| `desktop/electron/workflow/compiler.ts` | Langflow JSON → yaml; yaml → step graph |
| `desktop/electron/workflow/stepRunner.ts` | Step orchestration, gates, checkpoint |
| `desktop/electron/workflow/state.ts` | In-memory workflow run state |
| `desktop/electron/executors/registry.ts` | Executor registry |
| `desktop/electron/executors/deepseek.ts` | DeepSeek ReAct executor |
| `desktop/electron/executors/claudeCode.ts` | Claude Code CLI executor |
| `desktop/electron/skills/loader.ts` | Built-in SKILL.md loader |
| `desktop/electron/resources/bridge.ts` | Provision: RPC or compose fallback |
| `desktop/electron/resources/composeFallback.ts` | docker-compose generation |
| `desktop/electron/agent/server.ts` | Extend HTTP API |
| `desktop/electron/main.ts` | IPC for project init, workflow state |
| `desktop/electron/preload.ts` | Expose new IPC |
| `desktop/templates/default-dev-cicd/` | Shipped global template |
| `desktop/src/pages/ProjectHome.vue` | New/open project |
| `desktop/src/pages/WorkflowRun.vue` | Pipeline + step chat |
| `desktop/src/pages/LangflowEditor.vue` | WebView placeholder v1 |
| `desktop/src/composables/useWorkflow.ts` | Workflow API client |
| `desktop/tests/workflow/` | Unit tests |

---

### Task 1: Workflow Schema & Loader

**Files:**
- Create: `desktop/electron/workflow/types.ts`
- Create: `desktop/electron/workflow/loader.ts`
- Create: `desktop/tests/workflow/loader.test.ts`
- Create: `desktop/templates/default-dev-cicd/workflow.yaml`
- Create: `desktop/templates/default-dev-cicd/resources.yaml`
- Create: `desktop/templates/default-dev-cicd/prompts/prd.md`

- [ ] **Step 1: Write failing test for workflow loader**

```typescript
// desktop/tests/workflow/loader.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadWorkflow, initProjectFromTemplate } from "../../electron/workflow/loader";

describe("loadWorkflow", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "af-"));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("loads local workflow when .agentflow/workflow.yaml exists", async () => {
    await fs.mkdir(path.join(tmp, ".agentflow"), { recursive: true });
    await fs.writeFile(
      path.join(tmp, ".agentflow/workflow.yaml"),
      `version: 1\nid: local\n title: Local\ntitle: Local\nsteps:\n  - id: prd\n    title: PRD\n    executor: deepseek\n    skills: []\n    gate: manual\nedges: []\n`,
    );
    const wf = await loadWorkflow(tmp);
    expect(wf.id).toBe("local");
    expect(wf.steps[0].id).toBe("prd");
  });

  it("initProjectFromTemplate copies template into project", async () => {
    const project = path.join(tmp, "proj");
    await fs.mkdir(project, { recursive: true });
    await initProjectFromTemplate(project, "default-dev-cicd");
    const exists = await fs
      .access(path.join(project, ".agentflow/workflow.yaml"))
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd desktop && pnpm test tests/workflow/loader.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement types and loader**

```typescript
// desktop/electron/workflow/types.ts
import { z } from "zod";

export const WorkflowStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  executor: z.enum(["deepseek", "claude-code"]),
  agents_md: z.string().nullable().optional(),
  skills: z.array(z.string()).default([]),
  prompt_template: z.string().optional(),
  outputs: z.array(z.string()).default([]),
  gate: z.enum(["manual", "auto"]).default("manual"),
  requires_resources: z.array(z.string()).default([]),
});

export const WorkflowEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const WorkflowSchema = z.object({
  version: z.literal(1),
  id: z.string(),
  title: z.string(),
  steps: z.array(WorkflowStepSchema).min(1),
  edges: z.array(WorkflowEdgeSchema),
  resources: z
    .array(z.object({ type: z.string(), name: z.string(), optional: z.boolean().optional() }))
    .default([]),
});

export type WorkflowDefinition = z.infer<typeof WorkflowSchema>;
```

```typescript
// desktop/electron/workflow/loader.ts
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import yaml from "yaml"; // add dependency: yaml
import { WorkflowSchema, type WorkflowDefinition } from "./types";

export function templatesRoot(): string {
  return path.join(__dirname, "../../templates");
}

export async function loadWorkflow(projectRoot: string): Promise<WorkflowDefinition> {
  const local = path.join(projectRoot, ".agentflow/workflow.yaml");
  try {
    const raw = await fs.readFile(local, "utf8");
    return WorkflowSchema.parse(yaml.parse(raw));
  } catch {
    const fallback = path.join(templatesRoot(), "default-dev-cicd/workflow.yaml");
    const raw = await fs.readFile(fallback, "utf8");
    return WorkflowSchema.parse(yaml.parse(raw));
  }
}

export async function initProjectFromTemplate(
  projectRoot: string,
  templateId: string,
): Promise<void> {
  const src = path.join(templatesRoot(), templateId);
  const dest = path.join(projectRoot, ".agentflow");
  await fs.cp(src, dest, { recursive: true });
}
```

Add `yaml` to `desktop/package.json` dependencies.

Create `desktop/templates/default-dev-cicd/workflow.yaml` with all 8 steps per spec.

- [ ] **Step 4: Run tests**

Run: `cd desktop && pnpm test tests/workflow/loader.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add desktop/electron/workflow/ desktop/templates/ desktop/tests/workflow/ desktop/package.json pnpm-lock.yaml
git commit -m "feat(desktop): add workflow schema and loader with default template"
```

---

### Task 2: Built-in Skill Loader

**Files:**
- Create: `desktop/electron/skills/loader.ts`
- Create: `desktop/tests/skills/loader.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { describe, it, expect } from "vitest";
import { listSkills, loadSkillBodies } from "../../electron/skills/loader";

describe("skillLoader", () => {
  it("lists built-in skills", async () => {
    const names = await listSkills();
    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain("test-driven-development");
  });

  it("loads SKILL.md content for requested names", async () => {
    const bodies = await loadSkillBodies(["test-driven-development"]);
    expect(bodies[0]).toMatch(/test-driven-development/i);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

- [ ] **Step 3: Implement loader**

Resolve skills from repo `skills/` relative to desktop package (copy or symlink path in dev; ship subset in `desktop/skills/` for production). Read `registry.yaml`, load `SKILL.md` for each name.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit** `feat(desktop): add built-in skill loader`

---

### Task 3: Executor Registry

**Files:**
- Create: `desktop/electron/executors/types.ts`
- Create: `desktop/electron/executors/registry.ts`
- Create: `desktop/electron/executors/deepseek.ts`
- Create: `desktop/electron/executors/claudeCode.ts`
- Create: `desktop/tests/executors/registry.test.ts`
- Modify: `desktop/electron/agent/agentService.ts` — extract reusable DeepSeek agent factory

- [ ] **Step 1: Define StepExecutor interface and registry test**

```typescript
export interface StepContext {
  workspaceRoot: string;
  stepId: string;
  systemPrompt: string;
  userPrompt: string;
  threadId: string;
  apiKey: string;
}

export type StepEvent =
  | { type: "message"; content: string }
  | { type: "tool_start"; name: string; call_id: string }
  | { type: "tool_end"; name: string; call_id: string; ok: boolean }
  | { type: "done" };
```

Test: registry returns `deepseek` and `claude-code`; unknown id throws.

- [ ] **Step 2: Implement deepseek executor** — wraps existing `createReactAgent` with injected system prompt from skills + AGENTS.md.

- [ ] **Step 3: Implement claude-code executor** — `spawn("claude", ["--print", userPrompt], { cwd: workspaceRoot, env })`; stream lines as `message` events; emit `done`.

- [ ] **Step 4: Tests with mocked spawn and mock LLM — PASS**

- [ ] **Step 5: Commit** `feat(desktop): add pluggable step executors`

---

### Task 4: Step Runner & Workflow State

**Files:**
- Create: `desktop/electron/workflow/state.ts`
- Create: `desktop/electron/workflow/stepRunner.ts`
- Create: `desktop/electron/workflow/prompt.ts` — render prompt_template + agents_md
- Create: `desktop/tests/workflow/stepRunner.test.ts`

- [ ] **Step 1: Test stepRunner advances on manual gate after run completes**

Mock executor yields `{ type: "done" }`. State: `currentStepId`, `status: pending|running|done|failed|skipped`.

- [ ] **Step 2: Implement stepRunner.runStep(stepId)** — build StepContext, call executor, update state.

- [ ] **Step 3: Implement advance(skip|continue|retry)**

- [ ] **Step 4: Tests PASS**

- [ ] **Step 5: Commit** `feat(desktop): add workflow step runner`

---

### Task 5: Resource Bridge

**Files:**
- Create: `desktop/electron/resources/types.ts`
- Create: `desktop/electron/resources/composeFallback.ts`
- Create: `desktop/electron/resources/bridge.ts`
- Create: `desktop/tests/resources/bridge.test.ts`

- [ ] **Step 1: Test composeFallback generates docker-compose with mysql+redis**

- [ ] **Step 2: Implement bridge.provision** — if no `RESOURCE_SERVER_URL`, write compose if missing, return `{ host: "127.0.0.1", port: 3306, ... }`.

- [ ] **Step 3: Stub RPC client** — `ResourceServerClient` interface; no-op when URL empty.

- [ ] **Step 4: Tests PASS**

- [ ] **Step 5: Commit** `feat(desktop): add resource bridge with compose fallback`

---

### Task 6: Workflow HTTP API

**Files:**
- Modify: `desktop/electron/agent/server.ts`
- Create: `desktop/tests/workflow/server.test.ts`

- [ ] **Step 1: Add endpoints**

| Path | Method | Behavior |
|------|--------|----------|
| `/v1/workflows/current` | GET | Load workflow for workspace |
| `/v1/workflow/state` | GET | Current run state |
| `/v1/workflow/run` | POST SSE | Run current or specified step |
| `/v1/workflow/advance` | POST | `{ action: "continue" \| "skip" \| "retry" }` |
| `/v1/skills` | GET | Built-in skill list |
| `/v1/workflow/compile` | POST | `{ langflowJson }` → write yaml |

- [ ] **Step 2: Wire stepRunner + resourceBridge into server**

- [ ] **Step 3: Integration test with supertest or raw http — PASS**

- [ ] **Step 4: Commit** `feat(desktop): extend agent server with workflow API`

---

### Task 7: IPC & Project Init

**Files:**
- Modify: `desktop/electron/main.ts`
- Modify: `desktop/electron/preload.ts`

- [ ] **Step 1: Add IPC**

```typescript
ipcMain.handle("project:init", async (_e, dir: string) => initProjectFromTemplate(dir, "default-dev-cicd"));
ipcMain.handle("project:recent", () => recentProjects);
ipcMain.handle("settings:getResourceServerUrl", () => resourceServerUrl);
ipcMain.handle("settings:setResourceServerUrl", (_e, url: string) => { ... });
```

- [ ] **Step 2: Persist recent projects in `~/.agentflow/recent.json`**

- [ ] **Step 3: Commit** `feat(desktop): add project init IPC`

---

### Task 8: Project Home UI

**Files:**
- Create: `desktop/src/pages/ProjectHome.vue`
- Modify: `desktop/src/layouts/AppShell.vue`

- [ ] **Step 1: ProjectHome** — list recent, button New (pick dir → init), Open (pick existing).

- [ ] **Step 2: AppShell routes** — `home | workflow | chat | langflow | settings`; after open project → `workflow`.

- [ ] **Step 3: Vitest smoke test for ProjectHome mount**

- [ ] **Step 4: Commit** `feat(desktop): add Project Home page`

---

### Task 9: Workflow Run UI

**Files:**
- Create: `desktop/src/pages/WorkflowRun.vue`
- Create: `desktop/src/composables/useWorkflow.ts`

- [ ] **Step 1: useWorkflow composable** — fetch state, run step SSE, advance actions.

- [ ] **Step 2: WorkflowRun layout** — left step list with status badges; center step chat (reuse ChatInput/Message); right outputs (git status placeholder).

- [ ] **Step 3: Buttons Continue / Skip / Retry / Free Chat toggle**

- [ ] **Step 4: Skill chips multi-select calling `/v1/skills`**

- [ ] **Step 5: Commit** `feat(desktop): add Workflow Run UI`

---

### Task 10: Langflow Editor (v1 embed)

**Files:**
- Create: `desktop/src/pages/LangflowEditor.vue`
- Modify: `desktop/electron/workflow/compiler.ts`

- [ ] **Step 1: compiler.compileLangflow(json)** — map Custom Agent nodes to steps; write `.agentflow/workflow.yaml`.

- [ ] **Step 2: LangflowEditor WebView** — v1: load static placeholder page with message "Langflow bundle pending"; Save button reads test JSON fixture and POSTs compile.

- [ ] **Step 3: Test compiler with fixture JSON — PASS**

- [ ] **Step 4: Commit** `feat(desktop): add Langflow compile path and editor shell`

Note: Full Langflow static bundle integration is follow-up; v1 ships compiler + editor shell.

---

### Task 11: Settings & Resource Server URL

**Files:**
- Modify: `desktop/src/pages/Settings.vue`

- [ ] **Step 1: Add Resource Server URL field**

- [ ] **Step 2: Commit** `feat(desktop): add resource server settings`

---

### Task 12: End-to-End Verification

- [ ] **Step 1: Run full test suite**

```bash
cd desktop && pnpm test && pnpm build
```

- [ ] **Step 2: Manual smoke** — init project, see 8 steps, run prd step with mock/deepseek key.

- [ ] **Step 3: Update `desktop/README.md`** with workflow usage.

- [ ] **Step 4: Commit** `docs(desktop): document dev-cicd workflow`

---

## Spec Coverage Check

| Spec § | Task |
|--------|------|
| Project folder | 1, 7 |
| Global/local workflow | 1 |
| 8-step template | 1 |
| Executors | 3 |
| Resources | 5 |
| Skills v1 | 2 |
| Workflow API | 6 |
| UI hybrid | 8, 9 |
| Langflow | 10 |
| Checkpoint | 4 |

## Execution Order

Tasks 1→2→3→4→5→6→7→8→9→10→11→12 — sequential dependencies; do not parallelize implementation subagents.
