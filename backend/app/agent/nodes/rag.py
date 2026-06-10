import asyncio

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig

from app.agent.state import AgentState
from app.config import get_settings
from app.rag.ragflow_client import RagFlowClient
from app.rag.store import ChunkHit


def _normalize_hits(hits: list) -> list[ChunkHit]:
    out: list[ChunkHit] = []
    for h in hits:
        if isinstance(h, dict):
            out.append(
                ChunkHit(
                    chunk_id=h["chunk_id"],
                    document_id=h["document_id"],
                    content=h["content"],
                    score=h["score"],
                )
            )
        else:
            out.append(h)
    return out


def _build_context_message(hits: list[ChunkHit]) -> dict:
    ctx = "\n\n".join(f"[{h.chunk_id}] {h.content}" for h in hits)
    return {
        "messages": [
            SystemMessage(content=f"<context>\n{ctx}\n</context>")
        ],
        "citations": [h.chunk_id for h in hits],
    }


def _retrieve_pgvector(state: AgentState, config: RunnableConfig) -> dict:
    ids = state.get("document_ids") or []
    if not ids:
        return {}

    store = config.get("configurable", {}).get("store")
    if store is None:
        return {}

    last_human = next(
        m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)
    )

    query_vec = state.get("query_embedding")
    if query_vec is not None:
        raw = asyncio.run(
            store.similarity_search_by_vector(
                query_vec, document_ids=ids, top_k=5
            )
        )
        hits = _normalize_hits(raw)
    else:
        hits = asyncio.run(
            store.similarity_search(last_human.content, document_ids=ids, k=5)
        )
    if not hits:
        return {}
    return _build_context_message(hits)


def _retrieve_ragflow(state: AgentState) -> dict:
    dataset_ids = state.get("dataset_ids") or []
    if not dataset_ids:
        return {}

    last_human = next(
        m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)
    )
    document_ids = state.get("document_ids") or None
    client = RagFlowClient()
    try:
        rows = client.retrieve(
            question=last_human.content,
            dataset_ids=dataset_ids,
            document_ids=document_ids,
        )
    except Exception:
        return {}

    if not rows:
        return {}

    hits = [
        ChunkHit(
            chunk_id=r.chunk_id,
            document_id=r.document_id,
            content=r.content,
            score=r.score,
        )
        for r in rows
    ]
    return _build_context_message(hits)


def retrieve_rag_context(state: AgentState, config: RunnableConfig) -> dict:
    backend = get_settings().rag_backend
    if backend == "ragflow":
        return _retrieve_ragflow(state)
    return _retrieve_pgvector(state, config)


def rag_node(state: AgentState, config: RunnableConfig) -> dict:
    return retrieve_rag_context(state, config)
