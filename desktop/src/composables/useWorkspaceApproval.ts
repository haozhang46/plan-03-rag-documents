import { ref } from "vue";
import { useWorkspaceConfig } from "./useWorkspaceConfig";
import {
  parsePendingWorkspaceApproval,
  type PendingWorkspaceApproval,
} from "../workspace/workspaceApproval";

export function useWorkspaceApproval(onApplied?: (workflowId: string, stepId: string) => void) {
  const { saveWorkspace } = useWorkspaceConfig();
  const pending = ref<PendingWorkspaceApproval | null>(null);
  const approvalError = ref<string | null>(null);
  const approving = ref(false);

  function handleToolEndOutput(output: string | undefined) {
    if (!output) return;
    const parsed = parsePendingWorkspaceApproval(output);
    if (parsed) {
      pending.value = parsed;
      approvalError.value = null;
    }
  }

  async function approvePending() {
    const item = pending.value;
    if (!item) return;
    approving.value = true;
    approvalError.value = null;
    try {
      await saveWorkspace(item.workflowId, item.stepId, item.after);
      pending.value = null;
      onApplied?.(item.workflowId, item.stepId);
    } catch (err) {
      approvalError.value = err instanceof Error ? err.message : String(err);
    } finally {
      approving.value = false;
    }
  }

  function cancelPending() {
    pending.value = null;
    approvalError.value = null;
  }

  return {
    pending,
    approvalError,
    approving,
    handleToolEndOutput,
    approvePending,
    cancelPending,
  };
}
