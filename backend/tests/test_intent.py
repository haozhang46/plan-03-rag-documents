from app.agent.intent import classify_web_search_intent, needs_web_search_heuristic


def test_needs_web_search_heuristic_for_current_info():
    assert needs_web_search_heuristic("今天的新闻有哪些")
    assert needs_web_search_heuristic("what is the latest Python release")


def test_needs_web_search_heuristic_false_for_general_chat():
    assert not needs_web_search_heuristic("hello")
    assert not needs_web_search_heuristic("什么是 TDD")


def test_classify_web_search_intent_uses_llm(monkeypatch):
    from app.agent.models.intent import WebSearchIntentOutput

    class _FakeStructured:
        def invoke(self, _messages):
            return WebSearchIntentOutput(
                use_web_search=True,
                reasoning="needs live news",
            )

    class _FakeLLM:
        def with_structured_output(self, _schema):
            return _FakeStructured()

    monkeypatch.setenv("WEB_SEARCH_INTENT_MODE", "llm")
    from app.config import get_settings

    get_settings.cache_clear()
    monkeypatch.setattr("app.agent.intent.get_chat_model", lambda: _FakeLLM())

    use, reason = classify_web_search_intent("anything")
    assert use is True
    assert reason == "needs live news"
    get_settings.cache_clear()


def test_classify_web_search_intent_falls_back_on_llm_error(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_INTENT_MODE", "llm")

    def _boom():
        raise RuntimeError("no api key")

    from app.config import get_settings

    get_settings.cache_clear()
    monkeypatch.setattr("app.agent.intent.get_chat_model", _boom)

    use, reason = classify_web_search_intent("今天的新闻")
    assert use is True
    assert "fallback" in reason.lower()
    get_settings.cache_clear()


def test_classify_web_search_intent_heuristic_mode(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_INTENT_MODE", "heuristic")
    from app.config import get_settings

    get_settings.cache_clear()
    use, reason = classify_web_search_intent("hello")
    assert use is False
    assert reason == "heuristic=False"
    get_settings.cache_clear()
