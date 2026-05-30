from langchain_core.messages import HumanMessage

from app.agent.models.router import NextAgent
from app.agent.state import AgentState

_CODE_KEYWORDS = (
    "python",
    "run code",
    "calculate",
    "计算",
    "代码",
)


_DOC_KEYWORDS = (
    "document",
    "file",
    "upload",
    "pdf",
    "attachment",
    "cite",
    "source",
    "according to",
    "文档",
    "文件",
    "上传",
    "引用",
)


def _last_human_content(state: AgentState) -> str:
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            return msg.content
    return ""


def heuristic_next_agent(state: AgentState) -> NextAgent:
    if state.get("rag_completed") or state.get("citations"):
        return "chat"
    if state.get("code_completed"):
        return "chat"
    text = _last_human_content(state).lower()
    if any(k in text for k in _CODE_KEYWORDS):
        return "code"
    ids = state.get("document_ids") or []
    if not ids:
        return "chat"
    if any(k in text for k in _DOC_KEYWORDS):
        return "rag"
    return "chat"


def route_after_planner(state: AgentState) -> NextAgent:
    explicit = state.get("next_agent")
    if explicit in ("rag", "chat", "code"):
        return explicit
    return heuristic_next_agent(state)
