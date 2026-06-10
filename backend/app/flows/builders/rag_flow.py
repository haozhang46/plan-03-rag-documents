from langgraph.graph import END, START, StateGraph

from app.agent.graphs.rag_agent import rag_agent_node
from app.agent.nodes.chat import chat_node
from app.agent.nodes.prepare import prepare_node
from app.agent.state import AgentState


def _route_after_prepare_rag_flow(state: AgentState) -> str:
    if state.get("dataset_ids") or state.get("document_ids"):
        return "rag"
    return "chat"


def build(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("prepare", prepare_node)
    graph.add_node("rag", rag_agent_node)
    graph.add_node("chat", chat_node)
    graph.add_edge(START, "prepare")
    graph.add_conditional_edges(
        "prepare",
        _route_after_prepare_rag_flow,
        {"rag": "rag", "chat": "chat"},
    )
    graph.add_edge("rag", "chat")
    graph.add_edge("chat", END)
    return graph.compile(checkpointer=checkpointer)
