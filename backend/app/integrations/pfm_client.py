import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)


def provision_pfm_user(*, agent_user_id: str, email: str, display_name: str) -> None:
    settings = get_settings()
    if not settings.pfm_base_url or not settings.pfm_service_token:
        logger.debug("PFM provision skipped: PFM_BASE_URL or PFM_SERVICE_TOKEN not configured")
        return

    url = settings.pfm_base_url.rstrip("/") + "/internal/v1/users/provision"
    response = httpx.post(
        url,
        json={
            "agentUserId": agent_user_id,
            "email": email,
            "displayName": display_name,
        },
        headers={"Authorization": f"Bearer {settings.pfm_service_token}"},
        timeout=5.0,
    )
    response.raise_for_status()


def pfm_headers(access_token: str) -> dict[str, str]:
    settings = get_settings()
    headers = {"Authorization": f"Bearer {access_token}"}
    if settings.pfm_service_token:
        headers["X-Service-Token"] = settings.pfm_service_token
    return headers


def pfm_get(path: str, access_token: str, params: dict | None = None) -> dict:
    settings = get_settings()
    if not settings.pfm_base_url:
        raise RuntimeError("PFM_BASE_URL not configured")
    url = settings.pfm_base_url.rstrip("/") + path
    response = httpx.get(
        url,
        params=params or {},
        headers=pfm_headers(access_token),
        timeout=10.0,
    )
    response.raise_for_status()
    return response.json()


def pfm_post(path: str, access_token: str, payload: dict) -> dict:
    settings = get_settings()
    if not settings.pfm_base_url:
        raise RuntimeError("PFM_BASE_URL not configured")
    url = settings.pfm_base_url.rstrip("/") + path
    response = httpx.post(
        url,
        json=payload,
        headers=pfm_headers(access_token),
        timeout=10.0,
    )
    response.raise_for_status()
    return response.json()
