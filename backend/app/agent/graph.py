from langgraph.graph import END, START, StateGraph

from app.agent.graphs.code_agent import code_agent_node
from app.agent.graphs.rag_agent import rag_agent_node
from app.agent.nodes.chat import chat_node
from app.agent.nodes.planner import planner_node
from app.agent.nodes.prepare import prepare_node
from app.agent.nodes.rag import rag_node
from app.agent.routing import route_after_planner
from app.agent.state import AgentState
from app.config import get_settings


def _build_linear_graph(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("prepare", prepare_node)
    graph.add_node("rag", rag_node)
    graph.add_node("chat", chat_node)
    graph.add_edge(START, "prepare")
    graph.add_edge("prepare", "rag")
    graph.add_edge("rag", "chat")
    graph.add_edge("chat", END)
    return graph.compile(checkpointer=checkpointer)


def _build_supervisor_graph(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("prepare", prepare_node)
    graph.add_node("planner", planner_node)
    graph.add_node("rag", rag_agent_node)
    graph.add_node("code", code_agent_node)
    graph.add_node("chat", chat_node)
    graph.add_edge(START, "prepare")
    graph.add_edge("prepare", "planner")
    graph.add_conditional_edges(
        "planner",
        route_after_planner,
        {"rag": "rag", "chat": "chat", "code": "code"},
    )
    graph.add_edge("rag", "planner")
    graph.add_edge("code", "planner")
    graph.add_edge("chat", END)
    return graph.compile(checkpointer=checkpointer)


def build_graph(checkpointer=None):
    if get_settings().supervisor_mode == "llm":
        return _build_supervisor_graph(checkpointer=checkpointer)
    return _build_linear_graph(checkpointer=checkpointer)
