import type { RagDocument } from "~/types";

const REGISTRY_KEY = "rag:documents";
const THREAD_SELECTION_KEY = "rag:threadSelection";

function loadRegistry(): RagDocument[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    return raw ? (JSON.parse(raw) as RagDocument[]) : [];
  } catch {
    return [];
  }
}

function saveRegistry(docs: RagDocument[]) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(docs));
}

function loadAllThreadSelections(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(THREAD_SELECTION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function saveThreadSelection(threadId: string, ids: string[]) {
  const all = loadAllThreadSelections();
  if (ids.length) {
    all[threadId] = ids;
  } else {
    delete all[threadId];
  }
  localStorage.setItem(THREAD_SELECTION_KEY, JSON.stringify(all));
}

function mergeDocuments(
  remote: RagDocument[],
  local: RagDocument[],
): RagDocument[] {
  const byId = new Map<string, RagDocument>();
  for (const doc of local) byId.set(doc.document_id, doc);
  for (const doc of remote) byId.set(doc.document_id, doc);
  return [...byId.values()].sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? ""),
  );
}

function upsertRegistry(doc: RagDocument) {
  const docs = loadRegistry().filter((d) => d.document_id !== doc.document_id);
  docs.unshift(doc);
  saveRegistry(docs);
}

function removeFromRegistry(documentId: string) {
  saveRegistry(
    loadRegistry().filter((d) => d.document_id !== documentId),
  );
}

export function useDocuments(activeThreadId: Ref<string | null>) {
  const config = useRuntimeConfig();
  const documents = ref<RagDocument[]>(loadRegistry());
  const selectedIds = ref<string[]>([]);
  const loading = ref(false);
  const uploading = ref(false);
  const error = ref<string | null>(null);

  function applyThreadSelection(threadId: string | null) {
    if (!threadId) {
      selectedIds.value = [];
      return;
    }
    selectedIds.value = loadAllThreadSelections()[threadId] ?? [];
  }

  watch(
    activeThreadId,
    (id) => {
      applyThreadSelection(id);
    },
    { immediate: true },
  );

  watch(
    selectedIds,
    (ids) => {
      if (activeThreadId.value) {
        saveThreadSelection(activeThreadId.value, ids);
      }
    },
    { deep: true },
  );

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${config.public.apiBase}/v1/documents`);
      if (res.status === 503) {
        documents.value = loadRegistry();
        return;
      }
      if (!res.ok) throw new Error(`List documents failed: ${res.status}`);
      const data = (await res.json()) as { documents: RagDocument[] };
      documents.value = mergeDocuments(data.documents, loadRegistry());
      saveRegistry(documents.value);
    } catch (e) {
      documents.value = loadRegistry();
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  async function uploadFile(file: File): Promise<string> {
    uploading.value = true;
    error.value = null;
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      let documentId: string;

      if (ext === "pdf") {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${config.public.apiBase}/v1/documents/upload`, {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const data = (await res.json()) as { document_id: string };
        documentId = data.document_id;
      } else {
        const { syncTextFile } = useDocumentSync();
        documentId = await syncTextFile(file);
      }

      const doc: RagDocument = {
        document_id: documentId,
        filename: file.name,
        content_type: file.type || undefined,
        embedding_model: String(config.public.embeddingModel),
        embedding_dimensions: Number(config.public.embeddingDimensions),
        created_at: new Date().toISOString(),
      };
      upsertRegistry(doc);
      documents.value = mergeDocuments([doc], documents.value);
      if (!selectedIds.value.includes(documentId)) {
        selectedIds.value = [...selectedIds.value, documentId];
      }
      return documentId;
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    } finally {
      uploading.value = false;
    }
  }

  async function removeDocument(documentId: string) {
    error.value = null;
    try {
      const res = await fetch(
        `${config.public.apiBase}/v1/documents/${documentId}`,
        { method: "DELETE" },
      );
      if (res.status !== 404 && res.status !== 503 && !res.ok) {
        throw new Error(`Delete failed: ${res.status}`);
      }
    } catch (e) {
      error.value = (e as Error).message;
      throw e;
    }
    removeFromRegistry(documentId);
    documents.value = documents.value.filter(
      (d) => d.document_id !== documentId,
    );
    selectedIds.value = selectedIds.value.filter((id) => id !== documentId);
  }

  function toggleSelected(documentId: string) {
    if (selectedIds.value.includes(documentId)) {
      selectedIds.value = selectedIds.value.filter((id) => id !== documentId);
    } else {
      selectedIds.value = [...selectedIds.value, documentId];
    }
  }

  function selectAll() {
    selectedIds.value = documents.value.map((d) => d.document_id);
  }

  function clearSelection() {
    selectedIds.value = [];
  }

  return {
    documents,
    selectedIds,
    loading,
    uploading,
    error,
    refresh,
    uploadFile,
    removeDocument,
    toggleSelected,
    selectAll,
    clearSelection,
  };
}
