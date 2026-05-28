from app.config import get_settings
from app.observability.langfuse import get_langfuse_client


def test_handler_returns_none_when_disabled(monkeypatch):
    monkeypatch.setenv("LANGFUSE_ENABLED", "false")
    get_settings.cache_clear()
    client = get_langfuse_client()
    assert client is None


def test_handler_returns_client_when_enabled(monkeypatch):
    monkeypatch.setenv("LANGFUSE_ENABLED", "true")
    monkeypatch.setenv("LANGFUSE_PUBLIC_KEY", "pk-test")
    monkeypatch.setenv("LANGFUSE_SECRET_KEY", "sk-test")
    get_settings.cache_clear()
    client = get_langfuse_client()
    assert client is not None
