import base64
import binascii
import hashlib
import hmac
import json
from typing import Annotated

from fastapi import Depends, HTTPException, Request

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

    return _tenant_id_from_jwt(token, secret)


def _tenant_id_from_jwt(token: str, secret: str) -> str | None:
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
    except ValueError:
        return None

    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected_sig = hmac.new(
        secret.encode(),
        signing_input,
        hashlib.sha256,
    ).digest()
    padding = "=" * (-len(signature_b64) % 4)
    try:
        actual_sig = base64.urlsafe_b64decode(signature_b64 + padding)
    except (ValueError, binascii.Error):
        return None
    if not hmac.compare_digest(expected_sig, actual_sig):
        return None

    payload_padding = "=" * (-len(payload_b64) % 4)
    try:
        payload = json.loads(
            base64.urlsafe_b64decode(payload_b64 + payload_padding).decode()
        )
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
        return None

    tenant_id = payload.get("tenant_id")
    return str(tenant_id) if tenant_id else None


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
