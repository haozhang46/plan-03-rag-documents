import json

from fastapi import APIRouter, Request
from langchain_core.messages import HumanMessage
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.observability.langfuse import get_langfuse_client

router = APIRouter(prefix="/v1")


class ChatRequest(BaseModel):
    thread_id: str
    message: str
    document_ids: list[str] | None = None


def _build_config(request: Request):
    store = getattr(request.app.state, "store", None)
    return {"configurable": {"store": store}}


def _build_input(req: ChatRequest):
    state_input: dict = {"messages": [HumanMessage(content=req.message)]}
    if req.document_ids:
        state_input["document_ids"] = req.document_ids
    return state_input


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
async def chat(req: ChatRequest, request: Request) -> EventSourceResponse:
    graph = request.app.state.graph
    config = _build_config(request)
    state_input = _build_input(req)
    thread_config = {**config, "configurable": {**config.get("configurable", {}), "thread_id": req.thread_id}}

    async def event_stream():
        client = get_langfuse_client()
        if client:
            trace_id = client.create_trace_id()
            with client.start_as_current_observation(
                name=f"chat:{req.thread_id}",
                trace_id=trace_id,
            ) as span:
                full_content = ""
                async for chunk in _stream_tokens(graph, state_input, thread_config):
                    if "content" in chunk:
                        full_content += chunk["content"]
                        yield {"event": "message", "data": json.dumps(chunk)}
                    elif "citations" in chunk:
                        yield {"event": "message", "data": json.dumps(chunk)}
                span.update(output=full_content)
        else:
            async for chunk in _stream_tokens(graph, state_input, thread_config):
                yield {"event": "message", "data": json.dumps(chunk)}

        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_stream())
