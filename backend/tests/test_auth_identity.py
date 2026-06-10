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
