import pytest

from app.config import Settings, get_settings
from app.llm.factory import get_chat_model


def test_get_chat_model_openai(monkeypatch):
    get_settings.cache_clear()
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")
    monkeypatch.setenv("DEFAULT_LLM_PROVIDER", "openai")
    monkeypatch.setenv("DEFAULT_MODEL", "gpt-4o-mini")
    get_settings.cache_clear()

    model = get_chat_model("openai", "gpt-4o-mini")
    assert model.model_name == "gpt-4o-mini"


def test_unknown_provider_raises():
    get_settings.cache_clear()
    with pytest.raises(ValueError, match="Unknown provider"):
        get_chat_model("invalid", "x")
