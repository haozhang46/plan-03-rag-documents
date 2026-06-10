import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useDocuments } from "../composables/useDocuments";

describe("useDocuments", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("useRuntimeConfig", () => ({
      public: {
        apiBase: "",
        embeddingModel: "nomic-embed-text",
        embeddingDimensions: 768,
      },
    }));
  });

  it("persists selected documents per thread", async () => {
    const threadId = ref("thread-a");
    const { selectedIds, toggleSelected } = useDocuments(threadId);

    toggleSelected("doc-1");
    expect(selectedIds.value).toEqual(["doc-1"]);

    threadId.value = "thread-b";
    expect(selectedIds.value).toEqual([]);

    toggleSelected("doc-2");
    threadId.value = "thread-a";
    expect(selectedIds.value).toEqual(["doc-1"]);
  });

  it("loads documents from API and merges with local registry", async () => {
    localStorage.setItem(
      "rag:documents",
      JSON.stringify([
        {
          document_id: "local-1",
          filename: "local.txt",
          created_at: "2026-05-27T00:00:00.000Z",
        },
      ]),
    );

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          documents: [
            {
              document_id: "remote-1",
              filename: "remote.md",
              created_at: "2026-05-28T00:00:00.000Z",
            },
          ],
        }),
      }),
    );

    const { documents, refresh } = useDocuments(ref(null));
    await refresh();

    const ids = documents.value.map((d) => d.document_id).sort();
    expect(ids).toEqual(["local-1", "remote-1"]);
  });

  it("falls back to local registry when API unavailable", async () => {
    localStorage.setItem(
      "rag:documents",
      JSON.stringify([
        { document_id: "local-1", filename: "notes.txt" },
      ]),
    );

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    const { documents, refresh } = useDocuments(ref(null));
    await refresh();

    expect(documents.value).toHaveLength(1);
    expect(documents.value[0].filename).toBe("notes.txt");
  });
});
