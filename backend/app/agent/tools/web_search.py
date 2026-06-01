import httpx

from app.config import get_settings

_MOCK_RESULTS: list[dict[str, str]] = [
    {
        "title": "Mock Search Result 1",
        "url": "https://example.com/mock-1",
        "snippet": "First fixed mock result for local development and tests.",
    },
    {
        "title": "Mock Search Result 2",
        "url": "https://example.com/mock-2",
        "snippet": "Second fixed mock result for local development and tests.",
    },
    {
        "title": "Mock Search Result 3",
        "url": "https://example.com/mock-3",
        "snippet": "Third fixed mock result for local development and tests.",
    },
]

_TAVILY_SEARCH_URL = "https://api.tavily.com/search"


def web_search(query: str, max_results: int | None = None) -> list[dict]:
    normalized_query = query.strip()
    if not normalized_query:
        return []

    settings = get_settings()
    limit = max_results if max_results is not None else settings.web_search_max_results

    if settings.web_search_provider == "mock":
        return _MOCK_RESULTS[:limit]

    if settings.web_search_provider == "tavily":
        if not settings.tavily_api_key:
            raise ValueError(
                "tavily_api_key is required when web_search_provider is 'tavily'"
            )
        response = httpx.post(
            _TAVILY_SEARCH_URL,
            json={
                "api_key": settings.tavily_api_key,
                "query": normalized_query,
                "max_results": limit,
            },
            timeout=30.0,
        )
        response.raise_for_status()
        payload = response.json()
        return [
            {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "snippet": item.get("content", item.get("snippet", "")),
            }
            for item in payload.get("results", [])
        ]

    raise ValueError(f"unknown web_search_provider: {settings.web_search_provider!r}")
