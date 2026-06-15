from unittest.mock import MagicMock

import httpx

from app.config import get_settings
from app.integrations.pfm_client import provision_pfm_user


def test_provision_user_posts_to_pfm(monkeypatch):
    monkeypatch.setenv("PFM_BASE_URL", "http://pfm.test")
    monkeypatch.setenv("PFM_SERVICE_TOKEN", "svc-token")
    get_settings.cache_clear()

    captured: dict = {}

    def fake_post(url, **kwargs):
        captured["url"] = url
        captured["kwargs"] = kwargs
        response = MagicMock()
        response.raise_for_status = MagicMock()
        return response

    monkeypatch.setattr(httpx, "post", fake_post)

    provision_pfm_user(agent_user_id="u1", email="a@b.com", display_name="Alice")

    assert captured["url"] == "http://pfm.test/internal/v1/users/provision"
    assert captured["kwargs"]["json"]["agentUserId"] == "u1"
    assert captured["kwargs"]["headers"]["Authorization"] == "Bearer svc-token"

    get_settings.cache_clear()
