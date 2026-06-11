# Agent Flow 用户登录 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Agent Flow 提供邮箱+密码登录，签发含 `tenant_id` 与 `sub` 的 JWT，前端自动携带 Token 访问受保护 API，并与现有 RAGFlow 权限绑定（`tenant_ragflow_bindings`）对齐。

**Architecture:** 后端新增 `users` 表与 `UsersStore`（Memory/Postgres 双实现，与 `sessions`/`bindings` 模式一致）；`POST /v1/auth/login` 校验密码后调用 `create_access_token`；现有 `TenantDep` / `get_request_identity` 无需改动契约，仅扩展 JWT 编码与 `exp` 校验。前端用 Pinia `useAuthStore` 持久化 Token，`useApiFetch` 统一注入 `Authorization`，Nuxt 全局 middleware 未登录跳转 `/login`。Admin 用 `X-Admin-Key` 创建用户；生产环境 `TENANT_MODE=true` + `JWT_SECRET`。

**Tech Stack:** FastAPI, asyncpg, stdlib `hashlib`（PBKDF2 密码哈希，不新增依赖）, 现有 HMAC-JWT 验签, Nuxt 3, Pinia, Vitest/pytest

---

## 现状与缺口

| 层级 | 今天 | 缺口 |
|------|------|------|
| 身份解析 | `tenant.py` 可解码 JWT 的 `tenant_id` / `sub` | 无签发端点；不校验 `exp` |
| 用户存储 | 无 | 无邮箱、密码、用户表 |
| API 保护 | `TenantDep` 在 `TENANT_MODE=true` 时要求 tenant | 前端从不发 Bearer |
| 前端 | 直连 `/v1/*`，无登录页 | 401 时无引导 |
| RAGFlow 权限 | 已支持 per-tenant/per-user binding | 需真实 `sub` 才能走 user 级 binding |

PRD 提及「用户管理、JWT/OAuth 登录」——本计划 V1 仅做 **邮箱+密码 + JWT**；OAuth/SSO 留作后续 Plan。

---

## 目标文件结构

```text
backend/app/
├── auth/
│   ├── jwt.py                 # 新建：create_access_token + decode（含 exp）
│   ├── passwords.py           # 新建：hash_password / verify_password
│   ├── users_store.py         # 新建：UserRecord + Memory/Postgres store
│   └── tenant.py              # 修改：decode 改调 jwt.py；校验 exp
├── api/routes/
│   └── auth.py                # 新建：login, me；admin create user
backend/migrations/
└── 005_users.sql              # 新建
backend/app/rag/db.py          # 修改：tenant_mode 时执行 005
backend/app/main.py            # 修改：include auth router
backend/tests/
├── test_auth_passwords.py
├── test_auth_jwt.py
├── test_users_store.py
└── test_api_auth.py
fe/
├── stores/useAuthStore.ts     # 新建：token、user、login/logout
├── composables/useApiFetch.ts # 新建：带 Authorization 的 fetch
├── pages/login.vue            # 新建
├── middleware/auth.global.ts  # 新建：未登录 → /login
├── composables/useSessions.ts # 修改：改用 useApiFetch
├── composables/useChat.ts
├── composables/useRagDatasets.ts
├── composables/useFlows.ts
├── composables/useSkillsPicker.ts
├── types/index.ts             # AuthUser, LoginResponse
└── tests/useAuthStore.test.ts
.env.example                   # JWT_EXPIRES_MINUTES、说明 TENANT_MODE
```

---

### Task 1: 密码哈希工具

**Files:**
- Create: `backend/app/auth/passwords.py`
- Test: `backend/tests/test_auth_passwords.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_auth_passwords.py
from app.auth.passwords import hash_password, verify_password


def test_hash_and_verify_roundtrip():
    hashed = hash_password("correct horse battery staple")
    assert hashed.startswith("pbkdf2_sha256$")
    assert verify_password("correct horse battery staple", hashed)
    assert not verify_password("wrong", hashed)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_auth_passwords.py -v`  
Expected: FAIL with `ModuleNotFoundError: app.auth.passwords`

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/auth/passwords.py
import hashlib
import hmac
import secrets

_ITERATIONS = 260_000
_ALGORITHM = "sha256"


def hash_password(plain: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        _ALGORITHM,
        plain.encode(),
        salt.encode(),
        _ITERATIONS,
    )
    return f"pbkdf2_sha256${_ITERATIONS}${salt}${digest.hex()}"


def verify_password(plain: str, stored: str) -> bool:
    try:
        scheme, iter_str, salt, hex_digest = stored.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        iterations = int(iter_str)
        expected = bytes.fromhex(hex_digest)
    except (ValueError, TypeError):
        return False
    actual = hashlib.pbkdf2_hmac(
        _ALGORITHM,
        plain.encode(),
        salt.encode(),
        iterations,
    )
    return hmac.compare_digest(actual, expected)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && pytest tests/test_auth_passwords.py -v`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/auth/passwords.py backend/tests/test_auth_passwords.py
git commit -m "feat: add pbkdf2 password hashing helpers"
```

---

### Task 2: JWT 签发与 exp 校验

**Files:**
- Create: `backend/app/auth/jwt.py`
- Modify: `backend/app/auth/tenant.py`
- Test: `backend/tests/test_auth_jwt.py`

- [ ] **Step 1: Write the failing test**

```python
# backend/tests/test_auth_jwt.py
import time

import pytest

from app.auth.jwt import create_access_token, decode_jwt_payload


def test_create_and_decode_token(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    from app.config import get_settings

    get_settings.cache_clear()
    token = create_access_token(
        {"sub": "user-1", "tenant_id": "tenant-a", "email": "a@example.com"},
        secret="test-secret",
        expires_in_seconds=3600,
    )
    payload = decode_jwt_payload(token, "test-secret")
    assert payload["sub"] == "user-1"
    assert payload["tenant_id"] == "tenant-a"
    assert payload["email"] == "a@example.com"
    assert payload["exp"] > int(time.time())
    get_settings.cache_clear()


def test_expired_token_rejected(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "test-secret")
    from app.config import get_settings

    get_settings.cache_clear()
    token = create_access_token(
        {"sub": "u", "tenant_id": "t"},
        secret="test-secret",
        expires_in_seconds=-1,
    )
    assert decode_jwt_payload(token, "test-secret") is None
    get_settings.cache_clear()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_auth_jwt.py -v`  
Expected: FAIL with `ModuleNotFoundError: app.auth.jwt`

- [ ] **Step 3: Write minimal implementation**

```python
# backend/app/auth/jwt.py
import base64
import binascii
import hashlib
import hmac
import json
import time


def _b64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _b64url_decode(segment: str) -> bytes:
    padding = "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(segment + padding)


def create_access_token(
    payload: dict, *, secret: str, expires_in_seconds: int
) -> str:
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body_payload = {**payload, "exp": int(time.time()) + expires_in_seconds}
    body = _b64url_encode(json.dumps(body_payload, separators=(",", ":")).encode())
    signing_input = f"{header}.{body}".encode()
    signature = _b64url_encode(
        hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    )
    return f"{header}.{body}.{signature}"


def decode_jwt_payload(token: str, secret: str) -> dict | None:
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
    except ValueError:
        return None

    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected_sig = hmac.new(
        secret.encode(),
        signing_input,
        hashlib.sha256,
    ).digest()
    try:
        actual_sig = _b64url_decode(signature_b64)
    except (ValueError, binascii.Error):
        return None
    if not hmac.compare_digest(expected_sig, actual_sig):
        return None

    try:
        payload = json.loads(_b64url_decode(payload_b64).decode())
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
        return None

    exp = payload.get("exp")
    if exp is not None and int(exp) < int(time.time()):
        return None
    return payload
```

**修改 `backend/app/auth/tenant.py`：** 删除内联 `_decode_jwt_payload`，改为：

```python
from app.auth.jwt import decode_jwt_payload as _decode_jwt_payload
```

（其余 `get_tenant_id` / `get_user_id_from_request` 逻辑不变。）

- [ ] **Step 4: Run tests**

Run: `cd backend && pytest tests/test_auth_jwt.py tests/test_auth_identity.py -v`  
Expected: PASS（identity 测试仍通过）

- [ ] **Step 5: Commit**

```bash
git add backend/app/auth/jwt.py backend/app/auth/tenant.py backend/tests/test_auth_jwt.py
git commit -m "feat: JWT create/decode with exp validation"
```

---

### Task 3: Users 表与 Store

**Files:**
- Create: `backend/migrations/005_users.sql`
- Create: `backend/app/auth/users_store.py`
- Modify: `backend/app/rag/db.py`
- Test: `backend/tests/test_users_store.py`

- [ ] **Step 1: Write migration**

```sql
-- backend/migrations/005_users.sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users (tenant_id);
```

- [ ] **Step 2: Write failing store test**

```python
# backend/tests/test_users_store.py
import pytest

from app.auth.passwords import hash_password
from app.auth.users_store import MemoryUsersStore


@pytest.mark.asyncio
async def test_create_and_get_by_email():
    store = MemoryUsersStore()
    user = await store.create(
        tenant_id="tenant-a",
        email="alice@example.com",
        password_hash=hash_password("secret"),
        display_name="Alice",
    )
    found = await store.get_by_email("alice@example.com")
    assert found is not None
    assert found.id == user.id
    assert found.tenant_id == "tenant-a"
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && pytest tests/test_users_store.py -v`  
Expected: FAIL with `ModuleNotFoundError`

- [ ] **Step 4: Implement store**

```python
# backend/app/auth/users_store.py
from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4

import asyncpg

from app.config import get_settings


@dataclass
class UserRecord:
    id: str
    tenant_id: str
    email: str
    password_hash: str
    display_name: str
    created_at: datetime


class MemoryUsersStore:
    def __init__(self) -> None:
        self._users: dict[str, UserRecord] = {}
        self._by_email: dict[str, str] = {}

    async def create(
        self,
        *,
        tenant_id: str,
        email: str,
        password_hash: str,
        display_name: str = "",
    ) -> UserRecord:
        normalized = email.strip().lower()
        if normalized in self._by_email:
            raise ValueError("email already registered")
        record = UserRecord(
            id=str(uuid4()),
            tenant_id=tenant_id,
            email=normalized,
            password_hash=password_hash,
            display_name=display_name,
            created_at=datetime.now(timezone.utc),
        )
        self._users[record.id] = record
        self._by_email[normalized] = record.id
        return record

    async def get_by_email(self, email: str) -> UserRecord | None:
        user_id = self._by_email.get(email.strip().lower())
        return self._users.get(user_id) if user_id else None

    async def get_by_id(self, user_id: str) -> UserRecord | None:
        return self._users.get(user_id)


class PostgresUsersStore:
    @property
    def _dsn(self) -> str:
        return get_settings().database_url

    async def create(
        self,
        *,
        tenant_id: str,
        email: str,
        password_hash: str,
        display_name: str = "",
    ) -> UserRecord:
        conn = await asyncpg.connect(self._dsn)
        try:
            row = await conn.fetchrow(
                "INSERT INTO users (tenant_id, email, password_hash, display_name) "
                "VALUES ($1, $2, $3, $4) "
                "RETURNING id, tenant_id, email, password_hash, display_name, created_at",
                tenant_id,
                email.strip().lower(),
                password_hash,
                display_name,
            )
            return _row_to_user(row)
        finally:
            await conn.close()

    async def get_by_email(self, email: str) -> UserRecord | None:
        conn = await asyncpg.connect(self._dsn)
        try:
            row = await conn.fetchrow(
                "SELECT id, tenant_id, email, password_hash, display_name, created_at "
                "FROM users WHERE email = $1",
                email.strip().lower(),
            )
            return _row_to_user(row) if row else None
        finally:
            await conn.close()

    async def get_by_id(self, user_id: str) -> UserRecord | None:
        conn = await asyncpg.connect(self._dsn)
        try:
            row = await conn.fetchrow(
                "SELECT id, tenant_id, email, password_hash, display_name, created_at "
                "FROM users WHERE id = $1::uuid",
                user_id,
            )
            return _row_to_user(row) if row else None
        finally:
            await conn.close()


def _row_to_user(row) -> UserRecord:
    return UserRecord(
        id=str(row["id"]),
        tenant_id=row["tenant_id"],
        email=row["email"],
        password_hash=row["password_hash"],
        display_name=row["display_name"],
        created_at=row["created_at"],
    )


UsersStore = MemoryUsersStore | PostgresUsersStore
```

- [ ] **Step 5: Wire migration in `backend/app/rag/db.py`**

在 `create_tables()` 内、`004_ragflow_bindings.sql` 之后追加：

```python
        if settings.tenant_mode:
            await conn.execute(_migration_sql("005_users.sql"))
```

- [ ] **Step 6: Run test**

Run: `cd backend && pytest tests/test_users_store.py -v`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend/migrations/005_users.sql backend/app/auth/users_store.py backend/app/rag/db.py backend/tests/test_users_store.py
git commit -m "feat: users table and memory/postgres store"
```

---

### Task 4: Auth API — login 与 me

**Files:**
- Create: `backend/app/api/routes/auth.py`
- Modify: `backend/app/config.py`
- Modify: `backend/app/main.py`
- Modify: `backend/tests/conftest.py`
- Test: `backend/tests/test_api_auth.py`

- [ ] **Step 1: Add config**

在 `backend/app/config.py` 的 `Settings` 中增加：

```python
    jwt_expires_minutes: int = 60 * 24 * 7  # 7 days
```

- [ ] **Step 2: Write failing API test**

```python
# backend/tests/test_api_auth.py
import pytest

from app.auth.passwords import hash_password


@pytest.fixture
def auth_client(test_app):
    from app.auth.users_store import MemoryUsersStore
    from app.api.routes import auth
    from fastapi.testclient import TestClient

    test_app.state.users_store = MemoryUsersStore()
    test_app.include_router(auth.router)
    return TestClient(test_app)


@pytest.mark.asyncio
async def test_login_success(auth_client, monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "login-secret")
    monkeypatch.setenv("TENANT_MODE", "true")
    from app.config import get_settings

    get_settings.cache_clear()
    store = auth_client.app.state.users_store
    await store.create(
        tenant_id="tenant-a",
        email="bob@example.com",
        password_hash=hash_password("pass1234"),
    )
    resp = auth_client.post(
        "/v1/auth/login",
        json={"email": "bob@example.com", "password": "pass1234"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["token_type"] == "bearer"
    assert data["access_token"]
    assert data["user"]["email"] == "bob@example.com"
    assert data["user"]["tenant_id"] == "tenant-a"
    get_settings.cache_clear()


def test_login_wrong_password(auth_client, monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "login-secret")
    from app.config import get_settings

    get_settings.cache_clear()
    import asyncio

    asyncio.run(
        auth_client.app.state.users_store.create(
            tenant_id="t",
            email="x@example.com",
            password_hash=hash_password("right"),
        )
    )
    resp = auth_client.post(
        "/v1/auth/login",
        json={"email": "x@example.com", "password": "wrong"},
    )
    assert resp.status_code == 401
    get_settings.cache_clear()
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd backend && pytest tests/test_api_auth.py::test_login_success -v`  
Expected: FAIL（route 404 或 module missing）

- [ ] **Step 4: Implement auth routes**

```python
# backend/app/api/routes/auth.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.auth.jwt import create_access_token
from app.auth.passwords import verify_password
from app.auth.tenant import get_user_id_from_request, get_tenant_id
from app.auth.users_store import UsersStore
from app.config import get_settings

router = APIRouter(prefix="/v1")


class LoginRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=8)


class UserOut(BaseModel):
    id: str
    email: str
    tenant_id: str
    display_name: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


def _users_store(request: Request) -> UsersStore:
    store = getattr(request.app.state, "users_store", None)
    if store is None:
        raise HTTPException(status_code=503, detail="users store unavailable")
    return store


@router.post("/auth/login", response_model=LoginResponse)
async def login(body: LoginRequest, request: Request) -> LoginResponse:
    settings = get_settings()
    if not settings.jwt_secret:
        raise HTTPException(status_code=503, detail="JWT_SECRET not configured")

    user = await _users_store(request).get_by_email(body.email)
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")

    expires_in = settings.jwt_expires_minutes * 60
    token = create_access_token(
        {
            "sub": user.id,
            "tenant_id": user.tenant_id,
            "email": user.email,
        },
        secret=settings.jwt_secret,
        expires_in_seconds=expires_in,
    )
    return LoginResponse(
        access_token=token,
        expires_in=expires_in,
        user=UserOut(
            id=user.id,
            email=user.email,
            tenant_id=user.tenant_id,
            display_name=user.display_name,
        ),
    )


@router.get("/auth/me", response_model=UserOut)
async def me(request: Request) -> UserOut:
    settings = get_settings()
    if not settings.jwt_secret:
        raise HTTPException(status_code=503, detail="JWT_SECRET not configured")

    tenant_id = get_tenant_id(request)
    user_id = get_user_id_from_request(request)
    if not tenant_id or not user_id:
        raise HTTPException(status_code=401, detail="authentication required")

    user = await _users_store(request).get_by_id(user_id)
    if user is None or user.tenant_id != tenant_id:
        raise HTTPException(status_code=401, detail="authentication required")

    return UserOut(
        id=user.id,
        email=user.email,
        tenant_id=user.tenant_id,
        display_name=user.display_name,
    )
```

- [ ] **Step 5: Wire main + lifespan + conftest**

`backend/app/main.py`：

```python
from app.api.routes import admin_ragflow, auth, chat, flows, health, rag, sessions, skills
from app.auth.users_store import MemoryUsersStore, PostgresUsersStore
```

在 memory lifespan 分支增加 `app.state.users_store = MemoryUsersStore()`；Postgres 分支 `app.state.users_store = PostgresUsersStore()`；fallback 分支同样 Memory。

```python
app.include_router(auth.router)
```

`backend/tests/conftest.py`：`test_app` 增加 `users_store` 与 `auth.router`（或在各测试 fixture 里 include，与上面 test 一致）。

- [ ] **Step 6: Run tests**

Run: `cd backend && pytest tests/test_api_auth.py -v`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add backend/app/api/routes/auth.py backend/app/config.py backend/app/main.py backend/tests/conftest.py backend/tests/test_api_auth.py
git commit -m "feat: POST /v1/auth/login and GET /v1/auth/me"
```

---

### Task 5: Admin 创建用户

**Files:**
- Modify: `backend/app/api/routes/auth.py`
- Test: extend `backend/tests/test_api_auth.py`

- [ ] **Step 1: Write failing test**

```python
def test_admin_create_user(auth_client, monkeypatch):
    monkeypatch.setenv("ADMIN_API_KEY", "admin-key")
    from app.config import get_settings

    get_settings.cache_clear()
    resp = auth_client.post(
        "/v1/admin/users",
        headers={"X-Admin-Key": "admin-key"},
        json={
            "tenant_id": "tenant-a",
            "email": "new@example.com",
            "password": "password123",
            "display_name": "New User",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["email"] == "new@example.com"
    get_settings.cache_clear()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && pytest tests/test_api_auth.py::test_admin_create_user -v`  
Expected: FAIL 404

- [ ] **Step 3: Add route**

在 `auth.py` 追加：

```python
from app.auth.passwords import hash_password
from app.auth.skill_admin import require_skill_admin


class CreateUserRequest(BaseModel):
    tenant_id: str = Field(min_length=1)
    email: str = Field(min_length=3)
    password: str = Field(min_length=8)
    display_name: str = ""


@router.post("/admin/users", status_code=201, response_model=UserOut)
async def admin_create_user(body: CreateUserRequest, request: Request) -> UserOut:
    require_skill_admin(request, tenant_id=None)
    try:
        user = await _users_store(request).create(
            tenant_id=body.tenant_id,
            email=body.email,
            password_hash=hash_password(body.password),
            display_name=body.display_name,
        )
    except ValueError:
        raise HTTPException(status_code=409, detail="email already registered") from None
    return UserOut(
        id=user.id,
        email=user.email,
        tenant_id=user.tenant_id,
        display_name=user.display_name,
    )
```

- [ ] **Step 4: Run tests**

Run: `cd backend && pytest tests/test_api_auth.py -v`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/app/api/routes/auth.py backend/tests/test_api_auth.py
git commit -m "feat: admin endpoint to create users"
```

---

### Task 6: 受保护 API 在 TENANT_MODE 下的集成测试

**Files:**
- Test: `backend/tests/test_api_auth.py`

- [ ] **Step 1: Write failing test**

```python
def test_sessions_require_jwt_when_tenant_mode(client, monkeypatch):
    monkeypatch.setenv("TENANT_MODE", "true")
    monkeypatch.setenv("JWT_SECRET", "s")
    from app.config import get_settings

    get_settings.cache_clear()
    resp = client.get("/v1/sessions")
    assert resp.status_code == 401
    get_settings.cache_clear()


def test_sessions_with_login_token(auth_client, monkeypatch):
    monkeypatch.setenv("TENANT_MODE", "true")
    monkeypatch.setenv("JWT_SECRET", "login-secret")
    from app.config import get_settings

    get_settings.cache_clear()
    import asyncio

    asyncio.run(
        auth_client.app.state.users_store.create(
            tenant_id="tenant-a",
            email="sess@example.com",
            password_hash=hash_password("password123"),
        )
    )
    login = auth_client.post(
        "/v1/auth/login",
        json={"email": "sess@example.com", "password": "password123"},
    )
    token = login.json()["access_token"]
    resp = auth_client.get(
        "/v1/sessions",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    get_settings.cache_clear()
```

- [ ] **Step 2: Run test**

Run: `cd backend && pytest tests/test_api_auth.py -v`  
Expected: PASS（现有 `TenantDep` 已生效；第二则验证端到端）

- [ ] **Step 3: Commit**

```bash
git add backend/tests/test_api_auth.py
git commit -m "test: login token unlocks tenant-protected sessions"
```

---

### Task 7: 前端 Auth Store

**Files:**
- Create: `fe/stores/useAuthStore.ts`
- Modify: `fe/types/index.ts`
- Test: `fe/tests/useAuthStore.test.ts`

- [ ] **Step 1: Add types**

```typescript
// fe/types/index.ts (append)
export interface AuthUser {
  id: string;
  email: string;
  tenant_id: string;
  display_name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}
```

- [ ] **Step 2: Write failing test**

```typescript
// fe/tests/useAuthStore.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "~/stores/useAuthStore";

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it("stores token after login", () => {
    const store = useAuthStore();
    store.setSession("tok-abc", {
      id: "u1",
      email: "a@b.com",
      tenant_id: "t1",
      display_name: "A",
    });
    expect(store.accessToken).toBe("tok-abc");
    expect(store.isAuthenticated).toBe(true);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd fe && pnpm test tests/useAuthStore.test.ts`  
Expected: FAIL module not found

- [ ] **Step 4: Implement store**

```typescript
// fe/stores/useAuthStore.ts
import { defineStore } from "pinia";
import type { AuthUser, LoginResponse } from "~/types";

const TOKEN_KEY = "auth:access_token";
const USER_KEY = "auth:user";

export const useAuthStore = defineStore("auth", () => {
  const config = useRuntimeConfig();
  const accessToken = ref<string | null>(null);
  const user = ref<AuthUser | null>(null);

  const isAuthenticated = computed(() => Boolean(accessToken.value));

  function loadFromStorage() {
    accessToken.value = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    user.value = raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  function setSession(token: string, authUser: AuthUser) {
    accessToken.value = token;
    user.value = authUser;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  }

  function clearSession() {
    accessToken.value = null;
    user.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function authHeaders(): Record<string, string> {
    if (!accessToken.value) return {};
    return { Authorization: `Bearer ${accessToken.value}` };
  }

  async function login(email: string, password: string): Promise<void> {
    const res = await fetch(`${config.public.apiBase}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const detail = (await res.json().catch(() => ({}))) as { detail?: string };
      throw new Error(detail.detail || `Login failed: ${res.status}`);
    }
    const data = (await res.json()) as LoginResponse;
    setSession(data.access_token, data.user);
  }

  async function fetchMe(): Promise<boolean> {
    if (!accessToken.value) return false;
    const res = await fetch(`${config.public.apiBase}/v1/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      clearSession();
      return false;
    }
    user.value = (await res.json()) as AuthUser;
    localStorage.setItem(USER_KEY, JSON.stringify(user.value));
    return true;
  }

  function logout() {
    clearSession();
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    loadFromStorage,
    setSession,
    clearSession,
    authHeaders,
    login,
    fetchMe,
    logout,
  };
});
```

- [ ] **Step 5: Run test**

Run: `cd fe && pnpm test tests/useAuthStore.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add fe/stores/useAuthStore.ts fe/types/index.ts fe/tests/useAuthStore.test.ts
git commit -m "feat(fe): Pinia auth store with token persistence"
```

---

### Task 8: useApiFetch 与 composables 注入 Authorization

**Files:**
- Create: `fe/composables/useApiFetch.ts`
- Modify: `fe/composables/useSessions.ts`, `useChat.ts`, `useRagDatasets.ts`, `useFlows.ts`, `useSkillsPicker.ts`

- [ ] **Step 1: Create composable**

```typescript
// fe/composables/useApiFetch.ts
import { useAuthStore } from "~/stores/useAuthStore";

export function useApiFetch() {
  const auth = useAuthStore();

  async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    const authHeader = auth.authHeaders();
    for (const [key, value] of Object.entries(authHeader)) {
      headers.set(key, value);
    }
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401 && auth.isAuthenticated) {
      auth.logout();
    }
    return res;
  }

  return { apiFetch };
}
```

- [ ] **Step 2: Update `useSessions.ts`（示例，其余 composable 同样替换 `fetch` → `apiFetch`）**

```typescript
// 在 useSessions 内：
const { apiFetch } = useApiFetch();

// load():
const res = await apiFetch(`${config.public.apiBase}/v1/sessions`);

// create/patch/delete 同样改用 apiFetch
```

对 `useChat.ts` 的 POST `/v1/chat` 同样注入 headers。

- [ ] **Step 3: Run frontend tests**

Run: `cd fe && pnpm test`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add fe/composables/useApiFetch.ts fe/composables/useSessions.ts fe/composables/useChat.ts fe/composables/useRagDatasets.ts fe/composables/useFlows.ts fe/composables/useSkillsPicker.ts
git commit -m "feat(fe): attach Bearer token to API requests"
```

---

### Task 9: 登录页与路由守卫

**Files:**
- Create: `fe/pages/login.vue`
- Create: `fe/middleware/auth.global.ts`
- Modify: `fe/app.vue`

- [ ] **Step 1: Login page**

```vue
<!-- fe/pages/login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <form class="w-full max-w-sm space-y-4" @submit.prevent="onSubmit">
      <h1 class="text-2xl font-semibold">Sign in</h1>
      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      <label class="block">
        <span class="text-sm">Email</span>
        <input v-model="email" type="email" required class="input w-full mt-1" />
      </label>
      <label class="block">
        <span class="text-sm">Password</span>
        <input v-model="password" type="password" required minlength="8" class="input w-full mt-1" />
      </label>
      <button type="submit" class="btn-primary w-full" :disabled="loading">
        {{ loading ? "Signing in…" : "Sign in" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const email = ref("");
const password = ref("");
const error = ref<string | null>(null);
const loading = ref(false);
const auth = useAuthStore();
const route = useRoute();

async function onSubmit() {
  loading.value = true;
  error.value = null;
  try {
    await auth.login(email.value, password.value);
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/";
    await navigateTo(redirect);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
</script>
```

- [ ] **Step 2: Global middleware**

```typescript
// fe/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  auth.loadFromStorage();

  if (to.path === "/login") {
    if (auth.isAuthenticated) return navigateTo("/");
    return;
  }

  if (!auth.isAuthenticated) {
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }

  if (!auth.user) {
    const ok = await auth.fetchMe();
    if (!ok) return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }
});
```

- [ ] **Step 3: Bootstrap auth on app mount**

```vue
<!-- fe/app.vue — script setup 增加 -->
<script setup lang="ts">
const auth = useAuthStore();
onMounted(() => auth.loadFromStorage());
</script>
```

- [ ] **Step 4: Manual smoke test**

1. 设置 `.env`：`TENANT_MODE=true`，`JWT_SECRET=dev-secret`，`ADMIN_API_KEY=dev-admin`
2. 创建用户：`curl -X POST http://localhost:8000/v1/admin/users -H 'X-Admin-Key: dev-admin' -H 'Content-Type: application/json' -d '{"tenant_id":"demo","email":"demo@example.com","password":"password123"}'`
3. `pnpm dev` → 访问 `/` 应跳转 `/login` → 登录后进入聊天

- [ ] **Step 5: Commit**

```bash
git add fe/pages/login.vue fe/middleware/auth.global.ts fe/app.vue
git commit -m "feat(fe): login page and auth route guard"
```

---

### Task 10: 配置文档与全量测试

**Files:**
- Modify: `.env.example`
- Modify: `backend/README.md`（Auth 小节）

- [ ] **Step 1: Update `.env.example`**

```bash
# Enable login + tenant isolation (required together in production)
TENANT_MODE=true
JWT_SECRET=change-me-in-production
JWT_EXPIRES_MINUTES=10080
ADMIN_API_KEY=change-me-admin

# Bootstrap first user (after API is up):
# curl -X POST http://localhost:8000/v1/admin/users \
#   -H 'X-Admin-Key: <ADMIN_API_KEY>' \
#   -H 'Content-Type: application/json' \
#   -d '{"tenant_id":"demo","email":"you@example.com","password":"password123","display_name":"You"}'
```

- [ ] **Step 2: Run full test suites**

Run: `cd backend && pytest -v`  
Expected: all pass

Run: `cd fe && pnpm test`  
Expected: all pass

- [ ] **Step 3: Commit**

```bash
git add .env.example backend/README.md
git commit -m "docs: login setup and env examples"
```

---

## 部署清单（生产 server `1.14.158.173`）

1. `.env` 设置 `TENANT_MODE=true`、`JWT_SECRET`（强随机）、`ADMIN_API_KEY`
2. 重建 API 容器使 migration `005_users.sql` 执行
3. Admin 创建用户 +（可选）`PUT /v1/admin/ragflow/bindings/{tenant_id}` 绑定 RAGFlow key
4. 前端构建时无需改 API base；用户浏览器持 JWT

---

## 验收标准

| 场景 | 期望 |
|------|------|
| `TENANT_MODE=false` | 现有 dev 行为不变；login 端点可用但 UI middleware 可配置跳过（V1：middleware 始终要求登录——本地 dev 设 `TENANT_MODE=true` 测登录） |
| 错误密码 | `401 invalid credentials` |
| 正确登录 | 返回 JWT；`GET /v1/auth/me` 返回用户 |
| 带 Token 调 `/v1/sessions` | `200` |
| 无 Token + `TENANT_MODE=true` | `401 tenant required` |
| 前端未登录访问 `/` | 重定向 `/login` |
| 登录后 chat / rag datasets | 请求带 `Authorization: Bearer …` |
| User 级 RAGFlow binding | JWT `sub` 与 binding `user_id` 一致时可检索 |

---

## Self-Review

**Spec coverage:** 邮箱密码登录、JWT、用户表、Admin 建用户、前端登录页与 Token 注入、与 tenant/RAGFlow 权限衔接 — 均已覆盖。OAuth/注册页/忘记密码 — 明确列为 V1 范围外。

**Placeholder scan:** 无 TBD；JWT 与 store 代码完整。

**Type consistency:** `UserOut` / `AuthUser` / JWT claims（`sub`, `tenant_id`, `email`）前后一致；`create_access_token(..., secret=..., expires_in_seconds=...)` 全计划统一。

---

## 后续（不在本 Plan）

- OAuth2 / 企业 SSO
- 自助注册、邮箱验证、重置密码
- Refresh token / 短 access + 长 refresh
- 登出黑名单（服务端 revoke）
- Electron 安全存储 Token（keytar）
