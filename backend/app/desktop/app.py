import json
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from app.agent.graphs.react_agent import build_react_graph
from app.config import Settings, get_settings
from app.llm.factory import get_chat_model

logger = logging.getLogger(__name__)


class LocalChatRequest(BaseModel):
    flow_id: str = "general-react"
    thread_id: str
    message: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    checkpointer = MemorySaver()
    app.state.graph = build_react_graph(checkpointer=checkpointer)
    logger.info("Desktop sidecar ready (LOCAL_MODE)")
    yield


def create_app(settings: Settings | None = None) -> FastAPI:
    if settings is None:
        settings = get_settings()

    app = FastAPI(title="Agent Flow Desktop Sidecar", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"status": "ok", "mode": "desktop"}

    @app.get("/v1/health/deepseek")
    async def health_deepseek():
        cfg = get_settings()
        if not cfg.deepseek_api_key:
            raise HTTPException(status_code=400, detail="DEEPSEEK_API_KEY not set")
        try:
            model = get_chat_model("deepseek", "deepseek-chat")
            await model.ainvoke([HumanMessage(content="ping")])
        except Exception as exc:
            raise HTTPException(
                status_code=502,
                detail=f"DeepSeek probe failed: {exc.__class__.__name__}",
            ) from exc
        return {"status": "ok", "provider": "deepseek"}

    @app.post("/v1/chat")
    async def chat(req: LocalChatRequest) -> EventSourceResponse:
        if req.flow_id != "general-react":
            raise HTTPException(status_code=400, detail=f"unknown flow_id: {req.flow_id}")

        graph = app.state.graph
        config = {"configurable": {"thread_id": f"{req.flow_id}:{req.thread_id}"}}
        state_input = {
            "messages": [HumanMessage(content=req.message)],
            "react_iteration": 0,
        }

        async def event_stream():
            async for event in graph.astream_events(state_input, config, version="v2"):
                kind = event["event"]
                if kind == "on_chat_model_stream":
                    chunk = event["data"]["chunk"]
                    if chunk.content:
                        yield {
                            "event": "message",
                            "data": json.dumps({"content": chunk.content}),
                        }
                elif kind == "on_tool_start":
                    yield {
                        "event": "tool_start",
                        "data": json.dumps(
                            {
                                "call_id": event.get("run_id", ""),
                                "name": event.get("name", ""),
                            }
                        ),
                    }
                elif kind == "on_tool_end":
                    yield {
                        "event": "tool_end",
                        "data": json.dumps(
                            {
                                "call_id": event.get("run_id", ""),
                                "name": event.get("name", ""),
                                "ok": True,
                            }
                        ),
                    }
            yield {"event": "done", "data": "{}"}

        return EventSourceResponse(event_stream())

    return app


app = create_app()
