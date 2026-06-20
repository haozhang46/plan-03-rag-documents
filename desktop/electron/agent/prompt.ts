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

const FILE_CHAT_PREAMBLE = [
  "You are editing specific project files attached by the user.",
  "You may only read and write the allowed paths listed below.",
  "Do not list directories, run shell commands, or modify other files.",
  "If a file is empty or a stub, help the user initialize it through dialogue before writing.",
].join("\n");

export async function buildFileChatSystemPrompt(
  allowedPaths: string[],
  skillNames: string[] = [],
): Promise<string> {
  const parts: string[] = [
    FILE_CHAT_PREAMBLE,
    `Allowed paths:\n${allowedPaths.map((p) => `- ${p}`).join("\n")}`,
  ];

  if (skillNames.length > 0) {
    const bodies = await loadSkillBodies(skillNames);
    parts.push(...bodies);
  }

  return parts.filter(Boolean).join("\n\n---\n\n");
}

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

export async function buildStepChatSystemPrompt(
  mode: ChatMode,
  workspaceRoot: string,
  stepId: string,
  workflowId: string,
  skillNames: string[] = [],
): Promise<string> {
  // 基础 system prompt
  const basePrompt = await buildChatSystemPrompt(mode, workspaceRoot, skillNames);

  // 读取 workflow 定义获取 step 信息
  const workflowPath = path.join(workspaceRoot, ".agentflow", "workflows", `${workflowId}.json`);
  let stepInfo = "";
  try {
    const workflowContent = await fs.readFile(workflowPath, "utf-8");
    const workflow = JSON.parse(workflowContent) as { steps?: Array<{ id: string; title: string; prompt_template?: string }> };
    const step = workflow.steps?.find((s) => s.id === stepId);
    if (step) {
      stepInfo = `\n\n## Current Step Context\n- Step ID: ${stepId}\n- Step Title: ${step.title}\n- Step Purpose: ${step.prompt_template ?? "Execute step tasks"}`;
    }
  } catch {
    // workflow 文件不存在时忽略
  }

  return `${basePrompt}${stepInfo}\n\nWhen responding, consider the current step context and provide relevant assistance for this specific workflow step.`;
}
