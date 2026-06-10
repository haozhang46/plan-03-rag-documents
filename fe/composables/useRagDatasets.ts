import type { RagDataset } from "~/types";

const SELECTION_KEY = "rag:datasetSelection";

function loadAllSelections(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(SELECTION_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function saveSelection(threadId: string, ids: string[]) {
  const all = loadAllSelections();
  if (ids.length) {
    all[threadId] = ids;
  } else {
    delete all[threadId];
  }
  localStorage.setItem(SELECTION_KEY, JSON.stringify(all));
}

export function useRagDatasets(activeThreadId: Ref<string | null>) {
  const config = useRuntimeConfig();
  const datasets = ref<RagDataset[]>([]);
  const selectedIds = ref<string[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  function applyThreadSelection(threadId: string | null) {
    if (!threadId) {
      selectedIds.value = [];
      return;
    }
    selectedIds.value = loadAllSelections()[threadId] ?? [];
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
        saveSelection(activeThreadId.value, ids);
      }
    },
    { deep: true },
  );

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${config.public.apiBase}/v1/rag/datasets`);
      if (!res.ok) throw new Error(`List datasets failed: ${res.status}`);
      const data = (await res.json()) as { datasets: RagDataset[] };
      datasets.value = data.datasets;
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  function toggleSelected(datasetId: string) {
    if (selectedIds.value.includes(datasetId)) {
      selectedIds.value = selectedIds.value.filter((id) => id !== datasetId);
    } else {
      selectedIds.value = [...selectedIds.value, datasetId];
    }
  }

  function selectAll() {
    selectedIds.value = datasets.value.map((d) => d.id);
  }

  function clearSelection() {
    selectedIds.value = [];
  }

  return {
    datasets,
    selectedIds,
    loading,
    error,
    refresh,
    toggleSelected,
    selectAll,
    clearSelection,
  };
}
