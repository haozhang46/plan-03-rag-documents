export function useOllamaEmbed() {
  const config = useRuntimeConfig();

  async function embedText(text: string): Promise<number[]> {
    const res = await fetch(`${config.public.ollamaBaseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.public.embeddingModel,
        input: text,
      }),
    });
    if (!res.ok) throw new Error(`Ollama embed failed: ${res.status}`);
    const data = (await res.json()) as { embedding: number[] };
    if (data.embedding.length !== config.public.embeddingDimensions) {
      throw new Error(
        `Expected ${config.public.embeddingDimensions} dims, got ${data.embedding.length}`,
      );
    }
    return data.embedding;
  }

  async function embedBatch(texts: string[]): Promise<number[][]> {
    const out: number[][] = [];
    for (const t of texts) {
      out.push(await embedText(t));
    }
    return out;
  }

  return { embedText, embedBatch };
}
