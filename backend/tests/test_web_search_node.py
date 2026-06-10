from unittest.mock import patch

from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.nodes.web_search import web_search_node
from app.web.searxng_client import WebSearchResult


def test_web_search_node_noop_when_disabled(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_ENABLED", "false")
    from app.config import get_settings

    get_settings.cache_clear()
    state = {"messages": [HumanMessage(content="latest news")]}
    assert web_search_node(state, {"configurable": {}}) == {}
    get_settings.cache_clear()


def test_web_search_node_noop_when_intent_false(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_ENABLED", "true")
    from app.config import get_settings

    get_settings.cache_clear()
    state = {
        "messages": [HumanMessage(content="latest news")],
        "use_web_search": False,
    }
    assert web_search_node(state, {"configurable": {}}) == {}
    get_settings.cache_clear()


def test_web_search_node_injects_web_results(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_ENABLED", "true")
    from app.config import get_settings

    get_settings.cache_clear()

    fake_hits = [
        WebSearchResult(
            title="Result A",
            url="https://a.example",
            snippet="snippet A",
        )
    ]

    with patch("app.agent.nodes.web_search.SearXNGClient") as mock_cls:
        mock_cls.return_value.search.return_value = fake_hits
        out = web_search_node(
            {
                "messages": [HumanMessage(content="what is new?")],
                "use_web_search": True,
            },
            {"configurable": {}},
        )

    assert out["web_sources"] == ["https://a.example"]
    msg = out["messages"][0]
    assert isinstance(msg, SystemMessage)
    assert "<web_results>" in msg.content
    assert "Result A" in msg.content
    get_settings.cache_clear()


def test_web_search_node_swallows_errors(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_ENABLED", "true")
    from app.config import get_settings

    get_settings.cache_clear()

    with patch("app.agent.nodes.web_search.SearXNGClient") as mock_cls:
        mock_cls.return_value.search.side_effect = RuntimeError("down")
        out = web_search_node(
            {
                "messages": [HumanMessage(content="query")],
                "use_web_search": True,
            },
            {"configurable": {}},
        )

    assert out == {}
    get_settings.cache_clear()
