from fastapi import APIRouter, HTTPException, Request

from app.auth.identity import get_request_identity
from app.auth.tenant import TenantDep
from app.config import get_settings
from app.rag.bindings_store import RagflowBindingsStore
from app.rag.credentials import resolve_ragflow_client

router = APIRouter(prefix="/v1")


def _store(request: Request) -> RagflowBindingsStore:
    store = getattr(request.app.state, "ragflow_bindings_store", None)
    if store is None:
        raise HTTPException(status_code=503, detail="bindings store unavailable")
    return store


@router.get("/rag/datasets")
async def list_rag_datasets(request: Request, tenant_id: TenantDep):
    if get_settings().tenant_mode and not tenant_id:
        raise HTTPException(status_code=401, detail="tenant required")
    ident = get_request_identity(request)
    client = await resolve_ragflow_client(ident, _store(request))
    rows = client.list_datasets()
    return {
        "datasets": [
            {"id": d.id, "name": d.name, "permission": d.permission}
            for d in rows
        ]
    }
