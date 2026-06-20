// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { useSubmitOnEnter } from "../src/composables/useSubmitOnEnter";

describe("useSubmitOnEnter", () => {
  it("calls onSubmit on Enter when not composing", () => {
    const onSubmit = vi.fn();
    const { onEnterKeydown } = useSubmitOnEnter(onSubmit);

    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(e, "isComposing", { value: false });
    onEnterKeydown(e);

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("does not call onSubmit when isComposing is true", () => {
    const onSubmit = vi.fn();
    const { onEnterKeydown } = useSubmitOnEnter(onSubmit);

    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(e, "isComposing", { value: true });
    onEnterKeydown(e);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not call onSubmit during composition fallback", () => {
    const onSubmit = vi.fn();
    const { onCompositionStart, onEnterKeydown } = useSubmitOnEnter(onSubmit);

    onCompositionStart();
    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(e, "isComposing", { value: false });
    onEnterKeydown(e);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit after composition ends", () => {
    const onSubmit = vi.fn();
    const { onCompositionStart, onCompositionEnd, onEnterKeydown } = useSubmitOnEnter(onSubmit);

    onCompositionStart();
    onCompositionEnd();

    const e = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    Object.defineProperty(e, "isComposing", { value: false });
    onEnterKeydown(e);

    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
