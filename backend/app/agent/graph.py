from langgraph.graph import END, START, StateGraph

from app.agent.nodes.chat import chat_node
from app.agent.nodes.prepare import prepare_node
from app.agent.nodes.rag import rag_node
from app.agent.state import AgentState


def build_graph(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("prepare", prepare_node)
    graph.add_node("rag", rag_node)
    graph.add_node("chat", chat_node)
    graph.add_edge(START, "prepare")
    graph.add_edge("prepare", "rag")
    graph.add_edge("rag", "chat")
    graph.add_edge("chat", END)
    return graph.compile(checkpointer=checkpointer)
