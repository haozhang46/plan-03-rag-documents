// @vitest-environment happy-dom
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ChatMessage from "../src/components/ChatMessage.vue";

describe("ChatMessage", () => {
  it("shows attachment chips on user messages", async () => {
    const wrapper = mount(ChatMessage, {
      props: {
        msg: {
          role: "user",
          content: "hello",
          attachments: ["/workspace/docs/a.md", "/workspace/docs/b.md"],
        },
      },
    });

    const chips = wrapper.findAll('[data-testid="message-attachment-chip"]');
    expect(chips).toHaveLength(2);
    expect(chips[0]!.text()).toBe("a.md");
    expect(chips[1]!.text()).toBe("b.md");
    expect(wrapper.text()).toContain("hello");
  });

  it("does not show attachment chips when none are present", () => {
    const wrapper = mount(ChatMessage, {
      props: {
        msg: { role: "user", content: "hello" },
      },
    });

    expect(wrapper.findAll('[data-testid="message-attachment-chip"]')).toHaveLength(0);
  });
});
