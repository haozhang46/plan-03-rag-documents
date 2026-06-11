from typing import Annotated

from fastapi import Depends, HTTPException, Request

from app.auth.jwt import decode_jwt_payload
from app.config import get_settings

_TENANT_HEADER = "X-Tenant-ID"


def get_tenant_id(request: Request) -> str | None:
    header = request.headers.get(_TENANT_HEADER)
    if header:
        return header.strip()

    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None

    token = auth[7:].strip()
    secret = get_settings().jwt_secret
    if not secret or not token:
        return None

    payload = decode_jwt_payload(token, secret)
    if not payload:
        return None
    tenant_id = payload.get("tenant_id")
    return str(tenant_id) if tenant_id else None


def get_user_id_from_request(request: Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    secret = get_settings().jwt_secret
    if not secret:
        return None
    payload = decode_jwt_payload(auth[7:].strip(), secret)
    if not payload:
        return None
    for key in ("sub", "user_id"):
        if payload.get(key):
            return str(payload[key])
    return None


async def require_tenant(request: Request) -> str | None:
    settings = get_settings()
    if not settings.tenant_mode:
        return None

    tenant_id = get_tenant_id(request)
    if not tenant_id:
        raise HTTPException(status_code=401, detail="tenant required")

    request.state.tenant_id = tenant_id
    return tenant_id


TenantDep = Annotated[str | None, Depends(require_tenant)]
