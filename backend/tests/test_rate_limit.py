import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.routes import sessions
from app.config import get_settings
from app.middleware.rate_limit import SlidingWindowRateLimiter, reset_rate_limiter
from app.sessions.store import MemorySessionStore


@pytest.fixture(autouse=True)
def _clear_rate_limit_settings(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_RPM", "60")
    get_settings.cache_clear()
    reset_rate_limiter()
    yield
    get_settings.cache_clear()
    reset_rate_limiter()


def test_sliding_window_allows_under_limit():
    limiter = SlidingWindowRateLimiter(rpm=3)
    assert limiter.check("tenant-a") is True
    assert limiter.check("tenant-a") is True
    assert limiter.check("tenant-a") is True


def test_sliding_window_blocks_over_limit():
    limiter = SlidingWindowRateLimiter(rpm=2)
    assert limiter.check("tenant-a") is True
    assert limiter.check("tenant-a") is True
    assert limiter.check("tenant-a") is False


def test_sliding_window_isolates_tenants():
    limiter = SlidingWindowRateLimiter(rpm=1)
    assert limiter.check("tenant-a") is True
    assert limiter.check("tenant-b") is True
    assert limiter.check("tenant-a") is False
    assert limiter.check("tenant-b") is False


def test_rate_limit_middleware_returns_429(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_RPM", "2")
    get_settings.cache_clear()
    reset_rate_limiter()

    app = FastAPI()
    app.state.session_store = MemorySessionStore()
    app.include_router(sessions.router)

    from app.middleware.rate_limit import RateLimitMiddleware

    app.add_middleware(RateLimitMiddleware)

    client = TestClient(app)
    headers = {"X-Tenant-ID": "rpm-tenant"}

    assert client.post("/v1/sessions", json={}, headers=headers).status_code == 200
    assert client.post("/v1/sessions", json={}, headers=headers).status_code == 200
    resp = client.post("/v1/sessions", json={}, headers=headers)
    assert resp.status_code == 429
    assert "rate limit" in resp.json()["detail"].lower()


def test_rate_limit_disabled_when_rpm_zero(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_RPM", "0")
    get_settings.cache_clear()
    reset_rate_limiter()

    app = FastAPI()
    app.state.session_store = MemorySessionStore()
    app.include_router(sessions.router)

    from app.middleware.rate_limit import RateLimitMiddleware

    app.add_middleware(RateLimitMiddleware)

    client = TestClient(app)
    for _ in range(5):
        assert client.post("/v1/sessions", json={}).status_code == 200
