from fastapi import HTTPException

from app.auth.identity import RequestIdentity
from app.config import get_settings
from app.rag.bindings_store import RagflowBindingsStore
from app.rag.ragflow_client import RagFlowClient


async def resolve_ragflow_client(
    identity: RequestIdentity,
    store: RagflowBindingsStore,
) -> RagFlowClient:
    settings = get_settings()
    binding = None
    if identity.tenant_id:
        binding = await store.get(identity.tenant_id, identity.user_id)
    if binding:
        return RagFlowClient(api_key=binding.api_key)
    if settings.ragflow_api_key:
        return RagFlowClient()
    raise HTTPException(status_code=503, detail="RAGFlow credentials not configured")


async def resolve_ragflow_binding(
    identity: RequestIdentity,
    store: RagflowBindingsStore,
):
    if not identity.tenant_id:
        return None
    return await store.get(identity.tenant_id, identity.user_id)
