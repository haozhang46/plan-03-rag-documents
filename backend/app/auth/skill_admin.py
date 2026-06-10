from fastapi import HTTPException, Request

from app.config import get_settings

_ADMIN_HEADER = "X-Admin-Key"


def require_skill_admin(request: Request, tenant_id: str | None) -> None:
    settings = get_settings()
    admin_key = request.headers.get(_ADMIN_HEADER)
    if settings.admin_api_key and admin_key == settings.admin_api_key:
        return

    if tenant_id:
        return

    raise HTTPException(status_code=403, detail="admin or tenant required")


def require_skill_write(
    request: Request,
    tenant_id: str | None,
    *,
    visibility: str,
    target_tenant_id: str | None = None,
) -> None:
    settings = get_settings()
    admin_key = request.headers.get(_ADMIN_HEADER)
    if settings.admin_api_key and admin_key == settings.admin_api_key:
        return

    if visibility == "private" and tenant_id and tenant_id == target_tenant_id:
        return

    if visibility == "public" and tenant_id and not settings.tenant_mode:
        return

    raise HTTPException(status_code=403, detail="admin or tenant owner required")
