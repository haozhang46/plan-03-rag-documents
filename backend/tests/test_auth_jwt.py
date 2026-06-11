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
