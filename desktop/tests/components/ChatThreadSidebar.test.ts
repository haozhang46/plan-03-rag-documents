// @vitest-environment happy-dom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ChatThreadSidebar from "../../src/components/chat/ChatThreadSidebar.vue";

const sampleThreads = [
  { id: "t1", title: "First chat" },
  { id: "t2", title: "Second chat" },
];

describe("ChatThreadSidebar", () => {
  it("renders thread titles when expanded", () => {
    const wrapper = mount(ChatThreadSidebar, {
      props: {
        threads: sampleThreads,
        activeId: "t1",
        collapsed: false,
      },
    });

    expect(wrapper.text()).toContain("First chat");
    expect(wrapper.text()).toContain("Second chat");
  });

  it("click thread emits select", async () => {
    const wrapper = mount(ChatThreadSidebar, {
      props: {
        threads: sampleThreads,
        activeId: "t1",
        collapsed: false,
      },
    });

    await wrapper.find('[data-testid="chat-thread-item-t2"]').trigger("click");

    expect(wrapper.emitted("select")).toEqual([["t2"]]);
  });

  it("click chevron toggles collapsed emit", async () => {
    const wrapper = mount(ChatThreadSidebar, {
      props: {
        threads: sampleThreads,
        activeId: "t1",
        collapsed: false,
      },
    });

    await wrapper.find('[data-testid="chat-thread-toggle"]').trigger("click");

    expect(wrapper.emitted("update:collapsed")).toEqual([[true]]);
  });
});
