// @vitest-environment happy-dom
import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FeArchitecturePlanWidget from "../../src/workspace/widgets/FeArchitecturePlanWidget.vue";
import ComponentSplitterWidget from "../../src/workspace/widgets/ComponentSplitterWidget.vue";
import StyleTokensEditorWidget from "../../src/workspace/widgets/StyleTokensEditorWidget.vue";
import LangflowPanelWidget from "../../src/workspace/widgets/LangflowPanelWidget.vue";
import type { PanelApi } from "../../src/workspace/registryComponents";

function mockApi(overrides: Partial<PanelApi> = {}): PanelApi {
  return {
    fetchPhase: vi.fn(),
    fetchGates: vi.fn(),
    fetchDeploymentConfig: vi.fn(),
    fetchResourceContext: vi.fn(),
    fetchTopology: vi.fn(),
    listWorkspace: vi.fn(),
    readWorkspaceFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
    writeWorkspaceFile: vi.fn().mockResolvedValue(undefined),
    deleteWorkspacePath: vi.fn(),
    ...overrides,
  };
}

describe("FeArchitecturePlanWidget", () => {
  it("renders layer checklist and editor for new output file", async () => {
    const wrapper = mount(FeArchitecturePlanWidget, {
      props: {
        api: mockApi(),
        output: "docs/fe-architecture.md",
        layers: ["pages", "components"],
      },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("pages");
    expect(wrapper.text()).toContain("components");
    expect(wrapper.find('[data-testid="fe-arch-editor"]').exists()).toBe(true);
  });

  it("loads existing output file", async () => {
    const api = mockApi({
      readWorkspaceFile: vi.fn().mockResolvedValue({
        path: "docs/fe-architecture.md",
        content: "# Plan\n\n## Layers\n\n- [x] **pages**\n",
      }),
    });
    const wrapper = mount(FeArchitecturePlanWidget, {
      props: { api, output: "docs/fe-architecture.md", layers: ["pages"] },
    });
    await flushPromises();

    expect(api.readWorkspaceFile).toHaveBeenCalledWith("docs/fe-architecture.md");
    expect(wrapper.text()).toContain("Plan");
  });
});

describe("ComponentSplitterWidget", () => {
  beforeEach(() => {
    window.desktop = {
      getSidecarPort: vi.fn().mockResolvedValue(8765),
    } as unknown as typeof window.desktop;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ name: "frontend-design", description: "UI skill" }],
      }),
    );
  });

  it("loads from skill and writes markdown outline", async () => {
    const api = mockApi({
      readWorkspaceFile: vi.fn().mockRejectedValue(new Error("ENOENT")),
      writeWorkspaceFile: vi.fn().mockResolvedValue(undefined),
    });
    const wrapper = mount(ComponentSplitterWidget, {
      props: {
        api,
        output: "docs/components.md",
        skills: ["frontend-design"],
        editable: true,
      },
    });
    await flushPromises();

    await wrapper.find('[data-testid="load-from-skill"]').trigger("click");
    await flushPromises();

    expect(wrapper.find('[data-testid="component-editor"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("frontend-design");
  });
});

describe("StyleTokensEditorWidget", () => {
  it("loads tokens from theme file and saves", async () => {
    const writeWorkspaceFile = vi.fn().mockResolvedValue(undefined);
    const api = mockApi({
      readWorkspaceFile: vi.fn().mockResolvedValue({
        path: ".agentflow/theme-tokens.json",
        content: JSON.stringify({ primary: "#111111" }),
      }),
      writeWorkspaceFile,
    });
    const wrapper = mount(StyleTokensEditorWidget, {
      props: {
        api,
        preset: "unocss",
        target: "uno.config.ts",
      },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Style Tokens");
    await wrapper.find('[data-testid="save-tokens"]').trigger("click");
    await flushPromises();

    expect(writeWorkspaceFile).toHaveBeenCalled();
    const [, body] = writeWorkspaceFile.mock.calls[0];
    expect(body).toContain("#111111");
  });
});

describe("LangflowPanelWidget", () => {
  beforeEach(() => {
    window.desktop = {
      getSidecarPort: vi.fn().mockResolvedValue(8765),
    } as unknown as typeof window.desktop;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, baseUrl: "http://127.0.0.1:7860", mode: "external" }),
      }),
    );
  });

  it("shows message when flowId is missing", async () => {
    const wrapper = mount(LangflowPanelWidget, {
      props: { api: mockApi(), flowId: "", mode: "run" },
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="langflow-missing-flow"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("No Langflow flow configured");
  });

  it("embeds webview when flowId is set", async () => {
    const wrapper = mount(LangflowPanelWidget, {
      props: { api: mockApi(), flowId: "flow-abc", mode: "run" },
    });
    await flushPromises();

    expect(wrapper.find('[data-testid="langflow-webview"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("flow-abc");
  });
});
