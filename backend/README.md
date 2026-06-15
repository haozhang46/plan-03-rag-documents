# Agent Flow Backend

## Authentication (login / register)

Set `JWT_SECRET` (and `TENANT_MODE=true` in production). Users self-register at `/register` or via API:

```bash
curl -X POST http://localhost:8000/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"password123","display_name":"You"}'
```

Login:

```bash
curl -X POST http://localhost:8000/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"password123"}'
```

Use the returned `access_token` as `Authorization: Bearer <token>` on `/v1/sessions`, `/v1/chat`, `/v1/rag/datasets`, etc.

Optional: `JWT_EXPIRES_MINUTES` (default 10080 = 7 days). `ADMIN_API_KEY` is only for RAGFlow bindings / skills admin, not user signup.

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

### DeepSeek

```env
DEEPSEEK_API_KEY=sk-...
DEFAULT_LLM_PROVIDER=deepseek
DEFAULT_MODEL=deepseek-chat
```

Models: `deepseek-chat` (general), `deepseek-reasoner` (reasoning). RAG embeddings still require `OPENAI_API_KEY` or client-side Ollama sync.

Supervisor topology:

```text
prepare → route ⇄ rag | code → chat → END
```

### Config

| Variable | Default | Description |
|----------|---------|-------------|
| `CLIENT_EMBEDDING_MODE` | `false` | When true, prefer client sync path |
| `EXPECTED_EMBEDDING_DIMENSIONS` | `768` | pgvector column size (was 1536 in Plan 03) |
| `SUPERVISOR_MODE` | `off` | `llm` enables planner conditional rag/chat routing |
| `RAG_BACKEND` | `pgvector` | `ragflow` uses external RAGFlow HTTP API |
| `RAGFLOW_BASE_URL` | `http://localhost` | RAGFlow server base URL |
| `RAGFLOW_API_KEY` | — | Bearer token from RAGFlow UI |
| `RAGFLOW_TOP_K` | `5` | Chunks returned per retrieval |

### Migrating from 1536 → 768 dimensions

Existing Plan 03 databases use `vector(1536)`. Client sync requires 768-dim (`nomic-embed-text`). Reset the volume:

```bash
docker compose down -v
docker compose up -d db
```

For brownfield upgrades, run `backend/migrations/002_client_embeddings.sql` manually to add metadata columns.

## Multi-flow Agent API (external apps)

This service is an **Agent Runtime** for other applications. Use HTTP only; the Nuxt `fe/` app is a debug console.

### List flows

```bash
curl http://localhost:8000/v1/flows
```

### Chat with a specific flow

```bash
curl -N -X POST http://localhost:8000/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "flow_id": "knowledge-rag",
    "thread_id": "my-app-session-1",
    "message": "Summarize the uploaded notes",
    "document_ids": ["<document-uuid>"],
    "skill_names": ["test-driven-development"]
  }'
```

- `flow_id` — registered flow (`default`, `linear-rag`, `supervisor`, `parallel`, `knowledge-rag`, `rag-flow`). Defaults to `default`.
- `thread_id` — your app's session id. Checkpoint key is `{flow_id}:{thread_id}`.
- `skill_names` — optional; when non-empty, overrides flow defaults and auto skill routing.

### Knowledge app pattern

1. Sync local Markdown: `POST /v1/documents` + `POST /v1/documents/{id}/chunks` (client embeddings) or `POST /v1/documents/upload`.
2. Chat with `flow_id: "knowledge-rag"` and `document_ids` from step 1.
3. Optionally pass `query_embedding` from client Ollama for vector search.

## RAGFlow integration (optional)

Use [RAGFlow](https://github.com/infiniflow/ragflow) as an external retrieval backend instead of local pgvector. LangGraph stays the orchestration layer; RAGFlow is only retrieval.

### Recommended: deploy RAGFlow on a cloud VM

Your Mac (8GB) is too small for a stable local RAGFlow stack. Use a **Linux VM with 16GB+ RAM** and point Agent Flow at it over HTTP.

**1. Provision a server**

| Provider | Suggested spec |
|----------|----------------|
| 阿里云 / 腾讯云 / AWS / 等 | 4 vCPU, **16GB RAM**, 50GB+ disk, Ubuntu 22.04+ |

**2. On the server** — copy `scripts/setup-ragflow-server.sh` and run:

```bash
chmod +x setup-ragflow-server.sh
./setup-ragflow-server.sh
```

**Use your own MySQL / Redis** (skip bundled containers):

```bash
cp scripts/ragflow-external-deps.env.example scripts/ragflow-external-deps.env
# edit MYSQL_HOST, MYSQL_PASSWORD, REDIS_HOST, REDIS_PASSWORD, ...
./scripts/setup-ragflow-server.sh
```

`setup-ragflow-server.sh` auto-loads `scripts/ragflow-external-deps.env` (gitignored). Override path: `RAGFLOW_DEPS_ENV=/path/to/file`.

Or export inline:

```bash
export MYSQL_HOST=10.0.0.12
export MYSQL_PASSWORD=...
export REDIS_HOST=10.0.0.13
export REDIS_PASSWORD=...
./setup-ragflow-server.sh
```

Prepare MySQL beforehand:

```sql
CREATE DATABASE IF NOT EXISTS rag_flow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- grant a dedicated user; RAGFlow creates tables on first boot
```

Notes:

- Same host as Docker: `MYSQL_HOST=host.docker.internal` / `REDIS_HOST=host.docker.internal`
- RAGFlow uses **Redis logical db 1** — avoid sharing a db index used by other apps, or use a dedicated Redis instance
- Redis port in RAGFlow config is fixed at **6379** (non-standard ports need editing `service_conf.yaml.template`)

Or manually:

```bash
sudo sysctl -w vm.max_map_count=262144
git clone --depth 1 https://github.com/infiniflow/ragflow.git
cd ragflow/docker && docker compose up -d
```

**3. Open firewall** (security group / ufw):

- Allow **80** (Web UI) and **9380** (HTTP API) from your IP or VPC only
- Do **not** expose MySQL (5455), Redis, MinIO to the public internet

**4. Initialize RAGFlow**

- Open `http://<server-ip>`
- Register / login, create a **Knowledge Base (dataset)**, upload documents
- **Settings → API** → copy API key

**5. Configure Agent Flow** (on your Mac / app server `.env`):

```env
RAG_BACKEND=ragflow
RAGFLOW_BASE_URL=http://<server-ip>
# or https://ragflow.yourdomain.com if behind TLS reverse proxy
RAGFLOW_API_KEY=<your-ragflow-api-key>
RAGFLOW_TOP_K=5
```

**6. Chat**

```bash
curl -N -X POST http://localhost:8000/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "flow_id": "rag-flow",
    "thread_id": "ragflow-demo",
    "message": "What does the wiki say about onboarding?",
    "dataset_ids": ["<ragflow-dataset-id>"]
  }'
```

- `dataset_ids` — knowledge base IDs from the RAGFlow UI
- Optional `document_ids` — limit retrieval to specific documents

### Local install (dev only, 16GB+ recommended)

```bash
./scripts/setup-ragflow.sh
```

On 8GB Macs expect OOM / 502 errors; use the cloud path above instead.

```env
RAGFLOW_BASE_URL=http://localhost
```
