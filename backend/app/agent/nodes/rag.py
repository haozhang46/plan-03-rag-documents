from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig

from app.agent.state import AgentState
from app.rag.ragflow_client import RagFlowClient
from app.rag.types import ChunkHit


def _build_context_message(hits: list[ChunkHit]) -> dict:
    ctx = "\n\n".join(f"[{h.chunk_id}] {h.content}" for h in hits)
    return {
        "messages": [
            SystemMessage(content=f"<context>\n{ctx}\n</context>")
        ],
        "citations": [h.chunk_id for h in hits],
    }


def retrieve_rag_context(state: AgentState, config: RunnableConfig) -> dict:
    dataset_ids = state.get("dataset_ids") or []
    if not dataset_ids:
        return {}

    last_human = next(
        m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)
    )
    document_ids = state.get("document_ids") or None
    client = config.get("configurable", {}).get("ragflow_client") or RagFlowClient()
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


def rag_node(state: AgentState, config: RunnableConfig) -> dict:
    return retrieve_rag_context(state, config)
