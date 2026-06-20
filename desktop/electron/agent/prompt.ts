import fs from "node:fs/promises";
import path from "node:path";
import { loadSkillBodies } from "../skills/loader";

export type ChatMode = "ask" | "plan" | "agent";

const MODE_PREAMBLES: Record<ChatMode, string> = {
  ask: [
    "You are a helpful coding assistant.",
    "Answer clearly and concisely.",
    "You cannot use tools; rely on the conversation and provided skill instructions only.",
  ].join("\n"),
  plan: [
    "You are a planning assistant for software projects.",
    "Use read-only tools (read_file, list_dir, git_status, git_diff, workspace_get, workspace_list_registry, ops_get_config, ops_node_status, ops_logs_tail, topology_get, topology_resources_get) to explore the workspace when helpful.",
    "Do not run shell commands or modify files.",
    "Ask clarifying questions when requirements are ambiguous.",
    "When ready, output a markdown implementation plan with numbered steps and a short test plan.",
  ].join("\n"),
  agent: [
    "You are an autonomous dev agent with git, shell, and file tools.",
    "Step run UI is defined in workspaces/*.workspace.json; use workspace_* tools to change layout and registered components.",
    "Do not modify workflow.yaml step order via workspace tools.",
    "Call workspace_list_registry before adding components.",
    "Langflow agent flows use langflow-panel or executor: langflow; do not compile Langflow into the project pipeline.",
    "Mutating workspace_* tools: use confirm=false to propose changes (UI shows approval card); use confirm=true only after the user explicitly approves.",
    "You have ops_* tools for workspace runtime ops (status, logs, deploy over SSH from .agentflow/ops.yaml). Deploy tools require confirm=true only after explicit user approval.",
    "When Resource Server URL is configured, you also have topology_* tools to manage service topology (api, databases, redis) and export docker-compose.",
    "Follow project conventions in AGENTS.md when present.",
  ].join("\n"),
};

export async function buildChatSystemPrompt(
  mode: ChatMode,
  workspaceRoot: string,
  skillNames: string[] = [],
): Promise<string> {
  const parts: string[] = [MODE_PREAMBLES[mode]];

  if (mode === "agent" || mode === "plan") {
    try {
      parts.push(await fs.readFile(path.join(workspaceRoot, "AGENTS.md"), "utf8"));
    } catch {
      // optional
    }
  }

  if (skillNames.length > 0) {
    const bodies = await loadSkillBodies(skillNames);
    parts.push(...bodies);
  }

  return parts.filter(Boolean).join("\n\n---\n\n");
}
