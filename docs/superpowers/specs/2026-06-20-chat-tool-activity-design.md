# Chat Tool Activity UI Design

**Date:** 2026-06-20  
**Status:** Approved

## Problem

WorkflowRun step chat appends markdown blockquotes for every tool start/end (`> Tool **read_file** started…`), cluttering the assistant message. Desktop Chat Agent mode ignores tool events entirely.

## Goal

Cursor-style tool activity: a collapsible list attached to each assistant turn, updated in place during streaming. Expand for output details.

## Scope

| Surface | Action |
|---------|--------|
| WorkflowRun step chat | Replace `appendToolNote` with structured `toolRuns` |
| Desktop Chat (`Chat.vue`) Agent mode | Handle `tool_start`/`tool_end` same way |
| Free chat / Ask / Plan modes | No change (no tools or ignored) |
| `shared-ui` `ChatMessage` | Render `ToolActivityList` above markdown body |

## Data Model

```ts
export type ToolRunStatus = "running" | "done" | "error";

export interface ToolRun {
  callId: string;
  name: string;
  status: ToolRunStatus;
  output?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  toolRuns?: ToolRun[];  // assistant only
  citations?: string[];
  attachments?: string[];
}
```

Match tools by `ToolEvent.call_id` (fallback: `${name}-${index}` if missing).

## UI: `ToolActivityList`

- Renders only when `toolRuns.length > 0`
- Each row: status icon + tool name (+ truncated output preview when collapsed)
- **running**: spinner, muted text
- **done**: checkmark, collapsed by default, click to expand output
- **error**: red X, expanded by default
- Expanded body: `<pre>` with `output`, max-height 120px, scroll

Placed **above** assistant markdown content inside the bubble.

## Composable: `useToolRuns`

Pure functions + optional ref helper:

```ts
export function upsertToolStart(runs: ToolRun[], event: ToolEvent): ToolRun[]
export function applyToolEnd(runs: ToolRun[], event: ToolEvent): ToolRun[]
export function toolLabel(name: string, output?: string): string
```

`toolLabel`: V1 shows `name` only; if `output` is ≤80 chars use first line as hint.

## Streaming Flow

1. User sends → push user message
2. Ensure trailing assistant message exists: `{ role: "assistant", content: "", toolRuns: [] }`
3. `tool_start` → mutate `toolRuns` on that message (reactive upsert)
4. `message` chunk → append to `content` only
5. `tool_end` → update matching run status/output
6. Remove generic "Running step…" / "Thinking…" when `toolRuns` has running items (optional: keep if no tools yet)

## Non-Goals

- Parsing tool input args from SSE (not available in `ToolEvent` today)
- Sidebar activity panel
- Free chat tool display
- Backend SSE shape changes

## Testing

- `useToolRuns.test.ts`: start, end, duplicate callId, error status
- `ToolActivityList.test.ts`: renders running/done/error, expand toggle
- Existing `ChatMessage.test.ts` still passes
