// @vitest-environment happy-dom
import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkspaceDesigner from "../../src/components/workflow/WorkspaceDesigner.vue";
import type { DesktopApi } from "../../electron/preload";
import type { WorkspaceDefinition } from "../../src/workspace/registry";

async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await flushPromises();
  }
}

const mockSteps = [
  { id: "prd", title: "PRD" },
  { id: "architecture", title: "Architecture" },
];

const emptyWorkspace: WorkspaceDefinition = {
  version: 1,
  stepId: "prd",
  layout: "tabs",
  components: [],
};

describe("WorkspaceDesigner", () => {
  let savePayload: WorkspaceDefinition | null = null;

  beforeEach(() => {
    savePayload = null;
    const desktop: DesktopApi = {
      getApiKeyStatus: vi.fn().mockResolvedValue(""),
      setApiKey: vi.fn().mockResolvedValue(true),
      clearApiKey: vi.fn().mockResolvedValue(true),
      getResourceServerUrl: vi.fn().mockResolvedValue(""),
      setResourceServerUrl: vi.fn().mockResolvedValue(true),
      getWorkspace: vi.fn().mockResolvedValue("/tmp/project"),
      pickWorkspace: vi.fn().mockResolvedValue(""),
      pickProjectDirectory: vi.fn().mockResolvedValue(""),
      initProject: vi.fn().mockResolvedValue(""),
      openProject: vi.fn().mockResolvedValue(""),
      getRecentProjects: vi.fn().mockResolvedValue([]),
      getSidecarPort: vi.fn().mockResolvedValue(8765),
    };
    window.desktop = desktop;

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/v1/workspace/registry")) {
          return new Response(
            JSON.stringify({
              components: [
                {
                  type: "markdown-doc",
                  label: "Markdown Doc",
                  description: "Single document editor",
                  category: "docs",
                  defaultProps: { docsDir: "docs" },
                  propsFields: [{ key: "docsDir", label: "Docs directory", type: "string" }],
                },
                {
                  type: "code-explorer",
                  label: "Code Explorer",
                  description: "File tree",
                  category: "code",
                  defaultProps: { root: ".", writable: false },
                  propsFields: [
                    { key: "root", label: "Root path", type: "string", required: true },
                    { key: "writable", label: "Writable", type: "boolean" },
                  ],
                },
              ],
            }),
            { status: 200 },
          );
        }
        if (url.includes("/v1/workflows/wf-1/workspaces/prd") && init?.method === "PUT") {
          savePayload = JSON.parse(String(init.body)) as WorkspaceDefinition;
          return new Response(JSON.stringify(savePayload), { status: 200 });
        }
        if (url.includes("/v1/workflows/wf-1/workspaces/prd")) {
          return new Response(JSON.stringify(emptyWorkspace), { status: 200 });
        }
        if (url.includes("/v1/workflows/wf-1/workspaces/architecture")) {
          return new Response(JSON.stringify({ ...emptyWorkspace, stepId: "architecture" }), {
            status: 200,
          });
        }
        return new Response("not found", { status: 404 });
      }),
    );
  });

  it("loads registry and shows step selector", async () => {
    const wrapper = mount(WorkspaceDesigner, {
      props: {
        show: true,
        workflowId: "wf-1",
        steps: mockSteps,
        initialStepId: "prd",
      },
    });
    await settle();

    expect(wrapper.find('[data-testid="workspace-designer"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="step-selector"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="library-markdown-doc"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Markdown Doc");
  });

  it("adds a component from the library", async () => {
    const wrapper = mount(WorkspaceDesigner, {
      props: {
        show: true,
        workflowId: "wf-1",
        steps: mockSteps,
        initialStepId: "prd",
      },
    });
    await settle();

    await wrapper.find('[data-testid="library-markdown-doc"]').trigger("click");
    await settle();

    expect(wrapper.find('[data-testid="selected-list"]').text()).toContain("Markdown Doc");
    expect(wrapper.find('[data-testid="prop-field-docsDir"]').exists()).toBe(true);
  });

  it("reorders components with move down", async () => {
    const wrapper = mount(WorkspaceDesigner, {
      props: {
        show: true,
        workflowId: "wf-1",
        steps: mockSteps,
        initialStepId: "prd",
      },
    });
    await settle();

    await wrapper.find('[data-testid="library-markdown-doc"]').trigger("click");
    await wrapper.find('[data-testid="library-code-explorer"]').trigger("click");
    await settle();

    const items = wrapper.findAll('li[data-testid^="selected-"]');
    expect(items).toHaveLength(2);
    const firstId = items[0].attributes("data-testid")?.replace("selected-", "");
    expect(firstId).toBeTruthy();

    await wrapper.find(`[data-testid="move-down-${firstId}"]`).trigger("click");
    await settle();

    const reordered = wrapper.findAll('li[data-testid^="selected-"]');
    expect(reordered[0].text()).toContain("Code Explorer");
    expect(reordered[1].text()).toContain("Markdown Doc");
  });

  it("saves workspace payload via PUT", async () => {
    const wrapper = mount(WorkspaceDesigner, {
      props: {
        show: true,
        workflowId: "wf-1",
        steps: mockSteps,
        initialStepId: "prd",
      },
    });
    await settle();

    await wrapper.find('[data-testid="library-markdown-doc"]').trigger("click");
    await settle();

    const layoutSelect = wrapper.find('[data-testid="layout-selector"]');
    await layoutSelect.setValue("stack");

    await wrapper.find('[data-testid="save-workspace"]').trigger("click");
    await settle();

    expect(savePayload).not.toBeNull();
    expect(savePayload!.version).toBe(1);
    expect(savePayload!.stepId).toBe("prd");
    expect(savePayload!.layout).toBe("stack");
    expect(savePayload!.components).toHaveLength(1);
    expect(savePayload!.components[0].type).toBe("markdown-doc");
    expect(wrapper.emitted("saved")?.[0]?.[0]).toEqual(savePayload);
  });
});
