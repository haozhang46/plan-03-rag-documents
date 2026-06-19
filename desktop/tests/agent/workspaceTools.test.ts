import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import yaml from "yaml";
import {
  buildReadOnlyWorkspaceTools,
  buildWorkspaceLangChainTools,
} from "../../electron/agent/workspaceTools";
import { loadWorkspace } from "../../electron/workflow/workspaceLoader";

const WORKFLOW_ID = "test-wf";
const STEP_ID = "fe-dev";

const MINIMAL_WORKFLOW = {
  version: 1,
  id: WORKFLOW_ID,
  title: "Test Workflow",
  steps: [
    {
      id: STEP_ID,
      title: "FE Dev",
      executor: "deepseek",
      skills: [],
      outputs: [],
      gates: [],
    },
  ],
  edges: [],
  resources: [],
};

async function initProject(root: string): Promise<void> {
  const wfDir = path.join(root, ".agentflow/workflows", WORKFLOW_ID);
  await fs.mkdir(wfDir, { recursive: true });
  await fs.writeFile(
    path.join(wfDir, "workflow.yaml"),
    yaml.stringify(MINIMAL_WORKFLOW),
    "utf8",
  );
  await fs.writeFile(
    path.join(root, ".agentflow/active-workflow.json"),
    JSON.stringify({ workflowId: WORKFLOW_ID }),
    "utf8",
  );
}

describe("workspaceTools", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "af-ws-tools-"));
    await initProject(tmp);
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("workspace_list_registry returns known component types", async () => {
    const tools = buildWorkspaceLangChainTools({ workspaceRoot: tmp });
    const listRegistry = tools.find((t) => t.name === "workspace_list_registry");
    const result = await listRegistry!.invoke({});
    expect(String(result)).toContain("code-explorer");
    expect(String(result)).toContain("fe-architecture-plan");
  });

  it("workspace_get reports missing workspace", async () => {
    const tools = buildWorkspaceLangChainTools({
      workspaceRoot: tmp,
      workflowId: WORKFLOW_ID,
      stepId: STEP_ID,
    });
    const get = tools.find((t) => t.name === "workspace_get");
    const result = await get!.invoke({});
    expect(String(result)).toContain("No workspace file");
  });

  it("workspace_add_component proposes without saving when confirm=false", async () => {
    const ctx = { workspaceRoot: tmp, workflowId: WORKFLOW_ID, stepId: STEP_ID };
    const tools = buildWorkspaceLangChainTools(ctx);
    const add = tools.find((t) => t.name === "workspace_add_component");
    const result = await add!.invoke({
      type: "code-explorer",
      label: "Code",
      props: { root: "fe", writable: false },
      confirm: false,
    });
    expect(String(result)).toContain("WORKSPACE_PENDING_APPROVAL");

    const filePath = path.join(
      tmp,
      ".agentflow/workflows",
      WORKFLOW_ID,
      "workspaces",
      `${STEP_ID}.workspace.json`,
    );
    await expect(fs.access(filePath)).rejects.toThrow();
  });

  it("workspace_add_component creates and saves workspace with confirm=true", async () => {
    const ctx = { workspaceRoot: tmp, workflowId: WORKFLOW_ID, stepId: STEP_ID };
    const tools = buildWorkspaceLangChainTools(ctx);
    const add = tools.find((t) => t.name === "workspace_add_component");
    const result = await add!.invoke({
      type: "code-explorer",
      label: "Code",
      props: { root: "fe", writable: false },
      confirm: true,
    });
    expect(String(result)).toContain("added: code-explorer");

    const filePath = path.join(
      tmp,
      ".agentflow/workflows",
      WORKFLOW_ID,
      "workspaces",
      `${STEP_ID}.workspace.json`,
    );
    const loaded = await loadWorkspace(filePath);
    expect(loaded.components).toHaveLength(1);
    expect(loaded.components[0].type).toBe("code-explorer");
    expect(loaded.components[0].props.root).toBe("fe");
  });

  it("workspace_update_component changes props", async () => {
    const ctx = { workspaceRoot: tmp, workflowId: WORKFLOW_ID, stepId: STEP_ID };
    const tools = buildWorkspaceLangChainTools(ctx);
    const add = tools.find((t) => t.name === "workspace_add_component");
    await add!.invoke({
      type: "code-explorer",
      component_id: "code",
      props: { root: "fe", writable: false },
      confirm: true,
    });

    const update = tools.find((t) => t.name === "workspace_update_component");
    const result = await update!.invoke({
      component_id: "code",
      props: { writable: true },
      confirm: true,
    });
    expect(String(result)).toContain("updated existing components");

    const filePath = path.join(
      tmp,
      ".agentflow/workflows",
      WORKFLOW_ID,
      "workspaces",
      `${STEP_ID}.workspace.json`,
    );
    const loaded = await loadWorkspace(filePath);
    expect(loaded.components[0].props.writable).toBe(true);
  });

  it("workspace_remove_component deletes component", async () => {
    const ctx = { workspaceRoot: tmp, workflowId: WORKFLOW_ID, stepId: STEP_ID };
    const tools = buildWorkspaceLangChainTools(ctx);
    const add = tools.find((t) => t.name === "workspace_add_component");
    await add!.invoke({
      type: "code-explorer",
      component_id: "code",
      props: { root: "fe" },
      confirm: true,
    });

    const remove = tools.find((t) => t.name === "workspace_remove_component");
    const result = await remove!.invoke({ component_id: "code", confirm: true });
    expect(String(result)).toContain("removed: code");

    const filePath = path.join(
      tmp,
      ".agentflow/workflows",
      WORKFLOW_ID,
      "workspaces",
      `${STEP_ID}.workspace.json`,
    );
    const loaded = await loadWorkspace(filePath);
    expect(loaded.components).toHaveLength(0);
  });

  it("workspace_reorder changes component order", async () => {
    const ctx = { workspaceRoot: tmp, workflowId: WORKFLOW_ID, stepId: STEP_ID };
    const tools = buildWorkspaceLangChainTools(ctx);
    const add = tools.find((t) => t.name === "workspace_add_component");
    await add!.invoke({
      type: "code-explorer",
      component_id: "a",
      props: { root: "fe" },
      confirm: true,
    });
    await add!.invoke({
      type: "markdown-doc",
      component_id: "b",
      props: {},
      confirm: true,
    });

    const reorder = tools.find((t) => t.name === "workspace_reorder");
    await reorder!.invoke({ component_ids: ["b", "a"], confirm: true });

    const filePath = path.join(
      tmp,
      ".agentflow/workflows",
      WORKFLOW_ID,
      "workspaces",
      `${STEP_ID}.workspace.json`,
    );
    const loaded = await loadWorkspace(filePath);
    expect(loaded.components.map((c) => c.id)).toEqual(["b", "a"]);
  });

  it("workspace_set_layout updates layout", async () => {
    const ctx = { workspaceRoot: tmp, workflowId: WORKFLOW_ID, stepId: STEP_ID };
    const tools = buildWorkspaceLangChainTools(ctx);
    const setLayout = tools.find((t) => t.name === "workspace_set_layout");
    const result = await setLayout!.invoke({ layout: "stack", confirm: true });
    expect(String(result)).toContain("layout: (new) → stack");

    const filePath = path.join(
      tmp,
      ".agentflow/workflows",
      WORKFLOW_ID,
      "workspaces",
      `${STEP_ID}.workspace.json`,
    );
    const loaded = await loadWorkspace(filePath);
    expect(loaded.layout).toBe("stack");
  });

  it("read-only variant excludes mutating tools", () => {
    const readOnly = buildReadOnlyWorkspaceTools({ workspaceRoot: tmp });
    const names = readOnly.map((t) => t.name);
    expect(names).toEqual(["workspace_get", "workspace_list_registry"]);
    expect(names).not.toContain("workspace_add_component");
  });

  it("rejects unknown component type", async () => {
    const tools = buildWorkspaceLangChainTools({
      workspaceRoot: tmp,
      workflowId: WORKFLOW_ID,
      stepId: STEP_ID,
    });
    const add = tools.find((t) => t.name === "workspace_add_component");
    const result = await add!.invoke({ type: "not-a-widget", props: {}, confirm: true });
    expect(String(result)).toContain("Unknown component type");
  });
});
