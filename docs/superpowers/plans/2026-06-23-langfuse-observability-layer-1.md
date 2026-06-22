# Langfuse Observability — Layer 1: SSE Event Enrichment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich chat SSE stream with trace ID, token usage, and tool call lifecycle events; frontend receives, types, and minimally displays them.

**Architecture:** Backend `_stream_tokens` captures `on_tool_start`/`on_tool_end` from LangGraph `astream_events` v2 and yields structured SSE events. `event_stream` wraps with proper SSE `event:` lines (`trace`, `tool_start`, `tool_end`, `usage`). Frontend `parseSseStream` (shared-ui) already parses `tool_start`/`tool_end` — we add `trace`/`usage`. `useChat` exposes all event types; `index.vue` renders tool calls via existing `ToolActivityList` component from shared-ui.

**Tech Stack:** Python 3.11+ (FastAPI, LangGraph astream_events v2), TypeScript (Vue 3, Nuxt 3), existing shared-ui package (submodule)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/app/api/routes/chat.py` | Modify | Enrich `_stream_tokens` with tool/usage/trace events; restructure `event_stream` |
| `packages/shared-ui/src/parseSseStream.ts` | Modify | Add `trace` and `usage` event types to `SseEvent` union |
| `packages/shared-ui/src/types/chat.ts` | Modify | Add `TraceEvent`, `UsageEvent` types |
| `fe/types/index.ts` | Modify | Re-export or define trace/usage/tool event types for fe/ consumers |
| `fe/composables/useChat.ts` | Modify | Expose all SSE event types (not just message content) |
| `fe/pages/index.vue` | Modify | Render trace link + tool activity list |
| `backend/tests/test_chat_sse_events.py` | Create | Test new SSE event types from chat endpoint |

---

### Task 1: Backend — yield tool_call and usage events from `_stream_tokens`

**Files:**
- Modify: `backend/app/api/routes/chat.py:78-92`

- [ ] **Step 1: Rewrite `_stream_tokens` to capture tool events and LLM usage**

Replace the current `_stream_tokens` (lines 78-92) with:

```python
import time as _time

async def _stream_tokens(graph, state_input, config):
    """Yield structured SSE events from LangGraph astream_events v2."""
    citations: list[str] | None = None
    total_input_tokens = 0
    total_output_tokens = 0
    model_name = ""

    async for event in graph.astream_events(state_input, config, version="v2"):
        kind = event["event"]

        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                yield {"event": "message", "data": {"content": chunk.content}}

        elif kind == "on_chat_model_end":
            output = event["data"].get("output", {})
            usage = getattr(output, "usage_metadata", None) or {}
            input_tokens = usage.get("input_tokens", 0)
            output_tokens = usage.get("output_tokens", 0)
            if input_tokens or output_tokens:
                total_input_tokens += input_tokens
                total_output_tokens += output_tokens
            model_name = (
                getattr(output, "response_metadata", {}).get("model_name", "")
                or event.get("metadata", {}).get("ls_model_name", "")
            )

        elif kind == "on_tool_start":
            tool_name = event.get("name", "unknown")
            tool_input = event["data"].get("input", {})
            call_id = event.get("run_id", "")
            yield {
                "event": "tool_start",
                "data": {
                    "call_id": call_id,
                    "name": tool_name,
                    "input": _safe_serialize(tool_input),
                },
            }

        elif kind == "on_tool_end":
            tool_name = event.get("name", "unknown")
            tool_output = event["data"].get("output", "")
            call_id = event.get("run_id", "")
            yield {
                "event": "tool_end",
                "data": {
                    "call_id": call_id,
                    "name": tool_name,
                    "output": _safe_serialize(tool_output),
                },
            }

        elif kind == "on_chain_end" and event["name"] == "LangGraph":
            output = event["data"].get("output", {})
            if isinstance(output, dict):
                citations = output.get("citations")

    if citations:
        yield {"event": "message", "data": {"citations": citations}}
    if total_input_tokens or total_output_tokens:
        yield {
            "event": "usage",
            "data": {
                "input_tokens": total_input_tokens,
                "output_tokens": total_output_tokens,
                "model": model_name,
            },
        }


def _safe_serialize(obj):
    """Coerce tool input/output to a JSON-safe dict or string."""
    if obj is None:
        return None
    try:
        if isinstance(obj, (dict, list)):
            return obj
        s = str(obj)
        if len(s) > 4000:
            s = s[:4000] + "...[truncated]"
        return s
    except Exception:
        return "[unserializable]"
```

- [ ] **Step 2: Run existing backend tests to catch regressions**

```bash
cd backend && .venv/bin/python -m pytest -v --tb=short
```

Expected: existing tests pass; `_stream_tokens` signature unchanged so no breakage.

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/routes/chat.py
git commit -m "feat: yield tool_call and usage events in chat SSE stream"
```

---

### Task 2: Backend — expose trace event in `event_stream`

**Files:**
- Modify: `backend/app/api/routes/chat.py:148-171`

- [ ] **Step 1: Refactor `event_stream` to emit trace + structured event types**

Replace the current `event_stream` inner function (lines 148-170) with:

```python
    async def event_stream():
        from app.config import get_settings as _get_settings

        client = get_langfuse_client()
        trace_id = ""
        if client:
            trace_id = client.create_trace_id()

        # Emit trace event first so frontend has the trace ID immediately
        if trace_id:
            yield {
                "event": "trace",
                "data": json.dumps({
                    "trace_id": trace_id,
                    "langfuse_url": _langfuse_url(trace_id),
                }),
            }

        if client:
            trace_name = f"chat:{req.flow_id}:{req.thread_id}"
            with client.start_as_current_observation(
                name=trace_name,
                trace_id=trace_id,
            ) as span:
                full_content = ""
                async for chunk in _stream_tokens(graph, state_input, config):
                    evt = chunk.get("event", "message")
                    data = chunk.get("data", chunk)
                    if isinstance(data, dict) and "content" in data:
                        full_content += data.get("content", "")
                    elif isinstance(data, dict) and "citations" in data:
                        pass
                    yield {"event": evt, "data": json.dumps(data)}
                span.update(output=full_content)
        else:
            async for chunk in _stream_tokens(graph, state_input, config):
                evt = chunk.get("event", "message")
                data = chunk.get("data", chunk)
                yield {"event": evt, "data": json.dumps(data)}

        yield {"event": "done", "data": "{}"}


def _langfuse_url(trace_id: str) -> str:
    settings = get_settings()
    host = (settings.langfuse_host or "https://cloud.langfuse.com").rstrip("/")
    return f"{host}/trace/{trace_id}"
```

- [ ] **Step 2: Run backend tests**

```bash
cd backend && .venv/bin/python -m pytest -v --tb=short
```

- [ ] **Step 3: Commit**

```bash
git add backend/app/api/routes/chat.py
git commit -m "feat: emit trace event with langfuse URL in chat SSE stream"
```

---

### Task 3: shared-ui — add `trace` and `usage` event types

**Files:**
- Modify: `packages/shared-ui/src/types/chat.ts`
- Modify: `packages/shared-ui/src/parseSseStream.ts`

- [ ] **Step 1: Add new types to shared-ui types**

Append to `packages/shared-ui/src/types/chat.ts`:

```typescript
export interface TraceEvent {
  trace_id: string;
  langfuse_url: string;
}

export interface UsageEvent {
  input_tokens: number;
  output_tokens: number;
  model: string;
}
```

Also update the existing `ToolEvent` interface (line 24-29) to add `input`:

```typescript
export interface ToolEvent {
  call_id?: string;
  name?: string;
  ok?: boolean;
  input?: unknown;
  output?: string;
}
```

- [ ] **Step 2: Add `trace` and `usage` to `SseEvent` union**

In `packages/shared-ui/src/parseSseStream.ts`, update the `SseEvent` type (lines 3-8):

```typescript
import type { ChatResponseChunk, ToolEvent, TraceEvent, UsageEvent } from "../types/chat";

export type SseEvent =
  | { type: "message"; chunk: ChatResponseChunk }
  | { type: "tool_start"; event: ToolEvent }
  | { type: "tool_end"; event: ToolEvent }
  | { type: "trace"; event: TraceEvent }
  | { type: "usage"; event: UsageEvent }
  | { type: "plan_ready"; content: string }
  | { type: "done" };
```

And in the parse loop, add handlers after the existing `tool_end` block (after line 39):

```typescript
        } else if (currentEvent === "trace") {
          yield { type: "trace", event: data as TraceEvent };
        } else if (currentEvent === "usage") {
          yield { type: "usage", event: data as UsageEvent };
        } else {
```

- [ ] **Step 3: Run shared-ui tests**

```bash
cd packages/shared-ui && pnpm test
```

Expected: existing 22 tests pass; types compile.

- [ ] **Step 4: Commit in submodule**

```bash
cd packages/shared-ui
git add src/types/chat.ts src/parseSseStream.ts
git commit -m "feat: add trace and usage SSE event types"
```

---

### Task 4: fe/ — expose full SSE events from `useChat` composable

**Files:**
- Modify: `fe/types/index.ts`
- Modify: `fe/composables/useChat.ts`

- [ ] **Step 1: Add frontend event types**

Append to `fe/types/index.ts`:

```typescript
export interface TraceEvent {
  trace_id: string;
  langfuse_url: string;
}

export interface UsageEvent {
  input_tokens: number;
  output_tokens: number;
  model: string;
}

export interface ToolCallEvent {
  call_id: string;
  name: string;
  input?: unknown;
  output?: unknown;
}

export type ChatStreamEvent =
  | { type: "message"; content: string; citations?: string[] }
  | { type: "trace"; event: TraceEvent }
  | { type: "usage"; event: UsageEvent }
  | { type: "tool_start"; event: ToolCallEvent }
  | { type: "tool_end"; event: ToolCallEvent }
  | { type: "done" };
```

- [ ] **Step 2: Rewrite `useChat` to yield structured `ChatStreamEvent`**

Replace `fe/composables/useChat.ts` with:

```typescript
import { parseSseStream } from "@agent-flow/shared-ui";
import type { ChatStreamEvent } from "~/types";
import { useApiFetch } from "~/composables/useApiFetch";

export function useChat() {
  const config = useRuntimeConfig();
  const { apiFetch } = useApiFetch();

  async function* streamChat(
    threadId: string,
    message: string,
    options?: {
      flowId?: string;
      skillNames?: string[];
      documentIds?: string[];
      datasetIds?: string[];
    },
  ): AsyncGenerator<ChatStreamEvent> {
    const body: Record<string, unknown> = {
      flow_id: options?.flowId ?? "default",
      thread_id: threadId,
      message,
    };
    if (options?.skillNames?.length) body.skill_names = options.skillNames;
    if (options?.documentIds?.length) body.document_ids = options.documentIds;
    if (options?.datasetIds?.length) body.dataset_ids = options.datasetIds;

    const res = await apiFetch(`${config.public.apiBase}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed: ${res.status}`);
    }

    for await (const event of parseSseStream(res.body)) {
      switch (event.type) {
        case "message":
          yield {
            type: "message",
            content: event.chunk.content ?? "",
            citations: event.chunk.citations,
          };
          break;
        case "trace":
          yield { type: "trace", event: event.event };
          break;
        case "usage":
          yield { type: "usage", event: event.event };
          break;
        case "tool_start":
          yield {
            type: "tool_start",
            event: {
              call_id: event.event.call_id ?? "",
              name: event.event.name ?? "unknown",
              input: event.event.input,
            },
          };
          break;
        case "tool_end":
          yield {
            type: "tool_end",
            event: {
              call_id: event.event.call_id ?? "",
              name: event.event.name ?? "unknown",
              output: event.event.output,
            },
          };
          break;
        case "done":
          yield { type: "done" };
          break;
      }
    }
  }

  return { streamChat };
}
```

- [ ] **Step 3: Run fe type check**

```bash
cd fe && npx vue-tsc --noEmit 2>&1 | head -20
```

Fix any type errors.

- [ ] **Step 4: Commit**

```bash
git add fe/types/index.ts fe/composables/useChat.ts
git commit -m "feat: expose trace, usage, and tool events from useChat composable"
```

---

### Task 5: fe/ — minimal UI integration in chat page

**Files:**
- Modify: `fe/pages/index.vue`

- [ ] **Step 1: Add reactive state for trace URL and tool runs**

Replace the `<script setup>` section's `onSend` function and add reactive state. In `fe/pages/index.vue`, modify the script block:

```typescript
// Add new reactive state (alongside existing refs):
const traceUrl = ref<string>("");
const toolRuns = ref<Array<{ callId: string; name: string; status: string; output?: string }>>([]);
const tokenUsage = ref<{ input: number; output: number; model: string } | null>(null);

// Replace the onSend function:
async function onSend(text: string) {
  if (!activeThreadId.value) await newChat();
  const threadId = activeThreadId.value!;
  addUserMessage(text);
  loading.value = true;
  traceUrl.value = "";
  toolRuns.value = [];
  tokenUsage.value = null;

  try {
    const gen = streamChat(threadId, text, {
      flowId: flowId.value,
      skillNames: selectedSkillNames.value.length
        ? selectedSkillNames.value
        : undefined,
      datasetIds: selectedDatasetIds.value.length
        ? selectedDatasetIds.value
        : undefined,
    });
    for await (const event of gen) {
      switch (event.type) {
        case "message":
          addAssistantChunk(event.content, event.citations);
          break;
        case "trace":
          traceUrl.value = event.event.langfuse_url;
          break;
        case "tool_start":
          toolRuns.value.push({
            callId: event.event.call_id,
            name: event.event.name,
            status: "running",
          });
          break;
        case "tool_end": {
          const run = toolRuns.value.find(r => r.callId === event.event.call_id);
          if (run) {
            run.status = "done";
            run.output = typeof event.event.output === "string"
              ? event.event.output
              : JSON.stringify(event.event.output);
          }
          break;
        }
        case "usage":
          tokenUsage.value = {
            input: event.event.input_tokens,
            output: event.event.output_tokens,
            model: event.event.model,
          };
          break;
        case "done":
          break;
      }
    }
    const lastMsg = messages.value[messages.value.length - 1];
    if (lastMsg?.role === "user") {
      updateTitle(threadId, text);
    }
  } catch (e) {
    addAssistantChunk(`Error: ${(e as Error).message}`);
  } finally {
    loading.value = false;
  }
}
```

- [ ] **Step 2: Add UI elements for trace link and tool activity**

Add below the "Thinking..." indicator (line 64-65) and above `ChatInput` (line 74):

```html
<!-- Trace link -->
<div v-if="traceUrl" class="px-6 py-1 text-xs text-blue-500">
  <a :href="traceUrl" target="_blank" rel="noopener">Open trace in Langfuse →</a>
</div>

<!-- Tool runs -->
<div v-if="toolRuns.length" class="px-6 py-2 space-y-1">
  <div
    v-for="run in toolRuns"
    :key="run.callId"
    class="text-xs text-gray-500 flex items-center gap-2"
  >
    <span :class="run.status === 'running' ? 'text-yellow-500' : 'text-green-500'">●</span>
    <span class="font-medium">{{ run.name }}</span>
    <span v-if="run.status === 'running'">running...</span>
    <span v-else-if="run.output" class="truncate max-w-xs">{{ run.output.slice(0, 200) }}</span>
  </div>
</div>

<!-- Token usage -->
<div v-if="tokenUsage" class="px-6 py-1 text-xs text-gray-400">
  {{ tokenUsage.input }} in / {{ tokenUsage.output }} out · {{ tokenUsage.model }}
</div>
```

- [ ] **Step 3: Manual verification**

Start the backend and fe:
```bash
# Terminal 1
cd backend && .venv/bin/uvicorn app.main:app --reload

# Terminal 2
cd fe && pnpm dev
```

Send a chat message. Expected:
- Trace link appears at top of messages
- Tool calls appear as inline rows with status indicator
- Token usage appears at end of conversation

- [ ] **Step 4: Commit**

```bash
git add fe/pages/index.vue
git commit -m "feat: display langfuse trace link, tool runs, and token usage in chat UI"
```

---

### Task 6: Backend tests for new SSE events

**Files:**
- Create: `backend/tests/test_chat_sse_events.py`

- [ ] **Step 1: Write test for SSE event types**

```python
import json
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.mark.asyncio
async def test_sse_stream_yields_trace_event():
    """When langfuse is enabled, first SSE event should be a trace event."""
    with patch("app.api.routes.chat.get_langfuse_client") as mock_lf:
        mock_client = AsyncMock()
        mock_client.create_trace_id.return_value = "test-trace-123"
        mock_lf.return_value = mock_client

        # Minimal mock for graph astream_events — return one message then end
        async def fake_astream(*args, **kwargs):
            yield {
                "event": "on_chat_model_stream",
                "data": {"chunk": type("Chunk", (), {"content": "hello"})()},
            }
            yield {
                "event": "on_chain_end",
                "name": "LangGraph",
                "data": {"output": {}},
            }

        with patch("app.api.routes.chat._resolve_graph") as mock_graph:
            mock_graph.return_value = (AsyncMock(), type("Spec", (), {"default_skill_names": []})())
            mock_graph.return_value[0].astream_events = fake_astream

            response = client.post(
                "/v1/chat",
                json={"thread_id": "t1", "message": "hi"},
                headers={"Authorization": "Bearer test"},
            )

    assert response.status_code == 200
    body = response.text

    # First non-empty SSE event should be trace
    events = []
    for line in body.split("\n"):
        if line.startswith("event: "):
            events.append(("event_type", line[7:].strip()))
        elif line.startswith("data: "):
            events.append(("data", line[6:].strip()))

    event_types = [v for k, v in events if k == "event_type"]
    assert "trace" in event_types, f"Expected trace event, got: {event_types}"

    # Verify trace data
    trace_data_lines = [v for k, v in events if k == "data"]
    for d in trace_data_lines:
        try:
            parsed = json.loads(d)
            if "trace_id" in parsed:
                assert parsed["trace_id"] == "test-trace-123"
                break
        except json.JSONDecodeError:
            continue


@pytest.mark.asyncio
async def test_sse_stream_yields_tool_events():
    """When graph invokes a tool, tool_start and tool_end events are yielded."""
    async def fake_astream(*args, **kwargs):
        yield {
            "event": "on_tool_start",
            "name": "web_search",
            "run_id": "run-1",
            "data": {"input": {"query": "test"}},
        }
        yield {
            "event": "on_tool_end",
            "name": "web_search",
            "run_id": "run-1",
            "data": {"output": "result from search"},
        }
        yield {
            "event": "on_chain_end",
            "name": "LangGraph",
            "data": {"output": {}},
        }

    with patch("app.api.routes.chat._resolve_graph") as mock_graph:
        mock_graph.return_value = (AsyncMock(), type("Spec", (), {"default_skill_names": []})())
        mock_graph.return_value[0].astream_events = fake_astream

        client = TestClient(app)
        response = client.post(
            "/v1/chat",
            json={"thread_id": "t1", "message": "search test"},
            headers={"Authorization": "Bearer test"},
        )

    assert response.status_code == 200
    body = response.text
    event_types = []
    for line in body.split("\n"):
        if line.startswith("event: "):
            event_types.append(line[7:].strip())

    assert "tool_start" in event_types, f"Expected tool_start event, got: {event_types}"
    assert "tool_end" in event_types, f"Expected tool_end event, got: {event_types}"
```

- [ ] **Step 2: Run the new tests**

```bash
cd backend && .venv/bin/python -m pytest tests/test_chat_sse_events.py -v --tb=short
```

Expected: both tests pass.

- [ ] **Step 3: Commit**

```bash
git add backend/tests/test_chat_sse_events.py
git commit -m "test: SSE stream yields trace, tool_start, and tool_end events"
```

---

## Verification

| Check | Command |
|---|---|
| Backend tests pass | `cd backend && .venv/bin/python -m pytest -v --tb=short` |
| shared-ui tests pass | `cd packages/shared-ui && pnpm test` |
| FE type check | `cd fe && npx vue-tsc --noEmit` |
| E2E: trace link visible | Start backend + fe, send chat message, verify Langfuse link renders |
| E2E: tool calls visible | Use a flow that triggers tools (e.g., `finance-agent`), verify tool rows |
