import asyncio

import pytest

from app.auth.passwords import hash_password


@pytest.fixture
def auth_client(test_app):
    from app.api.routes import auth
    from app.auth.users_store import MemoryUsersStore
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
    asyncio.run(
        auth_client.app.state.users_store.create(
            tenant_id="t",
            email="x@example.com",
            password_hash=hash_password("right"),
        )
    )
    resp = auth_client.post(
        "/v1/auth/login",
        json={"email": "x@example.com", "password": "wrongpass"},
    )
    assert resp.status_code == 401
    get_settings.cache_clear()


def test_register_and_login(auth_client, monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "login-secret")
    from app.config import get_settings

    get_settings.cache_clear()
    resp = auth_client.post(
        "/v1/auth/register",
        json={
            "email": "new@example.com",
            "password": "password123",
            "display_name": "New User",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["access_token"]
    assert data["user"]["email"] == "new@example.com"
    assert data["user"]["tenant_id"] == "default"

    dup = auth_client.post(
        "/v1/auth/register",
        json={"email": "new@example.com", "password": "password123"},
    )
    assert dup.status_code == 409

    login = auth_client.post(
        "/v1/auth/login",
        json={"email": "new@example.com", "password": "password123"},
    )
    assert login.status_code == 200
    get_settings.cache_clear()


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
