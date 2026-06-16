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
