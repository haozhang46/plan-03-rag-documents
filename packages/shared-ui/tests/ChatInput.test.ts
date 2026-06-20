// @vitest-environment happy-dom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ChatInput from "../src/components/ChatInput.vue";

describe("ChatInput", () => {
  it("addAttachment shows chip and dedupes by path", async () => {
    const wrapper = mount(ChatInput, {
      props: { loading: false },
    });

    const vm = wrapper.vm as { addAttachment: (item: { path: string; label: string }) => void };
    vm.addAttachment({ path: "/docs/a.md", label: "a.md" });
    vm.addAttachment({ path: "/docs/a.md", label: "a.md (dup)" });
    await wrapper.vm.$nextTick();

    const chips = wrapper.findAll('[data-testid="chat-attachment-chip"]');
    expect(chips).toHaveLength(1);
    expect(chips[0]!.text()).toContain("a.md");
    expect(chips[0]!.text()).not.toContain("dup");
  });

  it("send emits { text, attachments } and clears state", async () => {
    const wrapper = mount(ChatInput, {
      props: { loading: false },
    });

    const vm = wrapper.vm as { addAttachment: (item: { path: string; label: string }) => void };
    vm.addAttachment({ path: "/docs/a.md", label: "a.md" });
    await wrapper.find("textarea").setValue("hello");
    await wrapper.find("form").trigger("submit");

    const emitted = wrapper.emitted("send");
    expect(emitted).toHaveLength(1);
    expect(emitted![0]).toEqual([{ text: "hello", attachments: [{ path: "/docs/a.md", label: "a.md" }] }]);

    expect(wrapper.find("textarea").element.value).toBe("");
    expect(wrapper.findAll('[data-testid="chat-attachment-chip"]')).toHaveLength(0);
  });

  it("ctrl+z restores previous text after send", async () => {
    const wrapper = mount(ChatInput, {
      props: { loading: false },
    });

    await wrapper.find("textarea").setValue("hello");
    await wrapper.find("form").trigger("submit");
    expect(wrapper.find("textarea").element.value).toBe("");

    const textarea = wrapper.find("textarea").element;
    textarea.dispatchEvent(
      new KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true }),
    );
    await wrapper.vm.$nextTick();

    expect(textarea.value).toBe("hello");
  });
});
