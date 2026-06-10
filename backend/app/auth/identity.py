from dataclasses import dataclass

from starlette.requests import Request

from app.auth.tenant import get_tenant_id, get_user_id_from_request


@dataclass(frozen=True)
class RequestIdentity:
    tenant_id: str | None
    user_id: str | None


def get_request_identity(request: Request) -> RequestIdentity:
    return RequestIdentity(
        tenant_id=get_tenant_id(request),
        user_id=get_user_id_from_request(request),
    )
