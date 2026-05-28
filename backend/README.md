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
