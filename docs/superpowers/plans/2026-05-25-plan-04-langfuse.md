# Plan 04: Langfuse 可观测

> **For agentic workers:** REQUIRED SUB-SKILL: subagent-driven-development or executing-plans.

**Goal:** 集成 Langfuse callback；区分 `skill.load` 与 `graph.invoke`；每次 chat 请求对应 trace + generation span。

**Architecture:** `observability/langfuse.py` 提供 `get_handler()`；在 `graph.invoke` 与 `load_l2` 处手动 `span` 或使用 LangChain `CallbackHandler`。

**Tech Stack:** langfuse>=2.0, docker compose 增加 langfuse 服务（可选 self-host）

**Depends on:** Plan 01；与 Plan 02 联调 skill span | **Blocks:** 无

---

## File Map

| 文件 | 职责 |
|------|------|
| `backend/app/observability/langfuse.py` | client + handler 工厂 |
| `backend/app/config.py` | `LANGFUSE_*` 变量 |
| `backend/app/skills/loader.py` | 记录 `skill.load` span |
| `backend/app/api/routes/chat.py` | 根 trace |
| `docker-compose.yml` | langfuse 服务（可选） |

---

### Task 1: 配置与 Handler

**Files:**
- Modify: `backend/app/config.py`
- Create: `backend/app/observability/langfuse.py`
- Test: `backend/tests/test_langfuse_handler.py`

- [ ] **Step 1: config 增加**

```python
langfuse_public_key: str | None = None
langfuse_secret_key: str | None = None
langfuse_host: str = "https://cloud.langfuse.com"
langfuse_enabled: bool = False
```

- [ ] **Step 2: handler 工厂**

```python
# backend/app/observability/langfuse.py
from langfuse.callback import CallbackHandler
from app.config import get_settings

def get_langfuse_handler(trace_name: str = "chat"):
    s = get_settings()
    if not s.langfuse_enabled:
        return None
    return CallbackHandler(
        public_key=s.langfuse_public_key,
        secret_key=s.langfuse_secret_key,
        host=s.langfuse_host,
        trace_name=trace_name,
    )
```

- [ ] **Step 3: 无 key 时返回 None 的测试**

- [ ] **Step 4: Commit**

---

### Task 2: Chat Trace 包裹

**Files:**
- Modify: `backend/app/api/routes/chat.py`

- [ ] **Step 1: invoke 时传入 callbacks**

```python
handler = get_langfuse_handler(trace_name=f"chat:{req.thread_id}")
config = {"configurable": {"thread_id": req.thread_id}}
if handler:
    config["callbacks"] = [handler]
result = graph.invoke(..., config)
```

- [ ] **Step 2: 手动验收** — Langfuse UI 可见 trace

- [ ] **Step 3: Commit**

---

### Task 3: skill.load 事件

**Files:**
- Modify: `backend/app/skills/loader.py`

- [ ] **Step 1: load_l2 内**

```python
from langfuse import Langfuse
from app.config import get_settings

def load_l2(skill_path: Path, skill_name: str = "") -> str:
    s = get_settings()
    if s.langfuse_enabled:
        lf = Langfuse()
        with lf.start_as_current_span(name="skill.load") as span:
            span.update(metadata={"skill": skill_name, "layer": "L2"})
            return _read_body(skill_path)
    return _read_body(skill_path)
```

- [ ] **Step 2: 集成测试 mock Langfuse client**

- [ ] **Step 3: Commit**

---

### Task 4: docker-compose Langfuse（可选自托管）

- [ ] **Step 1:** 按官方 compose 片段增加 `langfuse` + `clickhouse` 或使用 Langfuse Cloud

- [ ] **Step 2:** 更新 `.env.example`

- [ ] **Step 3: Commit**

---

## Spec Coverage

| PRD §3.5 | Task |
|----------|------|
| 全链路 Trace | 2 |
| skill vs subgraph 区分 | 3（subgraph 在 Plan 06 加 `subgraph.invoke`） |
