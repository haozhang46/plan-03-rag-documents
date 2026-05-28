import json

from fastapi import APIRouter, Request
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

router = APIRouter(prefix="/v1")


class ChatRequest(BaseModel):
    thread_id: str
    message: str
    document_ids: list[str] = Field(default_factory=list)


@router.post("/chat")
async def chat(req: ChatRequest, request: Request) -> EventSourceResponse:
    graph = request.app.state.graph
    config = {"configurable": {"thread_id": req.thread_id}}

    async def event_stream():
        result = await graph.ainvoke(
            {
                "messages": [HumanMessage(content=req.message)],
                "document_ids": req.document_ids,
            },
            config,
        )
        last = result["messages"][-1]
        yield {
            "event": "message",
            "data": json.dumps(
                {
                    "content": last.content,
                    "citations": result.get("citations") or [],
                }
            ),
        }
        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_stream())
