# Agent Flow × RAGFlow 用户权限打通 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Agent Flow 的租户/用户身份与 RAGFlow 的 API Key 及 dataset 权限对齐——用户只能检索自己有权限的知识库，不再共用全局 `RAGFLOW_API_KEY` 或任意传 `dataset_ids`。

**Architecture:** Agent Flow 从 `X-Tenant-ID` / JWT 解析 `tenant_id`（可选 `user_id`），在 Postgres 查 `tenant_ragflow_bindings` 得到该身份对应的 RAGFlow API Key；所有 RAG 调用用该 Key 实例化 `RagFlowClient`。Chat 前用 RAGFlow `GET /api/v1/datasets` 校验 `dataset_ids ⊆ allowed`；未传 `dataset_ids` 时仅允许 tenant 绑定表里的 default dataset（或 env 全局 default，仅 dev）。Admin 用 `X-Admin-Key` 维护绑定；普通用户通过 `GET /v1/rag/datasets` 列出可见知识库。

**Tech Stack:** FastAPI, asyncpg, httpx, existing `TenantDep`, RAGFlow HTTP API (`/api/v1/datasets`, `/api/v1/retrieval`), Vitest/pytest

---

## 现状与问题

| 层级 | 今天 | 风险 |
|------|------|------|
| Agent Flow 身份 | `TENANT_MODE` + `X-Tenant-ID` / JWT `tenant_id` | 与 RAG 无关 |
| RAGFlow 调用 | 全局 `RAGFLOW_API_KEY` | 所有用户同一 RAGFlow 身份 |
| `dataset_ids` | 客户端任意传，服务端不校验 | 知道 id 即可越权检索 |
| 前端 | 无 dataset 选择器 | 依赖 env `RAGFLOW_DEFAULT_DATASET_IDS` |

RAGFlow 侧权限模型（开源版）：dataset 仅 `permission: me | team`，API Key 绑定 RAGFlow 用户；检索时 RAGFlow 返回 `code:108` 表示无权限。

---

## 目标文件结构

```text
backend/app/
├── auth/
│   ├── tenant.py              # 扩展：解析 JWT user_id（sub）
│   └── identity.py            # 新建：RequestIdentity dataclass
├── rag/
│   ├── ragflow_client.py      # 扩展：list_datasets()
│   ├── credentials.py         # 新建：resolve_ragflow_api_key(tenant, user)
│   ├── access.py              # 新建：filter_allowed_dataset_ids()
│   └── bindings_store.py      # 新建：Postgres + Memory 绑定存储
├── api/routes/
│   ├── rag.py                 # 新建：GET /v1/rag/datasets
│   ├── admin_ragflow.py       # 新建：CRUD tenant↔api_key 绑定
│   └── chat.py                # 修改：chat 前校验 dataset_ids
backend/migrations/
└── 004_ragflow_bindings.sql   # 新建
backend/tests/
├── test_ragflow_bindings_store.py
├── test_ragflow_access.py
├── test_api_rag_datasets.py
├── test_api_admin_ragflow.py
└── test_api_chat_rag_auth.py
fe/
├── composables/useRagDatasets.ts   # 新建
├── components/RagDatasetPanel.vue  # 新建（Debug 选库）
├── composables/useChat.ts          # 传 dataset_ids
└── pages/index.vue                 # 挂载选库面板
```

---

### Task 1: 请求身份模型（tenant + user）

**Files:**
- Create: `backend/app/auth/identity.py`
- Modify: `backend/app/auth/tenant.py`
- Test: `backend/tests/test_auth_identity.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_auth_identity.py
import base64
import hashlib
import hmac
import json

from starlette.requests import Request

from app.auth.identity import get_request_identity


def _make_jwt(payload: dict, secret: str) -> str:
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "HS256", "typ": "JWT"}).encode()
    ).decode().rstrip("=")
    body = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    sig = base64.urlsafe_b64encode(
        hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
    ).decode().rstrip("=")
    return f"{header}.{body}.{sig}"


def test_identity_from_tenant_header(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "s")
    from app.config import get_settings

    get_settings.cache_clear()
    scope = {
        "type": "http",
        "headers": [(b"x-tenant-id", b"tenant-a")],
        "method": "GET",
        "path": "/",
    }
    ident = get_request_identity(Request(scope))
    assert ident.tenant_id == "tenant-a"
    assert ident.user_id is None
    get_settings.cache_clear()


def test_identity_from_jwt_sub_and_tenant(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "secret")
    from app.config import get_settings

    get_settings.cache_clear()
    token = _make_jwt({"tenant_id": "t1", "sub": "user-42"}, "secret")
    scope = {
        "type": "http",
        "headers": [(b"authorization", f"Bearer {token}".encode())],
        "method": "GET",
        "path": "/",
    }
    ident = get_request_identity(Request(scope))
    assert ident.tenant_id == "t1"
    assert ident.user_id == "user-42"
    get_settings.cache_clear()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/pytest tests/test_auth_identity.py -v`  
Expected: FAIL with `ModuleNotFoundError: app.auth.identity`

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/auth/identity.py
from dataclasses import dataclass

from starlette.requests import Request

from app.auth.tenant import get_tenant_id, get_user_id_from_request


@dataclass(frozen=True)
class RequestIdentity:
    tenant_id: str | None
    user_id: str | None


def get_request_identity(request: Request) -> RequestIdentity:
    return RequestIdentity(
        tenant_id=get_tenant_id(request),
        user_id=get_user_id_from_request(request),
    )
```

在 `backend/app/auth/tenant.py` 增加（复用现有 JWT 验签逻辑，从 payload 读 `sub` 或 `user_id`）：

```python
def get_user_id_from_request(request: Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    secret = get_settings().jwt_secret
    if not secret:
        return None
    payload = _decode_jwt_payload(auth[7:].strip(), secret)
    if not payload:
        return None
    for key in ("sub", "user_id"):
        if payload.get(key):
            return str(payload[key])
    return None
```

将 `_tenant_id_from_jwt` 重构为共用 `_decode_jwt_payload`（同一文件内 private helper）。

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv/bin/pytest tests/test_auth_identity.py -v`  
Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add backend/app/auth/identity.py backend/app/auth/tenant.py backend/tests/test_auth_identity.py
git commit -m "feat: parse tenant and user identity from JWT/header"
```

---

### Task 2: RAGFlow 绑定存储（tenant/user → API Key）

**Files:**
- Create: `backend/migrations/004_ragflow_bindings.sql`
- Create: `backend/app/rag/bindings_store.py`
- Modify: `backend/app/rag/db.py`
- Test: `backend/tests/test_ragflow_bindings_store.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_ragflow_bindings_store.py
import pytest

from app.rag.bindings_store import MemoryRagflowBindingsStore


@pytest.mark.asyncio
async def test_upsert_and_get_tenant_level_binding():
    store = MemoryRagflowBindingsStore()
    await store.upsert(
        tenant_id="tenant-a",
        user_id=None,
        api_key="rk-tenant",
        default_dataset_ids=["ds-1"],
    )
    row = await store.get(tenant_id="tenant-a", user_id=None)
    assert row.api_key == "rk-tenant"
    assert row.default_dataset_ids == ["ds-1"]


@pytest.mark.asyncio
async def test_user_binding_overrides_tenant_default():
    store = MemoryRagflowBindingsStore()
    await store.upsert("tenant-a", None, "rk-tenant", ["ds-shared"])
    await store.upsert("tenant-a", "user-1", "rk-user", ["ds-private"])
    row = await store.get("tenant-a", "user-1")
    assert row.api_key == "rk-user"
    assert row.default_dataset_ids == ["ds-private"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/pytest tests/test_ragflow_bindings_store.py -v`  
Expected: FAIL — module not found

- [ ] **Step 3: Write migration + store**

```sql
-- backend/migrations/004_ragflow_bindings.sql
CREATE TABLE IF NOT EXISTS ragflow_bindings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    user_id TEXT,
    api_key TEXT NOT NULL,
    default_dataset_ids TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ragflow_bindings_tenant
    ON ragflow_bindings (tenant_id);
```

`bindings_store.py` 提供：

```python
@dataclass
class RagflowBinding:
    tenant_id: str
    user_id: str | None
    api_key: str
    default_dataset_ids: list[str]

class RagflowBindingsStore(Protocol):
    async def get(self, tenant_id: str, user_id: str | None) -> RagflowBinding | None: ...
    async def upsert(self, tenant_id: str, user_id: str | None, api_key: str, default_dataset_ids: list[str]) -> RagflowBinding: ...
    async def delete(self, tenant_id: str, user_id: str | None) -> bool: ...
```

Postgres 实现：`get` 先查 `(tenant_id, user_id)`，若无 user 级则回退 `(tenant_id, NULL)`。  
`MemoryRagflowBindingsStore` 供测试与无 Postgres 启动。

在 `backend/app/rag/db.py` 的 `create_tables()` 末尾执行 `004_ragflow_bindings.sql`。  
在 `backend/app/main.py` lifespan 中：`app.state.ragflow_bindings_store = PostgresRagflowBindingsStore()`（Postgres 路径）或 Memory（memory checkpointer 路径）。

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv/bin/pytest tests/test_ragflow_bindings_store.py -v`  
Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add backend/migrations/004_ragflow_bindings.sql backend/app/rag/bindings_store.py backend/app/rag/db.py backend/app/main.py backend/tests/test_ragflow_bindings_store.py
git commit -m "feat: store per-tenant RAGFlow API key bindings"
```

---

### Task 3: RAGFlow 凭证解析 + list_datasets

**Files:**
- Create: `backend/app/rag/credentials.py`
- Modify: `backend/app/rag/ragflow_client.py`
- Test: `backend/tests/test_ragflow_credentials.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_ragflow_credentials.py
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.auth.identity import RequestIdentity
from app.rag.credentials import resolve_ragflow_client
from app.rag.bindings_store import RagflowBinding, MemoryRagflowBindingsStore


@pytest.mark.asyncio
async def test_resolve_uses_user_binding_first(monkeypatch):
    monkeypatch.delenv("RAGFLOW_API_KEY", raising=False)
    store = MemoryRagflowBindingsStore()
    await store.upsert("t1", None, "tenant-key", [])
    await store.upsert("t1", "u1", "user-key", [])
    ident = RequestIdentity(tenant_id="t1", user_id="u1")
    client = await resolve_ragflow_client(ident, store)
    assert client._api_key == "user-key"


@pytest.mark.asyncio
async def test_list_datasets_parses_response():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "code": 0,
        "data": [{"id": "ds-1", "name": "Wiki", "permission": "me"}],
        "total_datasets": 1,
    }
    with patch("app.rag.ragflow_client.httpx.Client") as cls:
        http = MagicMock()
        http.__enter__ = MagicMock(return_value=http)
        http.__exit__ = MagicMock(return_value=False)
        http.get.return_value = mock_resp
        cls.return_value = http
        from app.rag.ragflow_client import RagFlowClient

        rows = RagFlowClient(api_key="k").list_datasets()
    assert rows[0].id == "ds-1"
    assert rows[0].name == "Wiki"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/pytest tests/test_ragflow_credentials.py -v`  
Expected: FAIL

- [ ] **Step 3: Implement**

`ragflow_client.py` 增加：

```python
@dataclass
class RagFlowDataset:
    id: str
    name: str
    permission: str

def list_datasets(self, page: int = 1, page_size: int = 100) -> list[RagFlowDataset]:
    with httpx.Client(timeout=self._timeout) as client:
        resp = client.get(
            f"{self._base_url}/api/v1/datasets",
            headers=self._headers(),
            params={"page": page, "page_size": page_size},
        )
        resp.raise_for_status()
        body = resp.json()
    if body.get("code") != 0:
        raise RuntimeError(body.get("message", "list datasets failed"))
    return [
        RagFlowDataset(
            id=str(row["id"]),
            name=str(row.get("name", "")),
            permission=str(row.get("permission", "me")),
        )
        for row in body.get("data") or []
    ]
```

`credentials.py`：

```python
async def resolve_ragflow_client(
    identity: RequestIdentity,
    store: RagflowBindingsStore,
) -> RagFlowClient:
    settings = get_settings()
    binding = None
    if identity.tenant_id:
        binding = await store.get(identity.tenant_id, identity.user_id)
        if binding is None and identity.user_id:
            binding = await store.get(identity.tenant_id, None)
    if binding:
        return RagFlowClient(api_key=binding.api_key)
    if settings.ragflow_api_key:
        return RagFlowClient()
    raise HTTPException(status_code=503, detail="RAGFlow credentials not configured")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv/bin/pytest tests/test_ragflow_credentials.py tests/test_ragflow_client.py -v`  
Expected: all passed

- [ ] **Step 5: Commit**

```bash
git add backend/app/rag/credentials.py backend/app/rag/ragflow_client.py backend/tests/test_ragflow_credentials.py
git commit -m "feat: resolve RAGFlow client per tenant/user binding"
```

---

### Task 4: dataset 访问校验（filter_allowed_dataset_ids）

**Files:**
- Create: `backend/app/rag/access.py`
- Test: `backend/tests/test_ragflow_access.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_ragflow_access.py
from app.rag.access import filter_allowed_dataset_ids, RagAccessError


def test_rejects_unknown_dataset():
    allowed = {"ds-1", "ds-2"}
    try:
        filter_allowed_dataset_ids(["ds-1", "ds-evil"], allowed)
        assert False, "expected RagAccessError"
    except RagAccessError as exc:
        assert "ds-evil" in str(exc)


def test_empty_request_uses_defaults():
    allowed = {"ds-1", "ds-2"}
    out = filter_allowed_dataset_ids([], allowed, defaults=["ds-1"])
    assert out == ["ds-1"]


def test_empty_request_without_defaults_raises():
    import pytest
    from app.rag.access import RagAccessError

    with pytest.raises(RagAccessError):
        filter_allowed_dataset_ids([], {"ds-1"})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/pytest tests/test_ragflow_access.py -v`  
Expected: FAIL

- [ ] **Step 3: Implement**

```python
# backend/app/rag/access.py
class RagAccessError(Exception):
    pass


def filter_allowed_dataset_ids(
    requested: list[str],
    allowed_ids: set[str],
    *,
    defaults: list[str] | None = None,
) -> list[str]:
    if requested:
        bad = [d for d in requested if d not in allowed_ids]
        if bad:
            raise RagAccessError(f"forbidden dataset_ids: {bad}")
        return requested
    if defaults:
        missing = [d for d in defaults if d not in allowed_ids]
        if missing:
            raise RagAccessError(f"default dataset_ids not allowed: {missing}")
        return list(defaults)
    raise RagAccessError("dataset_ids required")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv/bin/pytest tests/test_ragflow_access.py -v`  
Expected: 3 passed

- [ ] **Step 5: Commit**

```bash
git add backend/app/rag/access.py backend/tests/test_ragflow_access.py
git commit -m "feat: enforce dataset_ids against allowed set"
```

---

### Task 5: Admin API — 维护 tenant↔RAGFlow 绑定

**Files:**
- Create: `backend/app/api/routes/admin_ragflow.py`
- Modify: `backend/app/main.py`
- Test: `backend/tests/test_api_admin_ragflow.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_api_admin_ragflow.py
def test_admin_upsert_binding_requires_admin_key(client, monkeypatch):
    monkeypatch.setenv("ADMIN_API_KEY", "admin-secret")
    from app.config import get_settings
    get_settings.cache_clear()
    resp = client.put(
        "/v1/admin/ragflow/bindings/tenant-a",
        json={"api_key": "rk-test", "default_dataset_ids": ["ds-1"]},
    )
    assert resp.status_code == 403
    get_settings.cache_clear()


def test_admin_upsert_binding_success(client, monkeypatch, test_app):
    monkeypatch.setenv("ADMIN_API_KEY", "admin-secret")
    from app.config import get_settings
    from app.rag.bindings_store import MemoryRagflowBindingsStore

    get_settings.cache_clear()
    test_app.state.ragflow_bindings_store = MemoryRagflowBindingsStore()
    resp = client.put(
        "/v1/admin/ragflow/bindings/tenant-a",
        json={"api_key": "rk-test", "default_dataset_ids": ["ds-1"]},
        headers={"X-Admin-Key": "admin-secret"},
    )
    assert resp.status_code == 200
    assert resp.json()["tenant_id"] == "tenant-a"
    assert resp.json()["api_key_hint"] == "rk-…est"
    get_settings.cache_clear()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/pytest tests/test_api_admin_ragflow.py -v`  
Expected: FAIL — 404

- [ ] **Step 3: Implement routes**

```python
# backend/app/api/routes/admin_ragflow.py
class UpsertBindingRequest(BaseModel):
    api_key: str = Field(min_length=8)
    default_dataset_ids: list[str] = Field(default_factory=list)
    user_id: str | None = None


@router.put("/admin/ragflow/bindings/{tenant_id}")
async def upsert_binding(tenant_id: str, body: UpsertBindingRequest, request: Request):
    require_skill_admin(request, tenant_id=None)  # admin only
    store = request.app.state.ragflow_bindings_store
    row = await store.upsert(tenant_id, body.user_id, body.api_key, body.default_dataset_ids)
    return {
        "tenant_id": row.tenant_id,
        "user_id": row.user_id,
        "api_key_hint": _mask_key(row.api_key),
        "default_dataset_ids": row.default_dataset_ids,
    }


def _mask_key(key: str) -> str:
    if len(key) <= 6:
        return "…"
    return f"{key[:3]}…{key[-3:]}"
```

`main.py` 注册 `admin_ragflow.router`；`conftest.py` test_app 初始化 `ragflow_bindings_store = MemoryRagflowBindingsStore()`。

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv/bin/pytest tests/test_api_admin_ragflow.py -v`  
Expected: 2 passed

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/routes/admin_ragflow.py backend/app/main.py backend/tests/conftest.py backend/tests/test_api_admin_ragflow.py
git commit -m "feat: admin API for RAGFlow tenant bindings"
```

---

### Task 6: 用户 API — GET /v1/rag/datasets

**Files:**
- Create: `backend/app/api/routes/rag.py`
- Test: `backend/tests/test_api_rag_datasets.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_api_rag_datasets.py
from unittest.mock import patch

from app.rag.ragflow_client import RagFlowDataset


def test_list_rag_datasets_for_tenant(client, monkeypatch, test_app):
    monkeypatch.setenv("TENANT_MODE", "true")
    from app.config import get_settings
    from app.rag.bindings_store import MemoryRagflowBindingsStore
    import asyncio

    get_settings.cache_clear()
    store = MemoryRagflowBindingsStore()
    asyncio.get_event_loop().run_until_complete(
        store.upsert("tenant-a", None, "rk-test", [])
    )
    test_app.state.ragflow_bindings_store = store

    with patch("app.api.routes.rag.resolve_ragflow_client") as mock_resolve:
        mock_client = mock_resolve.return_value
        mock_client.list_datasets.return_value = [
            RagFlowDataset("ds-1", "Wiki", "team")
        ]
        resp = client.get(
            "/v1/rag/datasets",
            headers={"X-Tenant-ID": "tenant-a"},
        )
    assert resp.status_code == 200
    assert resp.json()["datasets"][0]["id"] == "ds-1"
    get_settings.cache_clear()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/pytest tests/test_api_rag_datasets.py -v`  
Expected: FAIL — 404

- [ ] **Step 3: Implement**

```python
@router.get("/rag/datasets")
async def list_rag_datasets(request: Request, tenant_id: TenantDep):
    if get_settings().tenant_mode and not tenant_id:
        raise HTTPException(status_code=401, detail="tenant required")
    ident = get_request_identity(request)
    store = request.app.state.ragflow_bindings_store
    client = await resolve_ragflow_client(ident, store)
    rows = client.list_datasets()
    return {
        "datasets": [
            {"id": d.id, "name": d.name, "permission": d.permission}
            for d in rows
        ]
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && .venv/bin/pytest tests/test_api_rag_datasets.py -v`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/routes/rag.py backend/app/main.py backend/tests/test_api_rag_datasets.py
git commit -m "feat: list RAGFlow datasets visible to current tenant"
```

---

### Task 7: Chat 路径强制校验 + 按身份调用 RAGFlow

**Files:**
- Modify: `backend/app/api/routes/chat.py`
- Modify: `backend/app/agent/nodes/rag.py`
- Test: `backend/tests/test_api_chat_rag_auth.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_api_chat_rag_auth.py
import asyncio
from unittest.mock import patch

from app.rag.ragflow_client import RagFlowDataset


def test_chat_rejects_forbidden_dataset(client, monkeypatch, test_app):
    monkeypatch.setenv("TENANT_MODE", "true")
    from app.config import get_settings
    from app.rag.bindings_store import MemoryRagflowBindingsStore

    get_settings.cache_clear()
    store = MemoryRagflowBindingsStore()
    asyncio.run(store.upsert("tenant-a", None, "rk-test", ["ds-allowed"]))
    test_app.state.ragflow_bindings_store = store

    with patch("app.api.routes.chat.resolve_ragflow_client") as mock_resolve:
        mock_client = mock_resolve.return_value
        mock_client.list_datasets.return_value = [
            RagFlowDataset("ds-allowed", "OK", "team")
        ]
        resp = client.post(
            "/v1/chat",
            json={
                "flow_id": "rag-flow",
                "thread_id": "t1",
                "message": "hi",
                "dataset_ids": ["ds-forbidden"],
            },
            headers={"X-Tenant-ID": "tenant-a"},
        )
    assert resp.status_code == 403
    get_settings.cache_clear()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && .venv/bin/pytest tests/test_api_chat_rag_auth.py -v`  
Expected: FAIL — chat returns 200 instead of 403

- [ ] **Step 3: Wire authorization in chat**

在 `chat.py` 增加 async helper `_authorize_rag_datasets(request, identity, requested_ids) -> list[str]`：

1. `client = await resolve_ragflow_client(identity, store)`
2. `allowed = {d.id for d in client.list_datasets()}`
3. `binding = await store.get(...)` 取 `default_dataset_ids`
4. `return filter_allowed_dataset_ids(requested_ids, allowed, defaults=binding.default_dataset_ids or get_ragflow_default_dataset_ids())`

在 `chat()` 里、`state_input = _build_input(...)` 之前调用；`RagAccessError` → HTTP 403。  
把解析后的 `dataset_ids` 写回 `req` 或单独传入 `_build_input`。

`rag.py` 改为从 `config["configurable"]["ragflow_client"]` 取 client（由 chat 注入），不再 `RagFlowClient()` 无参构造。

Audit `write_audit` 的 `details` 增加 `"dataset_ids": resolved_ids`（不含 api_key）。

- [ ] **Step 4: Run tests**

Run: `cd backend && .venv/bin/pytest tests/test_api_chat_rag_auth.py tests/test_api_chat.py tests/test_ragflow_rag_node.py -v`  
Expected: all passed

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/routes/chat.py backend/app/agent/nodes/rag.py backend/tests/test_api_chat_rag_auth.py
git commit -m "feat: authorize dataset_ids on chat using RAGFlow permissions"
```

---

### Task 8: 前端 Debug — 知识库选择与 chat 传参

**Files:**
- Create: `fe/composables/useRagDatasets.ts`
- Create: `fe/components/RagDatasetPanel.vue`
- Modify: `fe/pages/index.vue`, `fe/composables/useChat.ts`, `fe/types/index.ts`
- Test: `fe/tests/useRagDatasets.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// fe/tests/useRagDatasets.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useRagDatasets } from "../composables/useRagDatasets";

describe("useRagDatasets", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("useRuntimeConfig", () => ({ public: { apiBase: "" } }));
  });

  it("loads datasets from API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          datasets: [{ id: "ds-1", name: "Wiki", permission: "team" }],
        }),
      }),
    );
    const { datasets, refresh } = useRagDatasets(ref("thread-1"));
    await refresh();
    expect(datasets.value[0].id).toBe("ds-1");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd fe && pnpm test tests/useRagDatasets.test.ts`  
Expected: FAIL

- [ ] **Step 3: Implement composable + panel**

`useRagDatasets.ts`：`GET /v1/rag/datasets`，`selectedIds` 按 thread 存 localStorage（模式同已删除的 `useDocuments`）。  
`RagDatasetPanel.vue`：checkbox 列表，显示 name + permission，无 embedding 文案。  
`index.vue`：`onSend` 传 `datasetIds: selectedIds.value`；状态栏显示「RAG N 库」。

- [ ] **Step 4: Run frontend tests**

Run: `cd fe && pnpm test`  
Expected: useRagDatasets passed（修复既有 `useFlows` 测试需 stub `ref`/`onMounted` 若仍失败）

- [ ] **Step 5: Commit**

```bash
git add fe/composables/useRagDatasets.ts fe/components/RagDatasetPanel.vue fe/pages/index.vue fe/composables/useChat.ts fe/types/index.ts fe/tests/useRagDatasets.test.ts
git commit -m "feat: debug UI to select authorized RAGFlow datasets"
```

---

### Task 9: 配置、文档与运维脚本

**Files:**
- Modify: `.env.example`, `backend/README.md`, `deploy/README.md`
- Modify: `backend/app/config.py`（可选 `RAGFLOW_REQUIRE_TENANT_BINDING=true`）

- [ ] **Step 1: 更新 `.env.example`**

```env
# 生产：关闭全局 key，改为 per-tenant 绑定
# RAGFLOW_API_KEY=          # 仅 dev 回退
RAGFLOW_REQUIRE_TENANT_BINDING=false

# Admin 维护绑定
# curl -X PUT http://localhost:8000/v1/admin/ragflow/bindings/tenant-a \
#   -H 'X-Admin-Key: ...' \
#   -H 'Content-Type: application/json' \
#   -d '{"api_key":"<ragflow-user-api-key>","default_dataset_ids":["ds-id"]}'
```

- [ ] **Step 2: README 增加「权限打通」小节**

说明：RAGFlow 用户 Settings→API 复制 key → Admin 绑定到 Agent Flow tenant；JWT 需含 `tenant_id` + 可选 `sub`；chat 403 含义；RAGFlow `code:108` 与 Agent Flow 403 对应关系。

- [ ] **Step 3: 全量测试**

Run: `cd backend && .venv/bin/pytest -v`  
Run: `cd fe && pnpm test`  
Expected: backend 全绿；frontend 新增测试通过

- [ ] **Step 4: Commit**

```bash
git add .env.example backend/README.md deploy/README.md backend/app/config.py
git commit -m "docs: RAGFlow permission integration setup guide"
```

---

## 行为矩阵（验收）

| 场景 | 期望 |
|------|------|
| `TENANT_MODE=true`，tenant 有绑定，请求合法 `dataset_ids` | RAG 成功，SSE 可能带 `citations` |
| 请求含未授权 `dataset_ids` | HTTP **403**，不调用 retrieval |
| 未传 `dataset_ids`，binding 有 default | 使用 default，且 default ⊆ allowed |
| 未传 `dataset_ids`，无 default | HTTP **403** 或 **400**（明确错误信息） |
| `TENANT_MODE=false` + 全局 `RAGFLOW_API_KEY` | 开发模式：list_datasets + 校验仍执行，便于本地调试 |
| JWT 含 `sub`，存在 user 级 binding | 使用 user 的 RAGFlow key（RAGFlow 侧 `me` 库仅本人可见） |
| Admin PUT binding | 返回 masked key，DB 存完整 key |

---

## 非目标（本计划不做）

- RAGFlow 企业版细粒度 ACL 扩展
- 在 Agent Flow 内创建/上传 RAGFlow 文档（仍在 RAGFlow UI 完成）
- 将 RAGFlow API Key 下发到浏览器（始终服务端代理）
- API Key 加密库（v1 存 Postgres；后续可加 `RAGFLOW_CREDENTIALS_ENCRYPTION_KEY`）

---

## Self-Review

**Spec coverage:** 身份映射 ✓、绑定存储 ✓、dataset 列表 ✓、chat 校验 ✓、admin ✓、前端选库 ✓、文档 ✓  
**Placeholder scan:** 无 TBD / 无「Similar to Task N」  
**Type consistency:** `RagFlowDataset.id`、`filter_allowed_dataset_ids` 返回值、`ChatRequest.dataset_ids` 全链路一致  

---

## 执行方式

Plan complete and saved to `docs/superpowers/plans/2026-06-11-agent-flow-ragflow-permissions.md`. Two execution options:

**1. Subagent-Driven (recommended)** — 每个 Task 独立 subagent + 规格/质量双审查  

**2. Inline Execution** — 本会话按 Task 顺序直接实现，每 2–3 个 Task 做一次 checkpoint  

Which approach?
