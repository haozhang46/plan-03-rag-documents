# Local Ollama LLM + Embeddings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable fully local development with [Ollama](https://ollama.com) for both chat (`ChatOllama`) and RAG embeddings (`OllamaEmbeddings`), selectable via env—no OpenAI/Anthropic/DeepSeek API keys required on the local profile.

**Architecture:** Add `langchain-ollama` and an `app/llm/embeddings.py` factory mirroring `get_chat_model()`. `DocumentStore` calls `get_embeddings()` instead of hardcoding `OpenAIEmbeddings`. pgvector column dimension becomes configurable (`EMBEDDING_DIMENSIONS=768` for `nomic-embed-text`). Backend talks to `http://localhost:11434`; Electron/fe unchanged (still calls FastAPI). Existing cloud providers remain available when env switches back.

**Tech Stack:** Python 3.11, `langchain-ollama`, Ollama (`nomic-embed-text`, `llama3.2`), pgvector, pytest

**Depends on:** Plan 01 (LLM factory), Plan 03 (RAG store) | **Blocks:** none

---

## Prerequisites

**Install Ollama locally** (one-time):

```bash
# macOS: brew install ollama && ollama serve
ollama pull llama3.2
ollama pull nomic-embed-text
```

Verify:

```bash
curl http://localhost:11434/api/tags
ollama run llama3.2 "hi" --verbose 2>/dev/null | head -1
```

Backend tests green before starting:

```bash
cd backend && source .venv/bin/activate && pytest -q
```

**Working directory for commands below:** `backend/` (venv active).

**Dimension note:** `nomic-embed-text` outputs **768**-dim vectors (not 1536). Local Ollama profile requires `EMBEDDING_DIMENSIONS=768`. If an existing DB was created with `vector(1536)`, reset volume: `docker compose down -v && docker compose up -d db`.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `backend/pyproject.toml` | Modify | Add `langchain-ollama` |
| `backend/app/config.py` | Modify | Ollama URL/models, `embedding_dimensions` |
| `.env.example` | Modify | Ollama-only profile block |
| `backend/app/llm/embeddings.py` | Create | `get_embeddings()` factory |
| `backend/app/llm/factory.py` | Modify | `provider == "ollama"` → `ChatOllama` |
| `backend/app/rag/store.py` | Modify | Use `get_embeddings()` |
| `backend/app/rag/db.py` | Modify | Dynamic `vector({embedding_dimensions})` |
| `backend/migrations/001_documents.sql` | Modify | `vector(768)` default for new installs |
| `backend/tests/test_embeddings_factory.py` | Create | Ollama + mock embedding tests |
| `backend/tests/test_llm_factory.py` | Modify | Ollama chat tests |
| `backend/tests/test_store.py` | Modify | Fake embedder uses `embedding_dimensions` |
| `backend/tests/test_config.py` | Modify | Ollama defaults |
| `backend/README.md` | Modify | Ollama setup section |
| `scripts/dev.sh` | Modify | Optional Ollama reachability warning |

**Out of scope (YAGNI):**
- fe/Electron calling Ollama directly (backend proxies for V1)
- Pre-computed embedding upload API (client sync) — defer separate plan
- Langfuse tagging per Ollama model

---

### Task 1: Dependency and Settings

**Files:**
- Modify: `backend/pyproject.toml`
- Modify: `backend/app/config.py`
- Modify: `.env.example`
- Test: `backend/tests/test_config.py`

- [ ] **Step 1: Add `langchain-ollama`**

In `backend/pyproject.toml` `dependencies`:

```toml
  "langchain-ollama>=0.2.0",
```

Run:

```bash
pip install -e ".[dev]"
```

Expected: installs `langchain-ollama` without error.

- [ ] **Step 2: Write failing config test**

Append to `backend/tests/test_config.py`:

```python
def test_settings_ollama_defaults():
    s = Settings(
        _env_file=None,
        openai_api_key=None,
        anthropic_api_key=None,
    )
    assert s.ollama_base_url == "http://localhost:11434"
    assert s.embedding_dimensions == 768
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```bash
pytest tests/test_config.py::test_settings_ollama_defaults -v
```

Expected: FAIL (`Settings` has no attribute `ollama_base_url`)

- [ ] **Step 4: Add Ollama fields to Settings**

In `backend/app/config.py`, add:

```python
    ollama_base_url: str = "http://localhost:11434"
    ollama_chat_model: str = "llama3.2"
    ollama_embedding_model: str = "nomic-embed-text"
    embedding_dimensions: int = 768
```

Keep existing `embedding_provider` / `embedding_model`; when `embedding_provider=ollama`, `embedding_model` defaults to `nomic-embed-text` via `.env`.

- [ ] **Step 5: Update `.env.example`**

Append:

```env
# --- Local-only Ollama profile (no cloud API keys) ---
# DEFAULT_LLM_PROVIDER=ollama
# DEFAULT_MODEL=llama3.2
# OLLAMA_BASE_URL=http://localhost:11434
# EMBEDDING_PROVIDER=ollama
# EMBEDDING_MODEL=nomic-embed-text
# EMBEDDING_DIMENSIONS=768
```

- [ ] **Step 6: Run config tests**

Run:

```bash
pytest tests/test_config.py -v
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend/pyproject.toml backend/app/config.py backend/tests/test_config.py .env.example
git commit -m "feat: add Ollama settings for local LLM and embeddings"
```

---

### Task 2: Embedding factory

**Files:**
- Create: `backend/app/llm/embeddings.py`
- Test: `backend/tests/test_embeddings_factory.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_embeddings_factory.py`:

```python
import pytest

from app.config import get_settings
from app.llm.embeddings import get_embeddings


class _DimEmbeddings:
    def __init__(self, dim: int):
        self.dim = dim

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[0.0] * self.dim for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        return [0.0] * self.dim


def test_get_embeddings_ollama(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("EMBEDDING_PROVIDER", "ollama")
    monkeypatch.setenv("EMBEDDING_MODEL", "nomic-embed-text")
    monkeypatch.setenv("OLLAMA_BASE_URL", "http://localhost:11434")
    get_settings.cache_clear()

    emb = get_embeddings()
    assert emb.model == "nomic-embed-text"
    assert emb.base_url == "http://localhost:11434"


def test_get_embeddings_mock(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("EMBEDDING_PROVIDER", "mock")
    monkeypatch.setenv("EMBEDDING_DIMENSIONS", "768")
    get_settings.cache_clear()

    emb = get_embeddings()
    vecs = emb.embed_documents(["a", "b"])
    assert len(vecs[0]) == 768


def test_get_embeddings_unknown_provider():
    get_settings.cache_clear()
    with pytest.raises(ValueError, match="Unknown embedding provider"):
        get_embeddings(provider="invalid")
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pytest tests/test_embeddings_factory.py -v
```

Expected: FAIL `ModuleNotFoundError: app.llm.embeddings`

- [ ] **Step 3: Implement `get_embeddings()`**

Create `backend/app/llm/embeddings.py`:

```python
import hashlib
import struct

from langchain_core.embeddings import Embeddings
from langchain_ollama import OllamaEmbeddings
from langchain_openai import OpenAIEmbeddings

from app.config import get_settings


class _MockEmbeddings(Embeddings):
    def __init__(self, dimensions: int = 768):
        self.dimensions = dimensions

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._vec(t) for t in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._vec(text)

    def _vec(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode()).digest()
        floats: list[float] = []
        while len(floats) < self.dimensions:
            for i in range(0, len(digest) - 3, 4):
                n = struct.unpack(">I", digest[i : i + 4])[0]
                floats.append((n % 10000) / 10000.0)
                if len(floats) >= self.dimensions:
                    break
            digest = hashlib.sha256(digest).digest()
        norm = sum(x * x for x in floats) ** 0.5 or 1.0
        return [x / norm for x in floats]


def get_embeddings(provider: str | None = None) -> Embeddings:
    settings = get_settings()
    provider = (provider or settings.embedding_provider).lower()

    if provider == "openai":
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY not set")
        return OpenAIEmbeddings(
            model=settings.embedding_model,
            api_key=settings.openai_api_key,
        )
    if provider == "ollama":
        return OllamaEmbeddings(
            model=settings.embedding_model or settings.ollama_embedding_model,
            base_url=settings.ollama_base_url,
        )
    if provider == "mock":
        return _MockEmbeddings(dimensions=settings.embedding_dimensions)
    raise ValueError(f"Unknown embedding provider: {provider}")
```

- [ ] **Step 4: Run embedding factory tests**

Run:

```bash
pytest tests/test_embeddings_factory.py -v
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add backend/app/llm/embeddings.py backend/tests/test_embeddings_factory.py
git commit -m "feat: embedding factory with Ollama and mock providers"
```

---

### Task 3: Ollama chat provider

**Files:**
- Modify: `backend/app/llm/factory.py`
- Test: `backend/tests/test_llm_factory.py`

- [ ] **Step 1: Write failing Ollama chat test**

Append to `backend/tests/test_llm_factory.py`:

```python
def test_get_chat_model_ollama(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("OLLAMA_BASE_URL", "http://localhost:11434")
    get_settings.cache_clear()

    model = get_chat_model("ollama", "llama3.2")
    assert model.model == "llama3.2"
    assert model.base_url == "http://localhost:11434"
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
pytest tests/test_llm_factory.py::test_get_chat_model_ollama -v
```

Expected: FAIL `Unknown provider: ollama`

- [ ] **Step 3: Add Ollama branch**

In `backend/app/llm/factory.py`, add import and branch:

```python
from langchain_ollama import ChatOllama
```

Before final `raise ValueError`:

```python
    if provider == "ollama":
        return ChatOllama(
            model=model or settings.ollama_chat_model,
            base_url=settings.ollama_base_url,
        )
```

Note: `ChatOllama` streams via `astream` — already used in `chat_node`.

- [ ] **Step 4: Run LLM factory tests**

Run:

```bash
pytest tests/test_llm_factory.py -v
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/llm/factory.py backend/tests/test_llm_factory.py
git commit -m "feat: add Ollama chat provider"
```

---

### Task 4: RAG store + pgvector dimension

**Files:**
- Modify: `backend/app/rag/store.py`
- Modify: `backend/app/rag/db.py`
- Modify: `backend/migrations/001_documents.sql`
- Modify: `backend/tests/test_store.py`

- [ ] **Step 1: Update fake embeddings dimension in tests**

In `backend/tests/test_store.py`, replace hardcoded `1536` with `768`:

```python
_DIM = 768

class _FakeEmbeddings:
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[0.1] * _DIM for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        return [0.1] * _DIM
```

- [ ] **Step 2: Wire store to embedding factory**

Replace `backend/app/rag/store.py` imports and `__init__`:

```python
from langchain_core.embeddings import Embeddings

from app.llm.embeddings import get_embeddings
```

```python
class DocumentStore:
    def __init__(self, embeddings: Embeddings | None = None):
        self._embeddings = embeddings or get_embeddings()
```

Remove `OpenAIEmbeddings` direct import.

- [ ] **Step 3: Dynamic vector dimension in `db.py`**

Replace static SQL in `backend/app/rag/db.py`:

```python
def _tables_sql(dim: int) -> str:
    return f"""
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector({dim}),
  metadata JSONB DEFAULT '{{}}'
);

CREATE INDEX IF NOT EXISTS idx_chunks_embedding
    ON document_chunks USING ivfflat (embedding vector_cosine_ops);
"""


async def create_tables() -> None:
    settings = get_settings()
    conn = await asyncpg.connect(settings.database_url)
    try:
        await conn.execute(_tables_sql(settings.embedding_dimensions))
    finally:
        await conn.close()
```

- [ ] **Step 4: Update migration SQL**

In `backend/migrations/001_documents.sql`, change line 14:

```sql
  embedding vector(768),
```

- [ ] **Step 5: Run full test suite**

Run:

```bash
pytest -v
```

Expected: all PASS (integration DB tests skip without Postgres)

- [ ] **Step 6: Commit**

```bash
git add backend/app/rag/store.py backend/app/rag/db.py backend/migrations/001_documents.sql backend/tests/test_store.py
git commit -m "feat: RAG store uses embedding factory with configurable vector dim"
```

---

### Task 5: Docs and dev script

**Files:**
- Modify: `backend/README.md`
- Modify: `AGENTS.md`
- Modify: `scripts/dev.sh`

- [ ] **Step 1: Add Ollama section to `backend/README.md`**

````markdown
## Local-only with Ollama

```bash
ollama pull llama3.2
ollama pull nomic-embed-text
```

`.env`:

```env
DEFAULT_LLM_PROVIDER=ollama
DEFAULT_MODEL=llama3.2
OLLAMA_BASE_URL=http://localhost:11434
EMBEDDING_PROVIDER=ollama
EMBEDDING_MODEL=nomic-embed-text
EMBEDDING_DIMENSIONS=768
CHECKPOINTER=auto
```

If switching from OpenAI embeddings, reset DB: `docker compose down -v`.
````

- [ ] **Step 2: Update `AGENTS.md` LLM line**

```markdown
- **LLM:** LangChain（OpenAI / Anthropic / Ollama 本地，经 `app/llm/factory.py`）
- **Embeddings:** `app/llm/embeddings.py`（OpenAI 云端 / Ollama 本地 `nomic-embed-text`）
```

- [ ] **Step 3: Warn in `scripts/dev.sh` when Ollama profile**

After loading `.env`, if `DEFAULT_LLM_PROVIDER=ollama` or `EMBEDDING_PROVIDER=ollama`, add:

```bash
if [[ "${DEFAULT_LLM_PROVIDER:-}" == "ollama" || "${EMBEDDING_PROVIDER:-}" == "ollama" ]]; then
  if ! curl -sf "${OLLAMA_BASE_URL:-http://localhost:11434}/api/tags" >/dev/null 2>&1; then
    echo "Warning: Ollama not reachable at ${OLLAMA_BASE_URL:-http://localhost:11434}" >&2
    echo "         Run: ollama serve && ollama pull llama3.2 && ollama pull nomic-embed-text" >&2
  fi
fi
```

Source `.env` before check:

```bash
set -a
# shellcheck source=/dev/null
[[ -f .env ]] && source .env
set +a
```

Place after `.env` creation block in `dev.sh`.

- [ ] **Step 4: Manual smoke**

```bash
export DEFAULT_LLM_PROVIDER=ollama
export DEFAULT_MODEL=llama3.2
export EMBEDDING_PROVIDER=ollama
export EMBEDDING_MODEL=nomic-embed-text
export EMBEDDING_DIMENSIONS=768
docker compose down -v && docker compose up -d db
uvicorn app.main:app --reload
```

Upload + chat:

```bash
curl -X POST http://localhost:8000/v1/documents -F "file=@tests/fixtures/sample.txt"
curl -N -X POST http://localhost:8000/v1/chat \
  -H 'Content-Type: application/json' \
  -d '{"thread_id":"ollama","message":"summarize","document_ids":["<id>"]}'
```

Expected: SSE tokens without cloud API keys.

- [ ] **Step 5: Commit**

```bash
git add backend/README.md AGENTS.md scripts/dev.sh
git commit -m "docs: local Ollama setup for chat and RAG embeddings"
```

---

## Spec Coverage

| Requirement | Task |
|-------------|------|
| 本地对话无云端 key | Task 3 `ChatOllama` |
| 本地 RAG embedding | Task 2 `OllamaEmbeddings` |
| 向量维度与模型一致 | Task 4 `EMBEDDING_DIMENSIONS=768` |
| 保留云端 provider 可选 | Tasks 2–3 keep `openai` branches |
| 测试不依赖 Ollama 进程 | Task 2 `mock` provider |

## Self-Review Notes (applied)

- **768 vs 1536:** Ollama `nomic-embed-text` is 768-dim; plan resets DB for local profile—documented in README and prerequisites.
- **`ChatOllama` streaming:** `chat_node` already uses `astream`; no graph change.
- **DeepSeek plan:** Separate; user can `ollama pull deepseek-r1` and set `DEFAULT_MODEL=deepseek-r1` without code change.
- **Client-side Ollama:** Deferred; V1 backend proxies to `localhost:11434`.

## Deferred

- `POST /v1/documents/{id}/chunks` with client-precomputed vectors
- Electron embedding in renderer (WASM) without backend
- Auto `ollama pull` in `dev.sh`
