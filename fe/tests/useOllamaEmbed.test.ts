import { describe, it, expect, vi, beforeEach } from "vitest";

vi.stubGlobal("useRuntimeConfig", () => ({
  public: {
    ollamaBaseUrl: "http://localhost:11434",
    embeddingModel: "nomic-embed-text",
    embeddingDimensions: 768,
  },
}));

import { useOllamaEmbed } from "../composables/useOllamaEmbed";

describe("useOllamaEmbed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("embedText returns embedding from Ollama", async () => {
    const embedding = new Array(768).fill(0.1);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ embedding }),
      }),
    );

    const { embedText } = useOllamaEmbed();
    const result = await embedText("hello");
    expect(result).toEqual(embedding);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:11434/api/embeddings",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("embedText throws on dimension mismatch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ embedding: [0.1, 0.2] }),
      }),
    );

    const { embedText } = useOllamaEmbed();
    await expect(embedText("hello")).rejects.toThrow("Expected 768 dims");
  });
});
