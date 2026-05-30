import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.agent.graph import build_graph
from app.api.routes import chat, documents, health, sessions
from app.config import get_settings
from app.rag.db import create_tables
from app.rag.store import DocumentStore
from app.sessions.store import MemorySessionStore, PostgresSessionStore

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    mode = settings.checkpointer.lower()

    if mode == "memory":
        app.state.graph = build_graph(checkpointer=MemorySaver())
        app.state.session_store = MemorySessionStore()
        logger.info("Checkpointer: MemorySaver (in-process, dev only)")
        yield
        return

    if mode in ("postgres", "auto"):
        try:
            async with AsyncPostgresSaver.from_conn_string(
                settings.database_url
            ) as checkpointer:
                await checkpointer.setup()
                app.state.graph = build_graph(checkpointer=checkpointer)
                await create_tables()
                app.state.store = DocumentStore()
                app.state.session_store = PostgresSessionStore()
                logger.info("Checkpointer: Postgres")
                yield
            return
        except Exception as exc:
            if mode == "postgres":
                raise
            logger.warning(
                "Postgres unavailable (%s); falling back to MemorySaver. "
                "Start DB with: docker compose up -d db",
                exc,
            )

    app.state.graph = build_graph(checkpointer=MemorySaver())
    app.state.session_store = MemorySessionStore()
    yield


app = FastAPI(title="Agent Flow API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(sessions.router)
