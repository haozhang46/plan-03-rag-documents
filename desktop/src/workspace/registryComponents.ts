import type { Component } from "vue";
import type { useWorkflow } from "../composables/useWorkflow";

export type PanelApi = Pick<
  ReturnType<typeof useWorkflow>,
  | "fetchPhase"
  | "fetchGates"
  | "fetchDeploymentConfig"
  | "fetchResourceContext"
  | "fetchTopology"
  | "listWorkspace"
  | "readWorkspaceFile"
  | "writeWorkspaceFile"
  | "deleteWorkspacePath"
>;

export const WIDGET_COMPONENTS: Record<string, () => Promise<{ default: Component }>> = {
  "markdown-doc": () => import("./widgets/MarkdownDocWidget.vue"),
  "architecture-docs": () => import("./widgets/ArchitectureDocsWidget.vue"),
  "code-explorer": () => import("./widgets/CodeExplorerWidget.vue"),
  "agent-run": () => import("./widgets/AgentRunWidget.vue"),
  "cicd-config": () => import("./widgets/CicdConfigWidget.vue"),
  "fe-architecture-plan": () => import("./widgets/FeArchitecturePlanWidget.vue"),
  "component-splitter": () => import("./widgets/ComponentSplitterWidget.vue"),
  "style-tokens-editor": () => import("./widgets/StyleTokensEditorWidget.vue"),
  "langflow-panel": () => import("./widgets/LangflowPanelWidget.vue"),
};

export function isRegisteredWidgetType(type: string): boolean {
  return type in WIDGET_COMPONENTS;
}
