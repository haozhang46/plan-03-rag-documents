from unittest.mock import MagicMock, patch

from app.web.searxng_client import SearXNGClient


def test_search_parses_json_results():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "results": [
            {
                "title": "Example",
                "url": "https://example.com",
                "content": "snippet text",
            }
        ]
    }

    with patch("app.web.searxng_client.httpx.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.get.return_value = mock_resp
        mock_client_cls.return_value = mock_client

        client = SearXNGClient(base_url="http://localhost:8080")
        hits = client.search("test query", top_k=3)

    assert len(hits) == 1
    assert hits[0].title == "Example"
    assert hits[0].url == "https://example.com"
    assert hits[0].snippet == "snippet text"

    call_args = mock_client.get.call_args
    assert call_args[0][0] == "http://localhost:8080/search"
    assert call_args[1]["params"]["format"] == "json"


def test_health_check_true_on_200():
    mock_resp = MagicMock()
    mock_resp.status_code = 200

    with patch("app.web.searxng_client.httpx.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.get.return_value = mock_resp
        mock_client_cls.return_value = mock_client

        assert SearXNGClient(base_url="http://localhost:8080").health_check() is True
