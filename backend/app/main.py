import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver

from app.agent.graph import build_graph
from app.api.routes import chat, documents, health
from app.config import get_settings
from app.rag.db import run_migrations
from app.rag.store import DocumentStore

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    mode = settings.checkpointer.lower()

    app.state.document_store = DocumentStore()

    if mode in ("postgres", "auto"):
        try:
            await run_migrations()
        except Exception as exc:
            if mode == "postgres":
                raise
            logger.warning(
                "RAG migrations skipped (%s); document upload requires Postgres.",
                exc,
            )

    if mode == "memory":
        app.state.graph = build_graph(checkpointer=MemorySaver())
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
    yield


app = FastAPI(title="Agent Flow API", lifespan=lifespan)
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(documents.router)
