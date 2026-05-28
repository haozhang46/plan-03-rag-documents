# Plan 03: 文档上传与 RAG 检索

> **For agentic workers:** REQUIRED SUB-SKILL: subagent-driven-development or executing-plans.

**Goal:** `POST /v1/documents` 上传 PDF/TXT/MD；解析分片；pgvector 存储；chat 时检索注入上下文；回答返回 `citations`。

**Architecture:** `rag/ingest.py` 负责解析+chunk；`rag/store.py` 封装 pgvector；`prepare_node` 或独立 `rag_node` 在有人类消息且 `document_ids` 存在时检索。超长文档不全文进 prompt（PRD §2.3）。

**Tech Stack:** pypdf, langchain-text-splitters, langchain-postgres / pgvector

**Depends on:** Plan 01 | **Blocks:** Plan 06 RAG 专家子图

---

## File Map

| 文件 | 职责 |
|------|------|
| `backend/app/rag/chunking.py` | `RecursiveCharacterTextSplitter` |
| `backend/app/rag/ingest.py` | `ingest_file(file_id, path)` |
| `backend/app/rag/store.py` | `add_chunks`, `similarity_search` |
| `backend/app/api/routes/documents.py` | 上传 API |
| `backend/app/agent/nodes/rag.py` | 检索并注入 context |
| `backend/tests/test_rag_*.py` | |

---

### Task 1: 数据库文档与 chunk 表

**Files:**
- Create: `backend/migrations/001_documents.sql`
- Create: `backend/app/rag/db.py`

- [ ] **Step 1: SQL**

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops);
```

- [ ] **Step 2: 启动时 migration 脚本或 `docker-entrypoint-initdb.d`**

- [ ] **Step 3: Commit**

---

### Task 2: 分片与入库

**Files:**
- Create: `backend/app/rag/chunking.py`
- Create: `backend/app/rag/ingest.py`
- Test: `backend/tests/test_ingest.py`

- [ ] **Step 1: chunking**

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

def split_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, chunk_overlap=overlap
    )
    return splitter.split_text(text)
```

- [ ] **Step 2: ingest PDF（pypdf）**

```python
# backend/app/rag/ingest.py
from pypdf import PdfReader
from pathlib import Path
from app.rag.chunking import split_text
from app.rag.store import DocumentStore

def extract_text(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        return "\n".join(p.extract_text() or "" for p in PdfReader(path).pages)
    return path.read_text(encoding="utf-8")

async def ingest_file(store: DocumentStore, filename: str, path: Path) -> str:
    doc_id = await store.create_document(filename)
    chunks = split_text(extract_text(path))
    await store.add_chunks(doc_id, chunks)
    return doc_id
```

- [ ] **Step 3: 测试用固定 txt fixture，断言 chunk 数量 > 0**

- [ ] **Step 4: Commit**

---

### Task 3: DocumentStore + 向量检索

**Files:**
- Create: `backend/app/rag/store.py`
- Test: `backend/tests/test_store.py`

- [ ] **Step 1: `similarity_search(query, k=5) -> list[ChunkHit]`**

`ChunkHit` 含 `chunk_id`, `document_id`, `content`, `score`

- [ ] **Step 2: 使用 OpenAI embeddings 或本地 `sentence-transformers`（env 切换）**

- [ ] **Step 3: pytest（可用 mock embedding 固定向量）**

- [ ] **Step 4: Commit**

---

### Task 4: 上传 API

**Files:**
- Create: `backend/app/api/routes/documents.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: `POST /v1/documents` multipart**

```python
@router.post("/documents")
async def upload(file: UploadFile):
    path = save_temp(file)
    doc_id = await ingest_file(store, file.filename, path)
    return {"document_id": str(doc_id)}
```

- [ ] **Step 2: TestClient 上传小 txt**

- [ ] **Step 3: Commit**

---

### Task 5: RAG 节点接入 Graph

**Files:**
- Create: `backend/app/agent/nodes/rag.py`
- Modify: `backend/app/agent/graph.py` — `prepare → rag → chat`
- Modify: `backend/app/agent/state.py` — `document_ids: list[str]`

- [ ] **Step 1: rag_node 检索 top-k 注入 SystemMessage**

```python
def rag_node(state: AgentState) -> AgentState:
    ids = state.get("document_ids") or []
    if not ids:
        return {}
    query = state["messages"][-1].content
    hits = store.search(query, document_ids=ids, k=5)
    ctx = "\n\n".join(f"[{h.chunk_id}] {h.content}" for h in hits)
    return {
        "messages": [SystemMessage(content=f"<context>\n{ctx}\n</context>")],
        "citations": [h.chunk_id for h in hits],
    }
```

- [ ] **Step 2: ChatRequest 增加可选 `document_ids`**

- [ ] **Step 3: 响应 SSE 增加 `citations` 字段**

- [ ] **Step 4: Commit**

---

## Spec Coverage

| PRD | Task |
|-----|------|
| §3.2 上传解析 | Task 4 |
| 分片+向量 | Task 1–3 |
| 溯源引用 | Task 5 citations |
| §2.3 超长不全文 | chunk+RAG only |

## 未覆盖 → Plan 06

- Map-Reduce 全书子图
