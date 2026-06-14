from unittest.mock import MagicMock

import httpx

from app.agent.tools.finance.pfm_tools import build_finance_tools


def test_get_finance_context_calls_pfm(monkeypatch):
    monkeypatch.setenv("PFM_BASE_URL", "http://pfm.test")
    monkeypatch.setenv("PFM_SERVICE_TOKEN", "svc-token")

    captured: dict = {}

    def fake_get(url, **kwargs):
        captured["url"] = url
        captured["headers"] = kwargs.get("headers")
        response = MagicMock()
        response.raise_for_status = MagicMock()
        response.json = MagicMock(
            return_value={
                "period": {"startDate": "2026-04-01", "endDate": "2026-04-26"},
                "highlights": [],
                "dailySnapshots": [],
            }
        )
        return response

    monkeypatch.setattr(httpx, "get", fake_get)

    tools = build_finance_tools("user-token")
    tool = next(item for item in tools if item.name == "get_finance_context")
    result = tool.invoke({"start_date": "2026-04-01", "end_date": "2026-04-26"})

    assert "2026-04-01" in result
    assert captured["url"] == "http://pfm.test/internal/v1/finance-context"
    assert captured["headers"]["Authorization"] == "Bearer user-token"
    assert captured["headers"]["X-Service-Token"] == "svc-token"
