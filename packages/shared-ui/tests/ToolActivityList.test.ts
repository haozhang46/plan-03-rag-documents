// @vitest-environment happy-dom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ToolActivityList from "../src/components/ToolActivityList.vue";

describe("ToolActivityList", () => {
  it("renders runs and expands on click", async () => {
    const wrapper = mount(ToolActivityList, {
      props: {
        runs: [{ callId: "c1", name: "read_file", status: "done", output: "file contents" }],
      },
    });
    expect(wrapper.find('[data-testid="tool-activity-list"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("read_file");
    expect(wrapper.find('[data-testid="tool-output"]').exists()).toBe(false);
    await wrapper.find("button").trigger("click");
    expect(wrapper.find('[data-testid="tool-output"]').text()).toBe("file contents");
  });

  it("auto-expands error runs", () => {
    const wrapper = mount(ToolActivityList, {
      props: {
        runs: [{ callId: "c1", name: "write_file", status: "error", output: "fail" }],
      },
    });
    expect(wrapper.find('[data-testid="tool-output"]').exists()).toBe(true);
  });
});
