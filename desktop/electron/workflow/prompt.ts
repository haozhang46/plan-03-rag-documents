import fs from "node:fs/promises";
import path from "node:path";
import { loadSkillBodies } from "../skills/loader";

export async function buildSystemPrompt(
  agentsMdPath: string | null | undefined,
  skillNames: string[],
  workspaceRoot: string,
): Promise<string> {
  const parts: string[] = [];

  const resolvedPath =
    agentsMdPath == null || agentsMdPath === "AGENTS.md"
      ? path.join(workspaceRoot, "AGENTS.md")
      : path.join(workspaceRoot, agentsMdPath);

  try {
    parts.push(await fs.readFile(resolvedPath, "utf8"));
  } catch {
    // AGENTS.md is optional
  }

  if (skillNames.length > 0) {
    const bodies = await loadSkillBodies(skillNames);
    parts.push(...bodies);
  }

  return parts.filter(Boolean).join("\n\n---\n\n");
}

export async function renderPromptTemplate(
  templateRelPath: string,
  projectRoot: string,
  vars: Record<string, string> = {},
): Promise<string> {
  const templatePath = path.join(projectRoot, ".agentflow", templateRelPath);
  let content = await fs.readFile(templatePath, "utf8");

  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }

  return content;
}
