from datetime import datetime

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from app.auth.tenant import TenantDep

router = APIRouter(prefix="/v1")


class SessionOut(BaseModel):
    id: str
    thread_id: str
    title: str
    starred: bool
    created_at: datetime
    updated_at: datetime


class CreateSessionRequest(BaseModel):
    title: str = "New Chat"
    thread_id: str | None = None


class UpdateSessionRequest(BaseModel):
    title: str | None = None
    starred: bool | None = None


def _get_store(request: Request):
    store = getattr(request.app.state, "session_store", None)
    if store is None:
        raise HTTPException(status_code=503, detail="session store unavailable")
    return store


@router.get("/sessions", response_model=list[SessionOut])
async def list_sessions(request: Request, tenant_id: TenantDep) -> list[SessionOut]:
    store = _get_store(request)
    records = await store.list_sessions(tenant_id=tenant_id)
    return [SessionOut(**r.to_dict()) for r in records]


@router.post("/sessions", response_model=SessionOut)
async def create_session(
    body: CreateSessionRequest, request: Request, tenant_id: TenantDep
) -> SessionOut:
    store = _get_store(request)
    record = await store.create(
        title=body.title, thread_id=body.thread_id, tenant_id=tenant_id
    )
    return SessionOut(**record.to_dict())


@router.delete("/sessions/{session_id}", status_code=204)
async def delete_session(
    session_id: str, request: Request, tenant_id: TenantDep
) -> None:
    store = _get_store(request)
    if not await store.delete(session_id, tenant_id=tenant_id):
        raise HTTPException(status_code=404, detail="session not found")


@router.patch("/sessions/{session_id}", response_model=SessionOut)
async def update_session(
    session_id: str,
    body: UpdateSessionRequest,
    request: Request,
    tenant_id: TenantDep,
) -> SessionOut:
    store = _get_store(request)
    record = await store.update(
        session_id,
        title=body.title,
        starred=body.starred,
        tenant_id=tenant_id,
    )
    if not record:
        raise HTTPException(status_code=404, detail="session not found")
    return SessionOut(**record.to_dict())
