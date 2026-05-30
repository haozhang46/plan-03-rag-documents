# Agent Flow Backend

## Setup

```bash
cd backend
python3.11 -m venv .venv   # requires Python >= 3.11
source .venv/bin/activate
pip install -e ".[dev]"
```

## Tests

```bash
pytest -v
```

## Run locally

### 方式 A：只起 Postgres（推荐，API 本机跑）

```bash
# repo 根目录
cp .env.example .env   # 填入 OPENAI_API_KEY

docker compose up -d db
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload
```

未起 Postgres 时默认 `CHECKPOINTER=auto` 会退回内存 Checkpoint（重启后对话状态不保留）。有数据库后设 `CHECKPOINTER=postgres` 或 `docker compose up -d db`。

### 方式 B：Postgres + API 全在 Docker

```bash
docker compose up -d --build
```

### Docker 报错 `Failed to install Rosetta`（Apple Silicon）

原因：Docker Desktop 在用 x86 模拟，但系统装不上 Rosetta。

**按顺序试：**

1. **Docker Desktop → Settings → General**  
   - 关闭 **Use Rosetta for x86/amd64 emulation on Apple Silicon**  
   - Apply & Restart  

2. **只拉 arm64 镜像**（本仓库 `docker-compose.yml` 已写 `platform: linux/arm64`）  
   ```bash
   docker compose down
   docker compose pull db
   docker compose up -d db
   ```

3. **手动安装 Rosetta**（若你确实需要跑 amd64 镜像）  
   ```bash
   softwareupdate --install-rosetta --agree-to-license
   ```  
   然后重启 Docker Desktop。

4. **不用 Docker**：本机已能 `pytest` 时，可只用方式 A；或 `brew install postgresql@16` 本地起库。

5. **仍失败**：升级 Docker Desktop 到最新版，或 **Troubleshoot → Reset to factory defaults** 后重装。

## Chat API

```bash
curl -N -X POST http://localhost:8000/v1/chat \
  -H 'Content-Type: application/json' \
  -d '{"thread_id":"demo","message":"hello"}'
```

## Document API (client-side vector sync)

When `CLIENT_EMBEDDING_MODE=true`, the client embeds locally (Ollama) and syncs precomputed vectors:

```bash
# 1. Create document metadata
curl -X POST http://localhost:8000/v1/documents \
  -H 'Content-Type: application/json' \
  -d '{"filename":"notes.md","content_type":"text/markdown","embedding_model":"nomic-embed-text","embedding_dimensions":768}'

# 2. Upload precomputed chunks
curl -X POST http://localhost:8000/v1/documents/{document_id}/chunks \
  -H 'Content-Type: application/json' \
  -d '{"chunks":[{"chunk_index":0,"content":"hello","embedding":[...768 floats...]}]}'

# 3. Chat with client query embedding (optional; skips server embed)
curl -N -X POST http://localhost:8000/v1/chat \
  -H 'Content-Type: application/json' \
  -d '{"thread_id":"demo","message":"what is in the doc?","document_ids":["..."], "query_embedding":[...768 floats...]}'
```

Legacy server-side ingest (OpenAI embeddings) remains at `POST /v1/documents/upload`.

With uploaded documents (pass `document_ids` from `POST /v1/documents`):

```bash
curl -N -X POST http://localhost:8000/v1/chat \
  -H 'Content-Type: application/json' \
  -d '{"thread_id":"demo","message":"summarize the uploaded document","document_ids":["YOUR_DOC_ID"]}'
```

With `SUPERVISOR_MODE=llm`, RAG runs only when the planner routes to `rag` (typically when `document_ids` are present and the question needs document content). With `SUPERVISOR_MODE=off` (default), the graph always runs `prepare → rag → chat`.

### Config

| Variable | Default | Description |
|----------|---------|-------------|
| `CLIENT_EMBEDDING_MODE` | `false` | When true, prefer client sync path |
| `EXPECTED_EMBEDDING_DIMENSIONS` | `768` | pgvector column size (was 1536 in Plan 03) |
| `SUPERVISOR_MODE` | `off` | `llm` enables planner conditional rag/chat routing |

### Migrating from 1536 → 768 dimensions

Existing Plan 03 databases use `vector(1536)`. Client sync requires 768-dim (`nomic-embed-text`). Reset the volume:

```bash
docker compose down -v
docker compose up -d db
```

For brownfield upgrades, run `backend/migrations/002_client_embeddings.sql` manually to add metadata columns.
