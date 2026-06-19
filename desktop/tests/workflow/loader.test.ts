import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import yaml from "yaml";
import {
  loadWorkflow,
  initProjectFromTemplate,
  listWorkflows,
  getActiveWorkflowId,
  setActiveWorkflowId,
  saveWorkflow,
  createWorkflowFromTemplate,
  deleteWorkflow,
  listTemplates,
} from "../../electron/workflow/loader";

const MINIMAL_WF = {
  version: 1 as const,
  id: "test-id",
  title: "Test",
  steps: [
    {
      id: "prd",
      title: "PRD",
      executor: "deepseek" as const,
      skills: [],
      outputs: [],
      gates: [],
    },
  ],
  edges: [],
};

async function writeLegacyWorkflow(root: string, id: string, title: string): Promise<void> {
  await fs.mkdir(path.join(root, ".agentflow"), { recursive: true });
  await fs.writeFile(
    path.join(root, ".agentflow/workflow.yaml"),
    yaml.stringify({ ...MINIMAL_WF, id, title }),
  );
}

async function writeNestedWorkflow(root: string, id: string, title: string): Promise<void> {
  const dir = path.join(root, ".agentflow/workflows", id);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "workflow.yaml"), yaml.stringify({ ...MINIMAL_WF, id, title }));
}

describe("loadWorkflow", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "af-"));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("loads local workflow when .agentflow/workflow.yaml exists", async () => {
    await writeLegacyWorkflow(tmp, "local", "Local");
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

  it("initProjectFromTemplate copies bundled workspaces into .agentflow/workspaces", async () => {
    const project = path.join(tmp, "proj");
    await fs.mkdir(project, { recursive: true });
    await initProjectFromTemplate(project, "default-dev-cicd");
    const wsDir = path.join(project, ".agentflow/workspaces");
    const files = (await fs.readdir(wsDir)).sort();
    expect(files).toEqual([
      "architecture.workspace.json",
      "be-dev.workspace.json",
      "cicd.workspace.json",
      "fe-dev.workspace.json",
      "prd.workspace.json",
      "review.workspace.json",
      "test-2.workspace.json",
      "test.workspace.json",
    ]);
    const feDev = JSON.parse(
      await fs.readFile(path.join(wsDir, "fe-dev.workspace.json"), "utf8"),
    ) as { components: unknown[] };
    expect(feDev.components).toHaveLength(4);
  });
});

describe("multi-workflow loader", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await fs.mkdtemp(path.join(os.tmpdir(), "af-"));
  });

  afterEach(async () => {
    await fs.rm(tmp, { recursive: true, force: true });
  });

  it("lists legacy root workflow as single entry", async () => {
    await writeLegacyWorkflow(tmp, "legacy-wf", "Legacy");
    const list = await listWorkflows(tmp);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("legacy-wf");
    expect(list[0].isLegacy).toBe(true);
  });

  it("lists workflows under .agentflow/workflows/", async () => {
    await writeLegacyWorkflow(tmp, "legacy-wf", "Legacy");
    await writeNestedWorkflow(tmp, "hotfix", "Hotfix");
    const list = await listWorkflows(tmp);
    expect(list.map((w) => w.id).sort()).toEqual(["hotfix", "legacy-wf"].sort());
  });

  it("getActiveWorkflowId reads active-workflow.json", async () => {
    await writeLegacyWorkflow(tmp, "legacy-wf", "Legacy");
    await writeNestedWorkflow(tmp, "hotfix", "Hotfix");
    await setActiveWorkflowId(tmp, "hotfix");
    expect(await getActiveWorkflowId(tmp)).toBe("hotfix");
  });

  it("loadWorkflow(projectRoot, id) loads specific workflow", async () => {
    await writeLegacyWorkflow(tmp, "legacy-wf", "Legacy");
    await writeNestedWorkflow(tmp, "hotfix", "Hotfix");
    const wf = await loadWorkflow(tmp, "hotfix");
    expect(wf.id).toBe("hotfix");
    expect(wf.title).toBe("Hotfix");
  });

  it("createWorkflowFromTemplate copies into workflows/{id}", async () => {
    const id = await createWorkflowFromTemplate(tmp, "default-dev-cicd", "my-copy");
    expect(id).toBe("my-copy");
    const wf = await loadWorkflow(tmp, "my-copy");
    expect(wf.steps.length).toBeGreaterThan(0);
    const nestedPath = path.join(tmp, ".agentflow/workflows/my-copy/workflow.yaml");
    await expect(fs.access(nestedPath)).resolves.toBeUndefined();
  });

  it("createWorkflowFromTemplate copies bundled workspaces alongside workflow.yaml", async () => {
    const id = await createWorkflowFromTemplate(tmp, "default-dev-cicd", "with-workspaces");
    const wsDir = path.join(tmp, ".agentflow/workflows", id, "workspaces");
    const files = (await fs.readdir(wsDir)).sort();
    expect(files).toContain("fe-dev.workspace.json");
    expect(files).toContain("prd.workspace.json");
    expect(files).toHaveLength(8);
  });

  it("createWorkflowFromTemplate suffixes on id conflict", async () => {
    await writeNestedWorkflow(tmp, "default-dev-cicd", "Existing");
    const id = await createWorkflowFromTemplate(tmp, "default-dev-cicd");
    expect(id).toBe("default-dev-cicd-2");
  });

  it("saveWorkflow writes updated definition", async () => {
    await writeNestedWorkflow(tmp, "hotfix", "Hotfix");
    const wf = await loadWorkflow(tmp, "hotfix");
    wf.title = "Hotfix Updated";
    await saveWorkflow(tmp, "hotfix", wf);
    const reloaded = await loadWorkflow(tmp, "hotfix");
    expect(reloaded.title).toBe("Hotfix Updated");
  });

  it("deleteWorkflow removes workflows/{id} only", async () => {
    await writeNestedWorkflow(tmp, "my-copy", "Copy");
    await writeLegacyWorkflow(tmp, "legacy-wf", "Legacy");
    await setActiveWorkflowId(tmp, "legacy-wf");
    await deleteWorkflow(tmp, "my-copy");
    await expect(loadWorkflow(tmp, "my-copy")).rejects.toThrow();
    expect(await loadWorkflow(tmp, "legacy-wf")).toBeDefined();
  });

  it("deleteWorkflow rejects legacy workflow", async () => {
    await writeLegacyWorkflow(tmp, "legacy-wf", "Legacy");
    await expect(deleteWorkflow(tmp, "legacy-wf")).rejects.toThrow(/legacy/i);
  });

  it("deleteWorkflow rejects active workflow", async () => {
    await writeNestedWorkflow(tmp, "hotfix", "Hotfix");
    await setActiveWorkflowId(tmp, "hotfix");
    await expect(deleteWorkflow(tmp, "hotfix")).rejects.toThrow(/active/i);
  });

  it("listTemplates includes default-dev-cicd", async () => {
    const templates = await listTemplates();
    expect(templates.some((t) => t.id === "default-dev-cicd")).toBe(true);
  });
});
