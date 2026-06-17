// @vitest-environment happy-dom
import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkflowRun from "../../src/pages/WorkflowRun.vue";
import type { DesktopApi } from "../../electron/preload";

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const mockWorkflow = {
  version: 1 as const,
  id: "default-dev-cicd",
  title: "Dev to CI/CD Pipeline",
  steps: [
    {
      id: "prd",
      title: "PRD",
      executor: "deepseek",
      skills: ["brainstorming"],
      outputs: ["docs/PRD.md"],
    },
    {
      id: "architecture",
      title: "Architecture",
      executor: "deepseek",
      skills: [],
      outputs: ["docs/architecture.md"],
    },
    {
      id: "fe-dev",
      title: "Frontend Development",
      executor: "claude-code",
      skills: [],
      outputs: ["fe/"],
    },
    {
      id: "test",
      title: "Test",
      executor: "deepseek",
      skills: [],
      outputs: ["test-report.md"],
    },
    {
      id: "cicd",
      title: "CI/CD",
      executor: "deepseek",
      skills: [],
      outputs: [".github/workflows/"],
    },
  ],
  edges: [],
  resources: [],
};

const mockState = {
  workflowId: "default-dev-cicd",
  currentStepId: "prd",
  stepStatuses: {
    prd: "pending" as const,
    architecture: "pending" as const,
    "fe-dev": "pending" as const,
    test: "pending" as const,
    cicd: "pending" as const,
  },
  threadId: "thread-1",
};

describe("WorkflowRun", () => {
  beforeEach(() => {
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
      vi.fn(async (input: string | URL) => {
        const url = String(input);
        if (url.includes("/v1/workflows") && !url.includes("/current") && !url.includes("/templates")) {
          return new Response(
            JSON.stringify({
              workflows: [{ id: "default-dev-cicd", title: "Dev to CI/CD Pipeline", isLegacy: true, isActive: true }],
              activeWorkflowId: "default-dev-cicd",
            }),
            { status: 200 },
          );
        }
        if (url.includes("/v1/workflows/current")) {
          return new Response(JSON.stringify(mockWorkflow), { status: 200 });
        }
        if (url.includes("/v1/workflow/state")) {
          return new Response(JSON.stringify(mockState), { status: 200 });
        }
        if (url.includes("/v1/skills")) {
          return new Response(JSON.stringify(["brainstorming", "writing-plans"]), {
            status: 200,
          });
        }
        if (url.includes("/v1/workspace/list")) {
          return new Response(
            JSON.stringify({ path: "docs", entries: [{ name: "PRD.md", path: "docs/PRD.md", type: "file" }] }),
            { status: 200 },
          );
        }
        if (url.includes("/v1/workspace/file")) {
          return new Response(
            JSON.stringify({ path: "docs/PRD.md", content: "# PRD\n\nSample" }),
            { status: 200 },
          );
        }
        return new Response("not found", { status: 404 });
      }),
    );
  });

  it("mounts and shows workflow steps with status badges", async () => {
    const wrapper = mount(WorkflowRun, {
      props: { workspace: "/tmp/project" },
    });
    await flushPromises();
    await flushPromises();

    expect(wrapper.text()).toContain("Dev to CI/CD Pipeline");
    expect(wrapper.text()).toContain("PRD");
    expect(wrapper.text()).toContain("Architecture");
    expect(wrapper.text()).toContain("Pending");
    expect(wrapper.text()).toContain("Continue");
    expect(wrapper.text()).toContain("Step Chat");
    expect(wrapper.text()).toContain("Documents");
  });

  it("shows architecture panel when architecture step selected", async () => {
    const wrapper = mount(WorkflowRun, {
      props: { workspace: "/tmp/project" },
    });
    await flushPromises();
    await flushPromises();

    const archBtn = wrapper
      .findAll("button")
      .find((b) => b.text().includes("Architecture") && b.text().includes("Pending"));
    expect(archBtn).toBeDefined();
    await archBtn!.trigger("click");
    await flushPromises();

    expect(wrapper.text()).toContain("docs/architecture.md");
  });

  it("switches to Free Chat tab", async () => {
    const wrapper = mount(WorkflowRun, {
      props: { workspace: "/tmp/project" },
    });
    await flushPromises();
    await flushPromises();

    const freeTab = wrapper.findAll("button").find((b) => b.text() === "Free Chat");
    expect(freeTab).toBeDefined();
    await freeTab!.trigger("click");

    expect(wrapper.text()).toContain("Free Chat");
  });
});
