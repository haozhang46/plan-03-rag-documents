import { describe, expect, it } from "vitest";
import { useTextareaUndo } from "../src/composables/useTextareaUndo";

describe("useTextareaUndo", () => {
  it("records distinct values and undoes to previous", () => {
    const { record, undo } = useTextareaUndo();

    record("a");
    record("ab");
    record("abc");

    expect(undo()).toBe("ab");
    expect(undo()).toBe("a");
    expect(undo()).toBe("");
    expect(undo()).toBeNull();
  });

  it("redoes after undo", () => {
    const { record, undo, redo } = useTextareaUndo();

    record("a");
    record("ab");
    expect(undo()).toBe("a");
    expect(redo()).toBe("ab");
    expect(redo()).toBeNull();
  });

  it("skips duplicate consecutive values", () => {
    const { record, undo } = useTextareaUndo();

    record("hello");
    record("hello");
    expect(undo()).toBe("");
    expect(undo()).toBeNull();
  });

  it("restores cleared input after send", () => {
    const { record, undo } = useTextareaUndo();

    record("draft message");
    record("");
    expect(undo()).toBe("draft message");
  });
});
