from dataclasses import dataclass

import httpx

from app.config import get_settings


@dataclass
class WebSearchResult:
    title: str
    url: str
    snippet: str


class SearXNGClient:
    def __init__(
        self,
        base_url: str | None = None,
        timeout: float = 15.0,
    ):
        settings = get_settings()
        self._base_url = (base_url or settings.searxng_base_url).rstrip("/")
        self._timeout = timeout

    def search(
        self,
        query: str,
        top_k: int | None = None,
    ) -> list[WebSearchResult]:
        settings = get_settings()
        limit = top_k or settings.web_search_top_k
        params = {
            "q": query,
            "format": "json",
        }

        with httpx.Client(timeout=self._timeout) as client:
            resp = client.get(f"{self._base_url}/search", params=params)
            resp.raise_for_status()
            body = resp.json()

        rows = body.get("results") or []
        hits: list[WebSearchResult] = []
        for row in rows[:limit]:
            hits.append(
                WebSearchResult(
                    title=str(row.get("title", "")),
                    url=str(row.get("url", "")),
                    snippet=str(row.get("content") or row.get("snippet") or ""),
                )
            )
        return hits

    def health_check(self) -> bool:
        try:
            with httpx.Client(timeout=5.0) as client:
                resp = client.get(
                    f"{self._base_url}/search",
                    params={"q": "ping", "format": "json"},
                )
                return resp.status_code == 200
        except Exception:
            return False
