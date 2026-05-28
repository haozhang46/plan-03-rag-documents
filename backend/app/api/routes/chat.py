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


@router.post("/chat")
async def chat(req: ChatRequest, request: Request) -> EventSourceResponse:
    graph = request.app.state.graph
    store = getattr(request.app.state, "store", None)
    config = {
        "configurable": {
            "thread_id": req.thread_id,
            "store": store,
        }
    }

    async def event_stream():
        state_input: dict = {"messages": [HumanMessage(content=req.message)]}
        if req.document_ids:
            state_input["document_ids"] = req.document_ids

        client = get_langfuse_client()
        if client:
            trace_id = client.create_trace_id()
            with client.start_as_current_observation(
                name=f"chat:{req.thread_id}",
                trace_id=trace_id,
            ) as span:
                result = graph.invoke(state_input, config)
                last = result["messages"][-1]
                span.update(output=last.content)
        else:
            result = graph.invoke(state_input, config)

        last = result["messages"][-1]
        payload: dict = {"content": last.content}
        citations = result.get("citations")
        if citations:
            payload["citations"] = citations
        yield {
            "event": "message",
            "data": json.dumps(payload),
        }
        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_stream())
