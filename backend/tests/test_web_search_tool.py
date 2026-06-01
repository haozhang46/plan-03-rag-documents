import pytest

from app.config import get_settings


@pytest.fixture(autouse=True)
def _clear_settings_cache():
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_mock_provider_returns_results(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_PROVIDER", "mock")
    from app.agent.tools.web_search import web_search

    results = web_search("python asyncio")

    assert len(results) >= 1
    assert all(set(r.keys()) == {"title", "url", "snippet"} for r in results)
    assert all(isinstance(r["title"], str) for r in results)
    assert all(isinstance(r["url"], str) for r in results)
    assert all(isinstance(r["snippet"], str) for r in results)


def test_mock_provider_empty_query_returns_empty(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_PROVIDER", "mock")
    from app.agent.tools.web_search import web_search

    assert web_search("") == []
    assert web_search("   ") == []


def test_tavily_provider_calls_api(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_PROVIDER", "tavily")
    monkeypatch.setenv("TAVILY_API_KEY", "test-key")
    captured: dict = {}

    class FakeResponse:
        def raise_for_status(self) -> None:
            pass

        def json(self) -> dict:
            return {
                "results": [
                    {
                        "title": "Asyncio Guide",
                        "url": "https://example.com/asyncio",
                        "content": "Learn asyncio in Python.",
                    }
                ]
            }

    def fake_post(url: str, json: dict | None = None, timeout: float | None = None):
        captured["url"] = url
        captured["json"] = json
        return FakeResponse()

    monkeypatch.setattr("app.agent.tools.web_search.httpx.post", fake_post)
    from app.agent.tools.web_search import web_search

    results = web_search("python asyncio", max_results=3)

    assert captured["url"] == "https://api.tavily.com/search"
    assert captured["json"] == {
        "api_key": "test-key",
        "query": "python asyncio",
        "max_results": 3,
    }
    assert results == [
        {
            "title": "Asyncio Guide",
            "url": "https://example.com/asyncio",
            "snippet": "Learn asyncio in Python.",
        }
    ]


def test_tavily_without_key_raises(monkeypatch):
    monkeypatch.setenv("WEB_SEARCH_PROVIDER", "tavily")
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)
    from app.agent.tools.web_search import web_search

    with pytest.raises(ValueError, match="tavily_api_key"):
        web_search("test query")
