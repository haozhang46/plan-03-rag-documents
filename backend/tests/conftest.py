import shutil
from pathlib import Path

import pytest
from fastapi import FastAPI
from langgraph.checkpoint.memory import MemorySaver

from app.api.routes import admin_ragflow, chat, flows, health, rag, sessions
from app.config import get_settings
from app.flows.registry import GraphRegistry
from app.rag.bindings_store import MemoryRagflowBindingsStore
from app.sessions.store import MemorySessionStore


@pytest.fixture
def test_app() -> FastAPI:
    application = FastAPI(title="Agent Flow API Test")
    registry = GraphRegistry.load_all(checkpointer=MemorySaver())
    application.state.graph_registry = registry
    application.state.graph = registry.get("default")
    application.state.session_store = MemorySessionStore()
    application.state.ragflow_bindings_store = MemoryRagflowBindingsStore()
    application.include_router(health.router)
    application.include_router(chat.router)
    application.include_router(flows.router)
    application.include_router(sessions.router)
    application.include_router(rag.router)
    application.include_router(admin_ragflow.router)
    return application


@pytest.fixture
def client(test_app):
    from fastapi.testclient import TestClient

    with TestClient(test_app) as test_client:
        yield test_client


@pytest.fixture
def skills_fixture(tmp_path, monkeypatch):
    """Copy repo skills/ into tmp_path/skills and point SKILLS_ROOT there."""
    repo_skills = Path(__file__).resolve().parents[2] / "skills"
    dest = tmp_path / "skills"
    shutil.copytree(repo_skills, dest)
    monkeypatch.setenv("SKILLS_ROOT", str(dest))
    get_settings.cache_clear()
    yield dest
    get_settings.cache_clear()
