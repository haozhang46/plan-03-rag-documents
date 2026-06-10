from fastapi import HTTPException, Request

from app.auth.identity import RequestIdentity
from app.config import get_ragflow_default_dataset_ids
from app.rag.access import RagAccessError, filter_allowed_dataset_ids
from app.rag.bindings_store import RagflowBindingsStore
from app.rag.credentials import resolve_ragflow_binding, resolve_ragflow_client
from app.rag.ragflow_client import RagFlowClient


async def authorize_rag_datasets(
    request: Request,
    *,
    flow_id: str,
    dataset_ids: list[str] | None,
    identity: RequestIdentity,
    store: RagflowBindingsStore,
) -> tuple[list[str] | None, RagFlowClient | None]:
    requested = list(dataset_ids or [])
    binding = await resolve_ragflow_binding(identity, store)
    defaults: list[str] = []
    if binding and binding.default_dataset_ids:
        defaults.extend(binding.default_dataset_ids)
    if flow_id == "rag-flow":
        defaults.extend(get_ragflow_default_dataset_ids())
    seen: set[str] = set()
    unique_defaults: list[str] = []
    for item in defaults:
        if item not in seen:
            seen.add(item)
            unique_defaults.append(item)

    if not requested and flow_id != "rag-flow" and not unique_defaults:
        return None, None

    client = await resolve_ragflow_client(identity, store)
    allowed = {d.id for d in client.list_datasets()}
    try:
        resolved = filter_allowed_dataset_ids(
            requested,
            allowed,
            defaults=unique_defaults if not requested else None,
        )
    except RagAccessError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    return resolved, client
