import fs from "node:fs/promises";
import path from "node:path";
import yaml from "yaml";
import { WorkflowSchema, type WorkflowDefinition } from "./types";

interface LangflowNodeMetadata {
  id?: string;
  title?: string;
  executor?: "deepseek" | "claude-code";
  agents_md?: string | null;
  skills?: string[];
  prompt_template?: string;
  outputs?: string[];
  gate?: "manual" | "auto";
  requires_resources?: string[];
}

interface LangflowNode {
  id: string;
  data?: {
    metadata?: LangflowNodeMetadata;
  };
}

interface LangflowEdge {
  source: string;
  target: string;
}

export interface LangflowJson {
  id?: string;
  title?: string;
  nodes?: LangflowNode[];
  edges?: LangflowEdge[];
  resources?: Array<{ type: string; name: string; optional?: boolean }>;
}

export async function compileLangflowToYaml(
  langflowJson: LangflowJson,
  projectRoot?: string,
): Promise<string> {
  const content = yaml.stringify(compileLangflowJson(langflowJson));
  if (projectRoot) {
    const dest = path.join(projectRoot, ".agentflow/workflow.yaml");
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, content, "utf8");
  }
  return content;
}

export function compileLangflowJson(langflowJson: LangflowJson): WorkflowDefinition {
  const nodes = langflowJson.nodes ?? [];
  const steps = nodes.map((node) => {
    const meta = node.data?.metadata ?? {};
    const stepId = meta.id ?? node.id;
    return {
      id: stepId,
      title: meta.title ?? stepId,
      executor: meta.executor ?? "deepseek",
      agents_md: meta.agents_md ?? null,
      skills: meta.skills ?? [],
      prompt_template: meta.prompt_template,
      outputs: meta.outputs ?? [],
      gate: meta.gate ?? "manual",
      requires_resources: meta.requires_resources ?? [],
    };
  });

  const nodeIdToStepId = new Map<string, string>();
  for (const node of nodes) {
    const meta = node.data?.metadata ?? {};
    nodeIdToStepId.set(node.id, meta.id ?? node.id);
  }

  const edges = (langflowJson.edges ?? []).map((edge) => ({
    from: nodeIdToStepId.get(edge.source) ?? edge.source,
    to: nodeIdToStepId.get(edge.target) ?? edge.target,
  }));

  if (edges.length === 0 && steps.length > 1) {
    for (let i = 0; i < steps.length - 1; i++) {
      edges.push({ from: steps[i].id, to: steps[i + 1].id });
    }
  }

  return WorkflowSchema.parse({
    version: 1,
    id: langflowJson.id ?? "compiled-workflow",
    title: langflowJson.title ?? "Compiled Workflow",
    steps,
    edges,
    resources: langflowJson.resources ?? [],
  });
}

export async function compileAndWriteWorkflow(
  projectRoot: string,
  langflowJson: LangflowJson,
): Promise<WorkflowDefinition> {
  await compileLangflowToYaml(langflowJson, projectRoot);
  return compileLangflowJson(langflowJson);
}
