import type { ToolEvent, ToolRun } from "../types/chat";

function resolveCallId(event: ToolEvent, existing: ToolRun[]): string {
  if (event.call_id) return event.call_id;
  const base = event.name ?? "tool";
  let n = existing.length;
  let id = `${base}-${n}`;
  while (existing?.some((r) => r.callId === id)) {
    n += 1;
    id = `${base}-${n}`;
  }
  return id;
}

export function upsertToolStart(runs: ToolRun[], event: ToolEvent): ToolRun[] {
  if (!event || typeof event !== "object") return runs;
  const runsArr = runs ?? [];
  const callId = resolveCallId(event, runsArr);
  const name = event.name ?? "unknown";
  const idx = runsArr.findIndex((r) => r.callId === callId);
  if (idx >= 0) {
    const next = [...runsArr];
    next[idx] = { ...next[idx]!, callId, name, status: "running" };
    return next;
  }
  return [...runsArr, { callId, name, status: "running" }];
}

export function applyToolEnd(runs: ToolRun[], event: ToolEvent): ToolRun[] {
  if (!event || typeof event !== "object") return runs;
  const runsArr = runs ?? [];
  const callId = event.call_id ?? runsArr.find((r) => r.name === event.name && r.status === "running")?.callId;
  if (!callId) return runsArr;
  const next = [...runsArr];
  const idx = next.findIndex((r) => r.callId === callId);
  if (idx < 0) return runsArr;
  next[idx] = {
    ...next[idx]!,
    status: event.ok === false ? "error" : "done",
    output: event.output,
  };
  return next;
}
