import type { FlowInfo } from "~/types";

const STORAGE_KEY = "debug:flow_id";

export function useFlows() {
  const config = useRuntimeConfig();
  const flows = ref<FlowInfo[]>([]);
  const flowId = ref("default");
  const loading = ref(false);
  const error = ref<string | null>(null);

  function loadStoredFlowId() {
    flowId.value =
      localStorage.getItem(STORAGE_KEY) ||
      String(config.public.defaultFlowId || "default");
  }

  function saveFlowId(id: string) {
    flowId.value = id;
    localStorage.setItem(STORAGE_KEY, id);
  }

  async function refresh() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${config.public.apiBase}/v1/flows`);
      if (!res.ok) throw new Error(`List flows failed: ${res.status}`);
      const data = (await res.json()) as { flows: FlowInfo[] };
      flows.value = data.flows;
      if (!flows.value.some((f) => f.flow_id === flowId.value)) {
        saveFlowId(flows.value[0]?.flow_id ?? "default");
      }
    } catch (e) {
      error.value = (e as Error).message;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    loadStoredFlowId();
  });

  return { flows, flowId, loading, error, refresh, saveFlowId, loadStoredFlowId };
}
