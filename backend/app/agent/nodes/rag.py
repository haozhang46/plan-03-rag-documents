from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.state import AgentState
from app.rag.store import DocumentStore

_store: DocumentStore | None = None


def get_document_store() -> DocumentStore:
    global _store
    if _store is None:
        _store = DocumentStore()
    return _store


def _last_human_content(messages) -> str | None:
    for message in reversed(messages):
        if isinstance(message, HumanMessage):
            return message.content
    return None


async def rag_node(state: AgentState) -> dict:
    ids = state.get("document_ids") or []
    if not ids:
        return {}
    query = _last_human_content(state["messages"])
    if not query:
        return {}
    store = get_document_store()
    hits = await store.similarity_search(query, document_ids=ids, k=5)
    if not hits:
        return {}
    ctx = "\n\n".join(f"[{h.chunk_id}] {h.content}" for h in hits)
    return {
        "messages": [SystemMessage(content=f"<context>\n{ctx}\n</context>")],
        "citations": [h.chunk_id for h in hits],
    }
