import { describe, it, expect } from "vitest";
import { chunkText } from "../composables/useChunkText";

describe("chunkText", () => {
  it("returns empty array for blank text", () => {
    expect(chunkText("   ")).toEqual([]);
    expect(chunkText("")).toEqual([]);
  });

  it("splits text with overlap", () => {
    const text = "a".repeat(1000);
    const chunks = chunkText(text, 800, 100);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]).toHaveLength(800);
    expect(chunks[1].slice(0, 100)).toBe(chunks[0].slice(700));
  });

  it("returns single chunk when text fits", () => {
    expect(chunkText("hello world")).toEqual(["hello world"]);
  });
});
