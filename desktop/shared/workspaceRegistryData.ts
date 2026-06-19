export type PropFieldType =
  | "string"
  | "boolean"
  | "select"
  | "string[]"
  | "skills"
  | "langflow-flow";

export type PropField = {
  key: string;
  label: string;
  type: PropFieldType;
  required?: boolean;
  options?: string[];
};

export type WorkspaceRegistryEntry = {
  type: string;
  label: string;
  description: string;
  category: string;
  defaultProps: Record<string, unknown>;
  propsFields: PropField[];
};

export const WORKSPACE_REGISTRY: WorkspaceRegistryEntry[] = [
  {
    type: "markdown-doc",
    label: "Markdown Doc",
    description: "Single document editor and preview",
    category: "docs",
    defaultProps: { docsDir: "docs" },
    propsFields: [{ key: "docsDir", label: "Docs directory", type: "string" }],
  },
  {
    type: "architecture-docs",
    label: "Architecture Docs",
    description: "Multi-tab architecture documentation",
    category: "docs",
    defaultProps: { files: [] },
    propsFields: [{ key: "files", label: "Files", type: "string[]" }],
  },
  {
    type: "code-explorer",
    label: "Code Explorer",
    description: "File tree with view and optional edit",
    category: "code",
    defaultProps: { root: ".", writable: false },
    propsFields: [
      { key: "root", label: "Root path", type: "string", required: true },
      { key: "writable", label: "Writable", type: "boolean" },
    ],
  },
  {
    type: "agent-run",
    label: "Agent Run",
    description: "Gates, phase, and run status panel",
    category: "workflow",
    defaultProps: {},
    propsFields: [{ key: "reportPath", label: "Report path", type: "string" }],
  },
  {
    type: "cicd-config",
    label: "CI/CD Config",
    description: "Deployment and ops summary",
    category: "ops",
    defaultProps: {},
    propsFields: [],
  },
  {
    type: "fe-architecture-plan",
    label: "FE Architecture Plan",
    description: "Frontend layered architecture planner",
    category: "frontend",
    defaultProps: { output: "docs/fe-architecture.md", layers: ["pages", "components", "composables"] },
    propsFields: [
      { key: "output", label: "Output file", type: "string", required: true },
      { key: "layers", label: "Layers", type: "string[]", required: true },
    ],
  },
  {
    type: "component-splitter",
    label: "Component Splitter",
    description: "Component tree with skill load and manual edit",
    category: "frontend",
    defaultProps: { output: "docs/components.md", skills: [], editable: true },
    propsFields: [
      { key: "output", label: "Output file", type: "string", required: true },
      { key: "skills", label: "Skills", type: "skills" },
      { key: "editable", label: "Editable", type: "boolean" },
    ],
  },
  {
    type: "style-tokens-editor",
    label: "Style Tokens Editor",
    description: "UnoCSS or Tailwind-like token editor",
    category: "frontend",
    defaultProps: { preset: "unocss", target: "uno.config.ts" },
    propsFields: [
      { key: "preset", label: "Preset", type: "select", required: true, options: ["unocss", "tailwind"] },
      { key: "target", label: "Target file", type: "string", required: true },
      { key: "themeFile", label: "Theme file", type: "string" },
    ],
  },
  {
    type: "langflow-panel",
    label: "Langflow Panel",
    description: "Embed a Langflow flow for agent execution",
    category: "agent",
    defaultProps: { flowId: "", mode: "run" },
    propsFields: [
      { key: "flowId", label: "Flow", type: "langflow-flow", required: true },
      { key: "mode", label: "Mode", type: "select", required: true, options: ["run"] },
    ],
  },
];
