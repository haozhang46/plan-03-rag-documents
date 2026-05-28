import json

from fastapi import APIRouter, Request
from langchain_core.messages import HumanMessage
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/v1")


class ChatRequest(BaseModel):
    thread_id: str
    message: str


@router.post("/chat")
async def chat(req: ChatRequest, request: Request) -> EventSourceResponse:
    graph = request.app.state.graph
    config = {"configurable": {"thread_id": req.thread_id}}

    async def event_stream():
        result = graph.invoke(
            {"messages": [HumanMessage(content=req.message)]},
            config,
        )
        last = result["messages"][-1]
        yield {
            "event": "message",
            "data": json.dumps({"content": last.content}),
        }
        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_stream())
