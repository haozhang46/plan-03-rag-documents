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
      [
        "version: 1",
        "id: local",
        "title: Local",
        "steps:",
        "  - id: prd",
        "    title: PRD",
        "    executor: deepseek",
        "    skills: []",
        "    gate: manual",
        "edges: []",
        "",
      ].join("\n"),
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
