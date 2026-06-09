# Wiki Flow (`flow_id: wiki`) — Design Spec

**Status:** Draft — awaiting review  
**Date:** 2026-06-02  
**Depends on:** [Multi-Flow Agent Platform](./2026-06-02-multi-flow-agent-platform-design.md)

## 1. Purpose

Register `flow_id: wiki` for external Wiki / personal-knowledge apps that keep a **large local Markdown folder**. The platform provides **AI RAG Q&A only** over synced documents. No web search.

## 2. Core Rule: RAG Is Optional by Request

| `document_ids` in request | Behavior |
|---------------------------|----------|
| **Present, non-empty** | Run RAG retrieval scoped to those ids, inject context, return answer with `citations` when hits exist |
| **Omitted, null, or `[]`** | **Do not run RAG** — graph skips retrieve; `chat` answers from conversation context only (general chat) |

This matches the Wiki app pattern: user opens a scoped set of notes → pass ids; free-form chat without a corpus → omit ids.

## 3. Graph Topology

Fixed linear flow (no supervisor guessing):

```text
prepare → [rag if document_ids] → chat → END
```

Implementation options (equivalent behavior):

- **A.** Dedicated `wiki` builder: conditional edge after `prepare` — `document_ids` non-empty → `rag`, else → `chat`.
- **B.** Reuse `linear-rag` routing in `route_after_prepare` / rag node no-op when no ids (already partially true in `rag_node`).

**Requirement:** When `document_ids` is absent or empty, **no** `similarity_search` / embedding call for retrieval (skip `query_embedding` use for RAG).

## 4. API Contract

```json
POST /v1/chat
{
  "flow_id": "wiki",
  "thread_id": "wiki-session-1",
  "message": "解释架构笔记里的模块划分",
  "document_ids": ["uuid-1", "uuid-2"],
  "query_embedding": [0.01, ...]
}
```

Without RAG:

```json
{
  "flow_id": "wiki",
  "thread_id": "wiki-session-1",
  "message": "你好，今天想整理笔记"
}
```

- `query_embedding` is only needed when `document_ids` is non-empty (client-side vector search path).
- `skill_names` follows platform-wide priority (request overrides flow defaults).

## 5. External App Responsibilities

1. Scan / watch local MD folder.
2. Incremental sync via `POST /v1/documents` + `POST /v1/documents/{id}/chunks` (or server upload).
3. On scoped Q&A: pass relevant `document_ids` (whole wiki or current file).
4. On general chat: omit `document_ids`.

## 6. FlowSpec Registration

```python
FlowSpec(
    flow_id="wiki",
    title="Wiki RAG",
    description="Markdown wiki Q&A; RAG only when document_ids provided.",
    builder=wiki.build,
    default_skill_names=[],
)
```

Distinct from `knowledge-rag` (supervisor, may route rag/code/chat) and `linear-rag` (always attempts prepare→rag path). `wiki` explicitly **skips RAG without document_ids**.

## 7. Non-Goals

- Web search / live internet.
- Platform writing MD back to client filesystem.
- Automatic sync of local folder (client-only).
- Mandatory `document_ids` (empty means no RAG, not an error).

## 8. Acceptance Criteria

- [ ] `wiki` appears in `GET /v1/flows`.
- [ ] Chat with `flow_id: wiki` + `document_ids: [...]` runs RAG and may return `citations`.
- [ ] Chat with `flow_id: wiki` without `document_ids` does **not** call vector search / rag retrieve.
- [ ] Tests cover both paths.
- [ ] README or integration doc notes the `document_ids` rule for Wiki apps.

## 9. Relation to `knowledge-rag`

| | `knowledge-rag` | `wiki` |
|---|-----------------|--------|
| Graph | Supervisor (v1) | Linear, conditional RAG |
| RAG without ids | Planner may still route | **Never** |
| Use case | General knowledge assistant | Large local MD wiki |

Both can coexist; Wiki app should call `wiki` only.
