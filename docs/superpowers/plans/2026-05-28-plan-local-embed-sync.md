# Local Embedding + Vector Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Client (fe / Electron) runs Ollama embedding locally, uploads pre-computed chunk vectors to the server; server only stores and searches pgvector—no cloud embedding API and no Ollama required on the server for RAG ingest/search.

**Architecture:** Add `POST /v1/documents` (metadata-only) + `POST /v1/documents/{id}/chunks` (batch vectors). `DocumentStore.add_chunks_precomputed()` writes vectors without calling `embed_*`. Chat accepts optional `query_embedding` from the client; `rag_node` calls `similarity_search_by_vector()` when present. fe gets `useOllamaEmbed` + `useDocumentSync` (chunk → embed → sync). Existing server-side `ingest_file` path remains for backward compatibility.

**Tech Stack:** Python 3.11, FastAPI, pgvector, pytest; Nuxt 3 + TypeScript; Ollama `POST /api/embeddings` (`nomic-embed-text`, 768-dim); optional Electron preload later

**Depends on:** Plan 03 (RAG store) | **Related:** [2026-05-28-plan-ollama-local.md](./2026-05-28-plan-ollama-local.md) (server-side Ollama—orthogonal; pick one RAG ingest path per deployment)

---

## Prerequisites

**Ollama on the client machine:**

```bash
ollama pull nomic-embed-text
# Browser access from Nuxt dev server:
export OLLAMA_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
ollama serve
```

**Backend tests green:**

```bash
cd backend && source .venv/bin/activate && pytest -q
```

**Dimension lock:** All vectors use **768** dimensions (`nomic-embed-text`). Fresh DB if migrating from `vector(1536)`:

```bash
docker compose down -v && docker compose up -d db
```

**Working directories:** `backend/` for API; `fe/` for client.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/migrations/002_client_embeddings.sql` | Create | `embedding_model`, `embedding_dimensions` on `documents` |
| `backend/app/config.py` | Modify | `client_embedding_mode`, `expected_embedding_dimensions` |
| `backend/app/rag/db.py` | Modify | `vector({dim})` from settings |
| `backend/app/rag/store.py` | Modify | `add_chunks_precomputed`, `similarity_search_by_vector` |
| `backend/app/api/routes/documents.py` | Modify | metadata create + chunks batch |
| `backend/app/agent/state.py` | Modify | `query_embedding: NotRequired[list[float]]` |
| `backend/app/api/routes/chat.py` | Modify | `query_embedding` on `ChatRequest` |
| `backend/app/agent/nodes/rag.py` | Modify | prefer `query_embedding` over server embed |
| `backend/tests/test_chunks_api.py` | Create | batch upload + search by vector |
| `backend/tests/test_rag_node.py` | Modify | query_embedding path |
| `fe/types/index.ts` | Modify | sync DTOs |
| `fe/composables/useOllamaEmbed.ts` | Create | call Ollama embeddings API |
| `fe/composables/useChunkText.ts` | Create | 800/100 text splitter (TXT/MD) |
| `fe/composables/useDocumentSync.ts` | Create | chunk → embed → sync pipeline |
| `fe/composables/useChat.ts` | Modify | `query_embedding` on chat; `syncDocument` |
| `fe/components/DocumentUpload.vue` | Modify | use local sync flow |
| `fe/nuxt.config.ts` | Modify | `ollamaBaseUrl` public config |
| `fe/tests/useOllamaEmbed.test.ts` | Create | mock fetch |
| `AGENTS.md` | Modify | document client-embed architecture |

**Out of scope (YAGNI):**
- PDF parsing in browser (V1: `.txt` / `.md` only; PDF keeps server `ingest_file` fallback)
- Electron `electron/` scaffold (browser + Ollama suffices for V1; Electron reuses same composables)
- Incremental/resumable chunk upload
- Server-side Ollama (`plan-ollama-local` covers that path)

---

### Task 1: Schema and config

**Files:**
- Create: `backend/migrations/002_client_embeddings.sql`
- Modify: `backend/app/config.py`
- Modify: `backend/app/rag/db.py`
- Modify: `backend/migrations/001_documents.sql` (new installs: `vector(768)`)
- Test: `backend/tests/test_config.py`

- [ ] **Step 1: Write failing config test**

Append to `backend/tests/test_config.py`:

```python
def test_settings_client_embedding_defaults():
    s = Settings(
        _env_file=None,
        openai_api_key=None,
        anthropic_api_key=None,
    )
    assert s.expected_embedding_dimensions == 768
    assert s.client_embedding_mode is False
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_config.py::test_settings_client_embedding_defaults -v
```

Expected: FAIL

- [ ] **Step 3: Add config fields**

In `backend/app/config.py`:

```python
    expected_embedding_dimensions: int = 768
    client_embedding_mode: bool = False
```

`CLIENT_EMBEDDING_MODE=true` means server skips server-side embed on ingest (chunks API only).

- [ ] **Step 4: Create migration `002_client_embeddings.sql`**

```sql
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS embedding_model TEXT,
  ADD COLUMN IF NOT EXISTS embedding_dimensions INT;

-- New installs: ensure 768-dim column (run only on fresh DB; see README for 1536→768 reset)
-- For greenfield, 001_documents.sql should use vector(768)
```

- [ ] **Step 5: Dynamic dimension in `db.py`**

Use `settings.expected_embedding_dimensions` in `_tables_sql(dim)` (same pattern as ollama-local plan). Update `001_documents.sql` line 14 to `embedding vector(768)`.

- [ ] **Step 6: Run config tests**

Run:

```bash
pytest tests/test_config.py -v
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend/app/config.py backend/app/rag/db.py backend/migrations backend/tests/test_config.py
git commit -m "feat: schema and config for client-side embeddings"
```

---

### Task 2: DocumentStore precomputed vectors

**Files:**
- Modify: `backend/app/rag/store.py`
- Test: `backend/tests/test_store_precomputed.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_store_precomputed.py`:

```python
import pytest

from app.rag.store import DocumentStore


class _FakeEmbeddings:
    def embed_documents(self, texts):
        return [[0.1] * 768 for _ in texts]

    def embed_query(self, text):
        return [0.1] * 768


@pytest.fixture
def store():
    return DocumentStore(embeddings=_FakeEmbeddings())


@pytest.mark.asyncio
async def test_add_chunks_precomputed_validates_dim(store):
    with pytest.raises(ValueError, match="embedding dimension"):
        await store.add_chunks_precomputed(
            "00000000-0000-0000-0000-000000000001",
            [{"chunk_index": 0, "content": "hi", "embedding": [0.1] * 100}],
        )


@pytest.mark.asyncio
async def test_similarity_search_by_vector_requires_db(store):
    import asyncpg

    vec = [0.1] * 768
    try:
        hits = await store.similarity_search_by_vector(
            vec, document_ids=["00000000-0000-0000-0000-000000000001"], k=3
        )
    except (asyncpg.exceptions.PostgresError, OSError, ConnectionError):
        pytest.skip("Postgres not available")
    assert isinstance(hits, list)
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pytest tests/test_store_precomputed.py -v
```

Expected: FAIL `add_chunks_precomputed` not defined

- [ ] **Step 3: Implement store methods**

Add to `backend/app/rag/store.py`:

```python
from app.config import get_settings

# in DocumentStore:

    async def create_document_meta(
        self,
        filename: str,
        embedding_model: str,
        embedding_dimensions: int,
    ) -> str:
        conn = await asyncpg.connect(self._dsn)
        try:
            row = await conn.fetchrow(
                "INSERT INTO documents (filename, embedding_model, embedding_dimensions) "
                "VALUES ($1, $2, $3) RETURNING id",
                filename,
                embedding_model,
                embedding_dimensions,
            )
            return str(row["id"])
        finally:
            await conn.close()

    async def add_chunks_precomputed(
        self,
        doc_id: str,
        chunks: list[dict],
    ) -> None:
        expected = get_settings().expected_embedding_dimensions
        conn = await asyncpg.connect(self._dsn)
        try:
            async with conn.transaction():
                for row in chunks:
                    emb = row["embedding"]
                    if len(emb) != expected:
                        raise ValueError(
                            f"embedding dimension {len(emb)} != expected {expected}"
                        )
                    await conn.execute(
                        "INSERT INTO document_chunks "
                        "(document_id, chunk_index, content, embedding) "
                        "VALUES ($1::uuid, $2, $3, $4)",
                        doc_id,
                        row["chunk_index"],
                        row["content"],
                        emb,
                    )
        finally:
            await conn.close()

    async def similarity_search_by_vector(
        self,
        query_vec: list[float],
        document_ids: list[str] | None = None,
        k: int = 5,
    ) -> list[ChunkHit]:
        expected = get_settings().expected_embedding_dimensions
        if len(query_vec) != expected:
            raise ValueError(
                f"query embedding dimension {len(query_vec)} != expected {expected}"
            )
        conn = await asyncpg.connect(self._dsn)
        try:
            if document_ids:
                rows = await conn.fetch(
                    "SELECT id, document_id, content, "
                    "1 - (embedding <=> $1::vector) AS score "
                    "FROM document_chunks "
                    "WHERE document_id = ANY($2::uuid[]) "
                    "ORDER BY embedding <=> $1::vector "
                    "LIMIT $3",
                    query_vec,
                    document_ids,
                    k,
                )
            else:
                rows = await conn.fetch(
                    "SELECT id, document_id, content, "
                    "1 - (embedding <=> $1::vector) AS score "
                    "FROM document_chunks "
                    "ORDER BY embedding <=> $1::vector "
                    "LIMIT $2",
                    query_vec,
                    k,
                )
            return [
                ChunkHit(
                    chunk_id=str(r["id"]),
                    document_id=str(r["document_id"]),
                    content=r["content"],
                    score=float(r["score"]),
                )
                for r in rows
            ]
        finally:
            await conn.close()
```

Update `create_tables` / migration so `documents` has `embedding_model`, `embedding_dimensions` columns.

- [ ] **Step 4: Run tests**

Run:

```bash
pytest tests/test_store_precomputed.py -v
```

Expected: PASS (integration test may skip)

- [ ] **Step 5: Commit**

```bash
git add backend/app/rag/store.py backend/tests/test_store_precomputed.py
git commit -m "feat: store precomputed chunk vectors and vector search"
```

---

### Task 3: Chunks sync API

**Files:**
- Modify: `backend/app/api/routes/documents.py`
- Create: `backend/tests/test_chunks_api.py`

- [ ] **Step 1: Write failing API test**

Create `backend/tests/test_chunks_api.py`:

```python
from unittest.mock import AsyncMock, MagicMock

import pytest


@pytest.fixture
def client_with_store(client):
    store = MagicMock()
    store.create_document_meta = AsyncMock(return_value="doc-uuid-1")
    store.add_chunks_precomputed = AsyncMock()
    client.app.state.store = store
    return client, store


def test_create_document_meta(client_with_store):
    client, store = client_with_store
    resp = client.post(
        "/v1/documents",
        json={
            "filename": "notes.md",
            "embedding_model": "nomic-embed-text",
            "embedding_dimensions": 768,
        },
    )
    assert resp.status_code == 200
    assert resp.json()["document_id"] == "doc-uuid-1"
    store.create_document_meta.assert_awaited_once()


def test_upload_chunks_batch(client_with_store):
    client, store = client_with_store
    payload = {
        "chunks": [
            {
                "chunk_index": 0,
                "content": "hello world",
                "embedding": [0.01] * 768,
            }
        ]
    }
    resp = client.post("/v1/documents/doc-uuid-1/chunks", json=payload)
    assert resp.status_code == 200
    assert resp.json() == {"ok": True, "count": 1}
    store.add_chunks_precomputed.assert_awaited_once()
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pytest tests/test_chunks_api.py -v
```

Expected: FAIL (404 or wrong response)

- [ ] **Step 3: Implement routes**

Replace/extend `backend/app/api/routes/documents.py`:

```python
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field


class CreateDocumentBody(BaseModel):
    filename: str
    embedding_model: str = "nomic-embed-text"
    embedding_dimensions: int = 768


class ChunkRow(BaseModel):
    chunk_index: int
    content: str
    embedding: list[float]


class ChunksBody(BaseModel):
    chunks: list[ChunkRow] = Field(min_length=1)


@router.post("/documents")
async def create_document(body: CreateDocumentBody, request: Request):
    store = getattr(request.app.state, "store", None)
    if store is None:
        return JSONResponse(status_code=503, content={"detail": "Document store unavailable"})
    doc_id = await store.create_document_meta(
        body.filename, body.embedding_model, body.embedding_dimensions
    )
    return {"document_id": doc_id}


@router.post("/documents/{document_id}/chunks")
async def upload_chunks(document_id: str, body: ChunksBody, request: Request):
    store = getattr(request.app.state, "store", None)
    if store is None:
        return JSONResponse(status_code=503, content={"detail": "Document store unavailable"})
    await store.add_chunks_precomputed(
        document_id,
        [c.model_dump() for c in body.chunks],
    )
    return {"ok": True, "count": len(body.chunks)}
```

Keep multipart `upload` as **separate** route `POST /v1/documents/upload` (rename existing) for server-side ingest fallback—or gate old route behind `not client_embedding_mode`. Minimal change: add JSON routes above; keep multipart at `POST /v1/documents/upload`:

```python
@router.post("/documents/upload")
async def upload(file: UploadFile, request: Request):
    ...  # existing ingest_file logic
```

Update `fe` later to call new endpoints.

- [ ] **Step 4: Run API tests**

Run:

```bash
pytest tests/test_chunks_api.py tests/test_api_documents.py -v
```

Fix any broken old tests from route rename.

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/routes/documents.py backend/tests/test_chunks_api.py
git commit -m "feat: document metadata and precomputed chunks API"
```

---

### Task 4: Chat with `query_embedding`

**Files:**
- Modify: `backend/app/agent/state.py`
- Modify: `backend/app/api/routes/chat.py`
- Modify: `backend/app/agent/nodes/rag.py`
- Modify: `backend/tests/test_rag_node.py`

- [ ] **Step 1: Write failing rag test**

Append to `backend/tests/test_rag_node.py`:

```python
def test_rag_node_uses_query_embedding(monkeypatch):
    from langchain_core.messages import HumanMessage

    vec = [0.2] * 768

    class _Store:
        async def similarity_search_by_vector(self, query_vec, document_ids=None, k=5):
            assert query_vec == vec
            from app.rag.store import ChunkHit
            return [
                ChunkHit("c1", "d1", "synced chunk", 0.9),
            ]

        async def similarity_search(self, *a, **k):
            raise AssertionError("should not embed on server")

    state = {
        "messages": [HumanMessage(content="summarize")],
        "document_ids": ["d1"],
        "query_embedding": vec,
    }
    config = {"configurable": {"store": _Store()}}
    out = rag_node(state, config)
    assert "<context>" in out["messages"][0].content
    assert "synced chunk" in out["messages"][0].content
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_rag_node.py::test_rag_node_uses_query_embedding -v
```

Expected: FAIL

- [ ] **Step 3: Wire query_embedding through stack**

`backend/app/agent/state.py`:

```python
    query_embedding: NotRequired[list[float]]
```

`backend/app/api/routes/chat.py`:

```python
class ChatRequest(BaseModel):
    thread_id: str
    message: str
    document_ids: list[str] | None = None
    query_embedding: list[float] | None = None

def _build_input(req: ChatRequest):
    state_input: dict = {"messages": [HumanMessage(content=req.message)]}
    if req.document_ids:
        state_input["document_ids"] = req.document_ids
    if req.query_embedding is not None:
        state_input["query_embedding"] = req.query_embedding
    return state_input
```

`backend/app/agent/nodes/rag.py`:

```python
    query_vec = state.get("query_embedding")
    if query_vec is not None:
        hits = asyncio.run(
            store.similarity_search_by_vector(
                query_vec, document_ids=ids, k=5
            )
        )
    else:
        hits = asyncio.run(
            store.similarity_search(last_human.content, document_ids=ids, k=5)
        )
```

- [ ] **Step 4: Run rag + graph tests**

Run:

```bash
pytest tests/test_rag_node.py tests/test_graph.py tests/test_api_chat.py -v
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/agent/state.py backend/app/api/routes/chat.py backend/app/agent/nodes/rag.py backend/tests/test_rag_node.py
git commit -m "feat: RAG search via client query_embedding"
```

---

### Task 5: fe — Ollama embed + document sync

**Files:**
- Create: `fe/composables/useOllamaEmbed.ts`
- Create: `fe/composables/useChunkText.ts`
- Create: `fe/composables/useDocumentSync.ts`
- Modify: `fe/types/index.ts`
- Modify: `fe/nuxt.config.ts`
- Create: `fe/tests/useOllamaEmbed.test.ts`

- [ ] **Step 1: Add types**

In `fe/types/index.ts`:

```typescript
export interface ChunkUpload {
  chunk_index: number;
  content: string;
  embedding: number[];
}

export interface CreateDocumentBody {
  filename: string;
  embedding_model: string;
  embedding_dimensions: number;
}
```

- [ ] **Step 2: Add `ollamaBaseUrl` to nuxt config**

```typescript
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000",
      ollamaBaseUrl: process.env.NUXT_PUBLIC_OLLAMA_BASE_URL || "http://localhost:11434",
      embeddingModel: process.env.NUXT_PUBLIC_EMBEDDING_MODEL || "nomic-embed-text",
      embeddingDimensions: 768,
    },
  },
```

- [ ] **Step 3: Implement `useOllamaEmbed.ts`**

```typescript
export function useOllamaEmbed() {
  const config = useRuntimeConfig();

  async function embedText(text: string): Promise<number[]> {
    const res = await fetch(`${config.public.ollamaBaseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.public.embeddingModel,
        input: text,
      }),
    });
    if (!res.ok) throw new Error(`Ollama embed failed: ${res.status}`);
    const data = (await res.json()) as { embedding: number[] };
    if (data.embedding.length !== config.public.embeddingDimensions) {
      throw new Error(
        `Expected ${config.public.embeddingDimensions} dims, got ${data.embedding.length}`,
      );
    }
    return data.embedding;
  }

  async function embedBatch(texts: string[]): Promise<number[][]> {
    const out: number[][] = [];
    for (const t of texts) {
      out.push(await embedText(t));
    }
    return out;
  }

  return { embedText, embedBatch };
}
```

- [ ] **Step 4: Implement `useChunkText.ts`**

Port 800/100 splitter (mirror `backend/app/rag/chunking.py`):

```typescript
export function splitText(
  text: string,
  chunkSize = 800,
  overlap = 100,
): string[] {
  if (!text.trim()) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start = end - overlap;
  }
  return chunks;
}
```

- [ ] **Step 5: Implement `useDocumentSync.ts`**

```typescript
import type { ChunkUpload, CreateDocumentBody } from "~/types";

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
    const parts = splitText(text);
    if (!parts.length) throw new Error("Empty document");
    const docId = await createDocument({
      filename: file.name,
      embedding_model: String(useRuntimeConfig().public.embeddingModel),
      embedding_dimensions: Number(useRuntimeConfig().public.embeddingDimensions),
    });
    const vectors = await embedBatch(parts);
    const chunks: ChunkUpload[] = parts.map((content, i) => ({
      chunk_index: i,
      content,
      embedding: vectors[i],
    }));
    const BATCH = 20;
    for (let i = 0; i < chunks.length; i += BATCH) {
      await uploadChunks(docId, chunks.slice(i, i + BATCH));
    }
    return docId;
  }

  return { syncTextFile, createDocument, uploadChunks };
}
```

- [ ] **Step 6: Write vitest for embed (mock fetch)**

Create `fe/tests/useOllamaEmbed.test.ts` with mocked `fetch` returning `{ embedding: new Array(768).fill(0.1) }`.

- [ ] **Step 7: Run fe tests**

Run:

```bash
cd fe && yarn test
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add fe/composables/useOllamaEmbed.ts fe/composables/useChunkText.ts fe/composables/useDocumentSync.ts fe/types/index.ts fe/nuxt.config.ts fe/tests/useOllamaEmbed.test.ts
git commit -m "feat(fe): Ollama local embed and document vector sync"
```

---

### Task 6: fe — wire upload + chat query embed

**Files:**
- Modify: `fe/composables/useChat.ts`
- Modify: `fe/components/DocumentUpload.vue`
- Modify: `fe/pages/index.vue` (if needed)

- [ ] **Step 1: Update `useChat.ts`**

```typescript
  async function* streamChat(
    threadId: string,
    message: string,
    documentIds?: string[],
    queryEmbedding?: number[],
  ): AsyncGenerator<ChatResponseChunk> {
    const res = await fetch(`${config.public.apiBase}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: threadId,
        message,
        document_ids: documentIds,
        query_embedding: queryEmbedding,
      }),
    });
    ...
  }
```

Add helper:

```typescript
  async function embedQuery(message: string): Promise<number[]> {
    const { embedText } = useOllamaEmbed();
    return embedText(message);
  }
```

- [ ] **Step 2: Update `DocumentUpload.vue`**

Replace `uploadDocument` with `syncTextFile`; restrict accept to `.txt,.md` for V1:

```typescript
const { syncTextFile } = useDocumentSync();
const { document_id } = await syncTextFile(file);
```

- [ ] **Step 3: Update `pages/index.vue` `onSend`**

Before `streamChat`, if `documentIds.length`:

```typescript
const { embedQuery } = useChat();
const queryEmbedding = documentIds.value.length
  ? await embedQuery(text)
  : undefined;
for await (const chunk of streamChat(
  activeThreadId.value,
  text,
  documentIds.value,
  queryEmbedding,
)) { ... }
```

- [ ] **Step 4: Manual E2E**

```bash
# terminal 1
export OLLAMA_ORIGINS="http://localhost:3000"
ollama serve

# terminal 2
./scripts/dev.sh

# browser: upload .md file, ask question about it
```

Expected: citations in SSE without `OPENAI_API_KEY`.

- [ ] **Step 5: Commit**

```bash
git add fe/composables/useChat.ts fe/components/DocumentUpload.vue fe/pages/index.vue
git commit -m "feat(fe): local embed on upload and chat query sync"
```

---

### Task 7: Docs

**Files:**
- Modify: `AGENTS.md`
- Modify: `backend/README.md`
- Modify: `.env.example`

- [ ] **Step 1: Document architecture in `AGENTS.md`**

Add subsection under Frontend:

```markdown
### Client-side RAG (vector sync)
- Embed: `fe/composables/useOllamaEmbed.ts` → Ollama `nomic-embed-text`
- Sync: `useDocumentSync` → `POST /v1/documents` + `/chunks`
- Chat: client sends `query_embedding`; server never calls embed API when set
```

- [ ] **Step 2: Backend README**

Document JSON API, `CLIENT_EMBEDDING_MODE`, `OLLAMA_ORIGINS`, DB reset for 768 dims.

- [ ] **Step 3: `.env.example`**

```env
CLIENT_EMBEDDING_MODE=true
EXPECTED_EMBEDDING_DIMENSIONS=768
NUXT_PUBLIC_OLLAMA_BASE_URL=http://localhost:11434
NUXT_PUBLIC_EMBEDDING_MODEL=nomic-embed-text
```

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md backend/README.md .env.example
git commit -m "docs: client-side embedding and vector sync"
```

---

## Spec Coverage

| Requirement | Task |
|-------------|------|
| 本地 Ollama embedding | Task 5 `useOllamaEmbed` |
| 向量同步到服务器 | Task 3 chunks API + Task 5 sync |
| 服务端不 embed（可选） | Task 1 `CLIENT_EMBEDDING_MODE` + Task 4 `query_embedding` |
| Schema 768 维 | Task 1 migration |
| 检索溯源 citations | Task 4 rag_node (unchanged output shape) |
| 向后兼容服务端 ingest | Task 3 `POST /v1/documents/upload` |

## Self-Review Notes (applied)

- **vs ollama-local plan:** That plan = backend talks to Ollama; this plan = client talks to Ollama, server stores vectors. Deploy one or the other for RAG ingest.
- **PDF deferred:** V1 client sync is TXT/MD; PDF still uses server upload route.
- **CORS:** Browser must set `OLLAMA_ORIGINS`; documented in prerequisites.
- **Batch size 20:** Avoids huge JSON payloads; tunable constant in `useDocumentSync`.
- **Electron:** Same composables when `electron/` lands; optional preload only for file paths—not required for V1.

## Deferred

- PDF.js client-side extraction
- `query_embedding` compression / quantization
- Auth on `/v1/documents/{id}/chunks`
- Resumable uploads with `upload_id`
