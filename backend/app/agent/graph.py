from langgraph.graph import END, START, StateGraph

from app.agent.graphs.code_agent import code_agent_node
from app.agent.graphs.parallel import build_parallel_graph
from app.agent.graphs.rag_agent import rag_agent_node
from app.agent.graphs.route_agent import route_agent_node
from app.agent.graphs.reviewer import reviewer_node, route_after_reviewer_supervisor
from app.agent.nodes.chat import chat_node
from app.agent.nodes.prepare import prepare_node
from app.agent.nodes.rag import rag_node
from app.agent.nodes.summarize import summarize_node
from app.agent.nodes.web_search import web_search_node
from app.agent.routing import route_after_planner, route_after_prepare, route_after_rag
from app.agent.state import AgentState
from app.config import get_settings

# Backwards-compat alias for tests that patch graph.planner_node
planner_node = route_agent_node


def _build_linear_graph(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("prepare", prepare_node)
    graph.add_node("summarize", summarize_node)
    graph.add_node("rag", rag_node)
    if get_settings().web_search_enabled:
        graph.add_node("web", web_search_node)
    graph.add_node("chat", chat_node)
    graph.add_edge(START, "prepare")
    graph.add_conditional_edges(
        "prepare",
        route_after_prepare,
        {"summarize": "summarize", "rag": "rag"},
    )
    graph.add_edge("summarize", "rag")
    if get_settings().web_search_enabled:
        graph.add_conditional_edges(
            "rag",
            route_after_rag,
            {"web": "web", "chat": "chat"},
        )
        graph.add_edge("web", "chat")
    else:
        graph.add_edge("rag", "chat")
    graph.add_edge("chat", END)
    return graph.compile(checkpointer=checkpointer)


def _build_supervisor_graph(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("prepare", prepare_node)
    graph.add_node("summarize", summarize_node)
    graph.add_node("route", route_agent_node)
    graph.add_node("rag", rag_agent_node)
    graph.add_node("code", code_agent_node)
    graph.add_node("chat", chat_node)
    review_enabled = get_settings().review_mode == "on"
    if review_enabled:
        graph.add_node("reviewer", reviewer_node)
    graph.add_edge(START, "prepare")
    graph.add_conditional_edges(
        "prepare",
        route_after_prepare,
        {"summarize": "summarize", "route": "route"},
    )
    graph.add_edge("summarize", "route")
    graph.add_conditional_edges(
        "route",
        route_after_planner,
        {"rag": "rag", "chat": "chat", "code": "code"},
    )
    if review_enabled:
        graph.add_edge("rag", "reviewer")
        graph.add_edge("code", "reviewer")
        graph.add_conditional_edges(
            "reviewer",
            route_after_reviewer_supervisor,
            {"route": "route"},
        )
    else:
        graph.add_edge("rag", "route")
        graph.add_edge("code", "route")
    graph.add_edge("chat", END)
    return graph.compile(checkpointer=checkpointer)


def build_graph(checkpointer=None):
    settings = get_settings()
    if settings.dispatch_mode == "parallel":
        return build_parallel_graph(checkpointer=checkpointer)
    if settings.supervisor_mode == "llm":
        return _build_supervisor_graph(checkpointer=checkpointer)
    return _build_linear_graph(checkpointer=checkpointer)
