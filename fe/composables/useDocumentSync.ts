import type { ChunkUpload, CreateDocumentBody } from "~/types";
import { chunkText } from "~/composables/useChunkText";

const CHUNK_BATCH_SIZE = 20;

function contentTypeForFile(file: File): string {
  if (file.type) return file.type;
  if (file.name.endsWith(".md")) return "text/markdown";
  return "text/plain";
}

export function useDocumentSync() {
  const config = useRuntimeConfig();
  const { embedBatch } = useOllamaEmbed();

  async function createDocument(meta: CreateDocumentBody): Promise<string> {
    const res = await fetch(`${config.public.apiBase}/v1/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meta),
    });
    if (!res.ok) throw new Error(`Create document failed: ${res.status}`);
    const data = (await res.json()) as { document_id: string };
    return data.document_id;
  }

  async function uploadChunks(
    documentId: string,
    chunks: ChunkUpload[],
  ): Promise<void> {
    const res = await fetch(
      `${config.public.apiBase}/v1/documents/${documentId}/chunks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks }),
      },
    );
    if (!res.ok) throw new Error(`Upload chunks failed: ${res.status}`);
  }

  async function syncTextFile(file: File): Promise<string> {
    const text = await file.text();
    const parts = chunkText(text);
    if (!parts.length) throw new Error("Empty document");
    const docId = await createDocument({
      filename: file.name,
      content_type: contentTypeForFile(file),
      embedding_model: String(config.public.embeddingModel),
      embedding_dimensions: Number(config.public.embeddingDimensions),
    });
    const vectors = await embedBatch(parts);
    const chunks: ChunkUpload[] = parts.map((content, i) => ({
      chunk_index: i,
      content,
      embedding: vectors[i],
    }));
    for (let i = 0; i < chunks.length; i += CHUNK_BATCH_SIZE) {
      await uploadChunks(docId, chunks.slice(i, i + CHUNK_BATCH_SIZE));
    }
    return docId;
  }

  return { syncTextFile, createDocument, uploadChunks };
}
