from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.auth.skill_admin import require_skill_admin
from app.rag.bindings_store import RagflowBindingsStore

router = APIRouter(prefix="/v1")


class UpsertBindingRequest(BaseModel):
    api_key: str = Field(min_length=8)
    default_dataset_ids: list[str] = Field(default_factory=list)
    user_id: str | None = None


def _mask_key(key: str) -> str:
    if len(key) <= 6:
        return "…"
    return f"{key[:3]}…{key[-3:]}"


def _store(request: Request) -> RagflowBindingsStore:
    store = getattr(request.app.state, "ragflow_bindings_store", None)
    if store is None:
        raise HTTPException(status_code=503, detail="bindings store unavailable")
    return store


@router.put("/admin/ragflow/bindings/{tenant_id}")
async def upsert_binding(
    tenant_id: str, body: UpsertBindingRequest, request: Request
):
    require_skill_admin(request, tenant_id=None)
    row = await _store(request).upsert(
        tenant_id, body.user_id, body.api_key, body.default_dataset_ids
    )
    return {
        "tenant_id": row.tenant_id,
        "user_id": row.user_id,
        "api_key_hint": _mask_key(row.api_key),
        "default_dataset_ids": row.default_dataset_ids,
    }
