from app.agent.routing import route_after_rag


def test_route_after_rag_skips_web_when_intent_false(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_ENABLED", "true")
    from app.config import get_settings

    get_settings.cache_clear()
    assert route_after_rag({"use_web_search": False}) == "chat"
    get_settings.cache_clear()


def test_route_after_rag_uses_web_when_intent_true(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_ENABLED", "true")
    from app.config import get_settings

    get_settings.cache_clear()
    assert route_after_rag({"use_web_search": True}) == "web"
    get_settings.cache_clear()
