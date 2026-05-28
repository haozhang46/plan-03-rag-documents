import shutil
from pathlib import Path

import pytest
from fastapi import FastAPI
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graph import build_graph
from app.api.routes import chat, health
from app.config import get_settings


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
