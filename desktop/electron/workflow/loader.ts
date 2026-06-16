import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";
import { WorkflowSchema, type WorkflowDefinition } from "./types";

function moduleDir(): string {
  if (typeof __dirname !== "undefined") {
    return __dirname;
  }
  return path.dirname(fileURLToPath(import.meta.url));
}

export function templatesRoot(): string {
  return path.join(moduleDir(), "../../templates");
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
