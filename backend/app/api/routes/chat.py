import json

from fastapi import APIRouter, HTTPException, Request
from langchain_core.messages import HumanMessage
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.auth.identity import get_request_identity
from app.auth.tenant import TenantDep
from app.audit.store import write_audit
from app.observability.langfuse import get_langfuse_client
from app.rag.authorize import authorize_rag_datasets
from app.rag.bindings_store import RagflowBindingsStore
from app.skills.resolve import resolve_skill_names, validate_skill_names

router = APIRouter(prefix="/v1")


class ChatRequest(BaseModel):
    flow_id: str = "default"
    thread_id: str
    message: str
    skill_names: list[str] | None = None
    document_ids: list[str] | None = None
    dataset_ids: list[str] | None = None
    use_web_search: bool | None = None


def _checkpoint_thread_id(flow_id: str, client_thread_id: str) -> str:
    return f"{flow_id}:{client_thread_id}"


def _bindings_store(request: Request) -> RagflowBindingsStore | None:
    return getattr(request.app.state, "ragflow_bindings_store", None)


def _build_config(
    request: Request,
    flow_id: str,
    client_thread_id: str,
    ragflow_client=None,
):
    configurable = {
        "thread_id": _checkpoint_thread_id(flow_id, client_thread_id),
    }
    if ragflow_client is not None:
        configurable["ragflow_client"] = ragflow_client
    return {"configurable": configurable}


def _build_input(req: ChatRequest, explicit_skill_names: list[str] | None):
    state_input: dict = {"messages": [HumanMessage(content=req.message)]}
    if req.document_ids:
        state_input["document_ids"] = req.document_ids
    if req.dataset_ids:
        state_input["dataset_ids"] = req.dataset_ids
    if req.use_web_search is not None:
        state_input["use_web_search"] = req.use_web_search
    if explicit_skill_names is not None:
        state_input["explicit_skill_names"] = explicit_skill_names
    return state_input


def _resolve_graph(request: Request, flow_id: str):
    registry = request.app.state.graph_registry
    try:
        return registry.get(flow_id), registry.get_spec(flow_id)
    except KeyError:
        raise HTTPException(
            status_code=400,
            detail=f"unknown flow_id: {flow_id}",
        )


async def _stream_tokens(graph, state_input, config):
    """Yield token-level SSE chunks and return final citations."""
    citations: list[str] | None = None
    async for event in graph.astream_events(state_input, config, version="v2"):
        kind = event["event"]
        if kind == "on_chat_model_stream":
            chunk = event["data"]["chunk"]
            if chunk.content:
                yield {"content": chunk.content}
        elif kind == "on_chain_end" and event["name"] == "LangGraph":
            output = event["data"].get("output", {})
            if isinstance(output, dict):
                citations = output.get("citations")
    if citations:
        yield {"citations": citations}


@router.post("/chat")
async def chat(
    req: ChatRequest, request: Request, tenant_id: TenantDep
) -> EventSourceResponse:
    graph, flow_spec = _resolve_graph(request, req.flow_id)

    explicit_skill_names = resolve_skill_names(
        req.skill_names, flow_spec.default_skill_names
    )
    if explicit_skill_names is not None:
        try:
            validate_skill_names(explicit_skill_names)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc))

    identity = get_request_identity(request)
    ragflow_client = None
    store = _bindings_store(request)
    resolved_dataset_ids: list[str] | None = None
    if store is not None:
        resolved_dataset_ids, ragflow_client = await authorize_rag_datasets(
            request,
            flow_id=req.flow_id,
            dataset_ids=req.dataset_ids,
            identity=identity,
            store=store,
        )
        if resolved_dataset_ids is not None:
            req = req.model_copy(update={"dataset_ids": resolved_dataset_ids})

    config = _build_config(
        request, req.flow_id, req.thread_id, ragflow_client=ragflow_client
    )
    state_input = _build_input(req, explicit_skill_names)

    audit_details = {
        "message_length": len(req.message),
        "flow_id": req.flow_id,
    }
    if resolved_dataset_ids:
        audit_details["dataset_ids"] = resolved_dataset_ids

    await write_audit(
        request,
        action="chat",
        resource_type="thread",
        resource_id=req.thread_id,
        details=audit_details,
    )

    async def event_stream():
        client = get_langfuse_client()
        trace_name = f"chat:{req.flow_id}:{req.thread_id}"
        if client:
            trace_id = client.create_trace_id()
            with client.start_as_current_observation(
                name=trace_name,
                trace_id=trace_id,
            ) as span:
                full_content = ""
                async for chunk in _stream_tokens(graph, state_input, config):
                    if "content" in chunk:
                        full_content += chunk["content"]
                        yield {"event": "message", "data": json.dumps(chunk)}
                    elif "citations" in chunk:
                        yield {"event": "message", "data": json.dumps(chunk)}
                span.update(output=full_content)
        else:
            async for chunk in _stream_tokens(graph, state_input, config):
                yield {"event": "message", "data": json.dumps(chunk)}

        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_stream())
