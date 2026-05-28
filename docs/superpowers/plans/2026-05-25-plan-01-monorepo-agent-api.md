# Plan 01: Monorepo + Agent API + LangGraph 对话

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 建立 Python 后端骨架、Docker Postgres、统一 LLM 适配、LangGraph 最小对话图、SSE 流式 API、Postgres Checkpoint。

**Architecture:** FastAPI 仅做 HTTP/SSE 与鉴权占位；所有推理进 `app/agent/graph.py`。Checkpoint 用 `langgraph-checkpoint-postgres`。V1 单 `chat` 节点 + 工具占位，无 Supervisor。

**Tech Stack:** Python 3.11, FastAPI, LangGraph 0.2+, langchain-openai/anthropic, pytest, httpx, docker-compose

**Depends on:** 无 | **Blocks:** Plan 02–07

---

## File Map

| 文件 | 职责 |
|------|------|
| `backend/pyproject.toml` | 依赖与 pytest 配置 |
| `backend/app/config.py` | `Settings`：DB URL、LLM keys、`DEFAULT_MODEL` |
| `backend/app/llm/factory.py` | `get_chat_model(provider, model)` |
| `backend/app/agent/state.py` | `AgentState` TypedDict |
| `backend/app/agent/graph.py` | `build_graph(checkpointer)` |
| `backend/app/agent/nodes/chat.py` | 调用 LLM + 合并 messages |
| `backend/app/api/routes/health.py` | `GET /health` |
| `backend/app/api/routes/chat.py` | `POST /v1/chat` SSE |
| `backend/app/main.py` | 挂载路由、lifespan 初始化 checkpointer |
| `docker-compose.yml` | postgres:16 + api service |
| `.env.example` | 环境变量模板 |

---

### Task 1: 项目骨架与依赖

**Files:**
- Create: `backend/pyproject.toml`
- Create: `backend/app/__init__.py`
- Create: `backend/tests/__init__.py`

- [ ] **Step 1: 创建 pyproject.toml**

```toml
[project]
name = "agent-flow-backend"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
  "fastapi>=0.115.0",
  "uvicorn[standard]>=0.32.0",
  "pydantic-settings>=2.6.0",
  "langgraph>=0.2.0",
  "langgraph-checkpoint-postgres>=2.0.0",
  "langchain-core>=0.3.0",
  "langchain-openai>=0.2.0",
  "langchain-anthropic>=0.2.0",
  "httpx>=0.27.0",
  "sse-starlette>=2.1.0",
  "psycopg[binary,pool]>=3.2.0",
]

[project.optional-dependencies]
dev = ["pytest>=8.0", "pytest-asyncio>=0.24", "anyio>=4.0"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

- [ ] **Step 2: 安装依赖**

Run:
```bash
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
```
Expected: 成功无 error

- [ ] **Step 3: Commit**

```bash
git add backend/pyproject.toml backend/app/__init__.py backend/tests/__init__.py
git commit -m "chore: init backend pyproject"
```

---

### Task 2: 配置模块

**Files:**
- Create: `backend/app/config.py`
- Create: `.env.example`
- Test: `backend/tests/test_config.py`

- [ ] **Step 1: 写失败测试**

```python
# backend/tests/test_config.py
from app.config import Settings

def test_settings_defaults():
    s = Settings(_env_file=None)
    assert s.app_name == "agent-flow"
    assert "postgresql" in s.database_url
```

- [ ] **Step 2: 运行确认 FAIL**

Run: `cd backend && pytest tests/test_config.py::test_settings_defaults -v`  
Expected: FAIL `ModuleNotFoundError` 或 `Settings` 未定义

- [ ] **Step 3: 实现 config.py**

```python
# backend/app/config.py
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "agent-flow"
    database_url: str = "postgresql://agent:agent@localhost:5432/agentflow"
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    default_llm_provider: str = "openai"
    default_model: str = "gpt-4o-mini"

@lru_cache
def get_settings() -> Settings:
    return Settings()
```

- [ ] **Step 4: .env.example**

```bash
DATABASE_URL=postgresql://agent:agent@localhost:5432/agentflow
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini
```

- [ ] **Step 5: pytest PASS**

Run: `pytest tests/test_config.py -v`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/app/config.py backend/tests/test_config.py .env.example
git commit -m "feat: add settings module"
```

---

### Task 3: LLM 工厂（双 Provider）

**Files:**
- Create: `backend/app/llm/__init__.py`
- Create: `backend/app/llm/factory.py`
- Test: `backend/tests/test_llm_factory.py`

- [ ] **Step 1: 失败测试（mock 环境）**

```python
# backend/tests/test_llm_factory.py
import os
import pytest
from app.llm.factory import get_chat_model

def test_get_chat_model_openai(monkeypatch):
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    model = get_chat_model("openai", "gpt-4o-mini")
    assert model.model_name == "gpt-4o-mini"

def test_unknown_provider_raises():
    with pytest.raises(ValueError, match="Unknown provider"):
        get_chat_model("invalid", "x")
```

- [ ] **Step 2: 实现 factory.py**

```python
# backend/app/llm/factory.py
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from app.config import get_settings

def get_chat_model(provider: str | None = None, model: str | None = None) -> BaseChatModel:
    settings = get_settings()
    provider = provider or settings.default_llm_provider
    model = model or settings.default_model

    if provider == "openai":
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY not set")
        return ChatOpenAI(model=model, api_key=settings.openai_api_key, streaming=True)
    if provider == "anthropic":
        if not settings.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        return ChatAnthropic(model=model, api_key=settings.anthropic_api_key, streaming=True)
    raise ValueError(f"Unknown provider: {provider}")
```

- [ ] **Step 3: pytest PASS & Commit**

```bash
pytest tests/test_llm_factory.py -v
git add backend/app/llm backend/tests/test_llm_factory.py
git commit -m "feat: add LLM provider factory"
```

---

### Task 4: Agent State 与 Chat 节点

**Files:**
- Create: `backend/app/agent/state.py`
- Create: `backend/app/agent/nodes/chat.py`
- Test: `backend/tests/test_chat_node.py`

- [ ] **Step 1: state.py**

```python
# backend/app/agent/state.py
from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
```

- [ ] **Step 2: 失败测试（mock LLM）**

```python
# backend/tests/test_chat_node.py
from langchain_core.messages import HumanMessage, AIMessage
from app.agent.nodes.chat import chat_node

class FakeLLM:
    def invoke(self, messages):
        return AIMessage(content="pong")

def test_chat_node_appends_ai_message():
    state = {"messages": [HumanMessage(content="ping")]}
    out = chat_node(state, llm=FakeLLM())
    assert out["messages"][-1].content == "pong"
```

- [ ] **Step 3: chat.py 实现**

```python
# backend/app/agent/nodes/chat.py
from app.agent.state import AgentState
from app.llm.factory import get_chat_model

def chat_node(state: AgentState, llm=None) -> AgentState:
    llm = llm or get_chat_model()
    response = llm.invoke(state["messages"])
    return {"messages": [response]}
```

- [ ] **Step 4: pytest PASS & Commit**

---

### Task 5: LangGraph 编译与内存图测试

**Files:**
- Create: `backend/app/agent/graph.py`
- Test: `backend/tests/test_graph.py`

- [ ] **Step 1: graph.py**

```python
# backend/app/agent/graph.py
from langgraph.graph import StateGraph, START, END
from app.agent.state import AgentState
from app.agent.nodes.chat import chat_node

def build_graph(checkpointer=None):
    g = StateGraph(AgentState)
    g.add_node("chat", chat_node)
    g.add_edge(START, "chat")
    g.add_edge("chat", END)
    return g.compile(checkpointer=checkpointer)
```

- [ ] **Step 2: 测试（MemorySaver）**

```python
# backend/tests/test_graph.py
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import HumanMessage
from app.agent.graph import build_graph

def test_graph_invoke():
    graph = build_graph(checkpointer=MemorySaver())
    config = {"configurable": {"thread_id": "t1"}}
    r1 = graph.invoke({"messages": [HumanMessage("hi")]}, config)
    assert len(r1["messages"]) >= 2
```

- [ ] **Step 3: Commit**

---

### Task 6: FastAPI Health + Chat SSE

**Files:**
- Create: `backend/app/api/routes/health.py`
- Create: `backend/app/api/routes/chat.py`
- Create: `backend/app/main.py`
- Test: `backend/tests/test_api_chat.py`

- [ ] **Step 1: health 路由**

```python
# backend/app/api/routes/health.py
from fastapi import APIRouter
router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}
```

- [ ] **Step 2: chat 路由（SSE 流式）**

```python
# backend/app/api/routes/chat.py
import json
from fastapi import APIRouter
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from langchain_core.messages import HumanMessage
from app.agent.graph import build_graph

router = APIRouter(prefix="/v1")
_graph = None

def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()  # Task 7 替换为 postgres checkpointer
    return _graph

class ChatRequest(BaseModel):
    thread_id: str
    message: str

@router.post("/chat")
async def chat(req: ChatRequest):
    graph = get_graph()
    config = {"configurable": {"thread_id": req.thread_id}}

    async def gen():
        result = graph.invoke(
            {"messages": [HumanMessage(content=req.message)]},
            config,
        )
        last = result["messages"][-1]
        yield {"event": "message", "data": json.dumps({"content": last.content})}
        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(gen())
```

- [ ] **Step 3: main.py**

```python
# backend/app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.routes import health, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="Agent Flow API", lifespan=lifespan)
app.include_router(health.router)
app.include_router(chat.router)
```

- [ ] **Step 4: API 测试（TestClient + mock graph）**

```python
# backend/tests/test_api_chat.py
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from langchain_core.messages import AIMessage
from app.main import app

def test_health():
    c = TestClient(app)
    assert c.get("/health").json() == {"status": "ok"}
```

- [ ] **Step 5: Commit**

---

### Task 7: Docker Compose + Postgres Checkpoint

**Files:**
- Create: `docker-compose.yml`
- Create: `backend/Dockerfile`
- Modify: `backend/app/main.py` — lifespan 内初始化 `AsyncPostgresSaver`

- [ ] **Step 1: docker-compose.yml**

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: agent
      POSTGRES_PASSWORD: agent
      POSTGRES_DB: agentflow
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      - db

volumes:
  pgdata:
```

- [ ] **Step 2: lifespan 挂载 Postgres checkpointer**

在 `main.py` lifespan 中：
```python
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from app.config import get_settings
from app.agent.graph import build_graph

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    async with AsyncPostgresSaver.from_conn_string(settings.database_url) as checkpointer:
        await checkpointer.setup()
        app.state.graph = build_graph(checkpointer=checkpointer)
        yield
```

并修改 `chat.py` 使用 `request.app.state.graph`。

- [ ] **Step 3: 手动验收**

```bash
docker compose up -d db
cd backend && uvicorn app.main:app --reload
curl -N -X POST http://localhost:8000/v1/chat \
  -H 'Content-Type: application/json' \
  -d '{"thread_id":"demo","message":"hello"}'
```
Expected: SSE `event: message` 含 AI 文本

- [ ] **Step 4: Commit**

```bash
git add docker-compose.yml backend/Dockerfile backend/app/main.py backend/app/api/routes/chat.py
git commit -m "feat: postgres checkpoint and docker compose"
```

---

## Spec Coverage (Plan 01)

| PRD 需求 | Task |
|----------|------|
| FastAPI Agent API | Task 6–7 |
| LangGraph 唯一编排 | Task 4–5 |
| 流式输出 | Task 6 SSE |
| Checkpoint 多轮 | Task 5 Memory / Task 7 Postgres |
| 多模型适配 | Task 3 |
| V1 单 Agent 对话 | Task 4–5 单 chat 节点 |

## 未覆盖（后续计划）

- 技能 L1/L2 → Plan 02
- RAG → Plan 03
- Langfuse → Plan 04
- UI → Plan 05
- Supervisor 多 Agent → Plan 06
