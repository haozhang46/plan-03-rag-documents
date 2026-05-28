import pytest
from fastapi import FastAPI
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graph import build_graph
from app.api.routes import chat, health


@pytest.fixture
def test_app() -> FastAPI:
    application = FastAPI(title="Agent Flow API Test")
    application.state.graph = build_graph(checkpointer=MemorySaver())
    application.include_router(health.router)
    application.include_router(chat.router)
    return application


@pytest.fixture
def client(test_app):
    from fastapi.testclient import TestClient

    with TestClient(test_app) as test_client:
        yield test_client
