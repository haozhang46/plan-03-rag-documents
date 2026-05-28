import json

from fastapi import APIRouter, Request
from langchain_core.messages import HumanMessage
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

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
