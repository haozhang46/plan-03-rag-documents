import asyncio

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig

from app.agent.state import AgentState


def rag_node(state: AgentState, config: RunnableConfig) -> dict:
    ids = (state.get("document_ids") or [])
    if not ids:
        return {}

    store = config.get("configurable", {}).get("store")
    if store is None:
        return {}

    last_human = next(
        m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)
    )

    hits = asyncio.run(store.similarity_search(last_human.content, document_ids=ids, k=5))
    if not hits:
        return {}

    ctx = "\n\n".join(f"[{h.chunk_id}] {h.content}" for h in hits)
    return {
        "messages": [
            SystemMessage(content=f"<context>\n{ctx}\n</context>")
        ],
        "citations": [h.chunk_id for h in hits],
    }
