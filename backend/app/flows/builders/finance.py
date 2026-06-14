from langgraph.graph import END, START, StateGraph

from app.agent.nodes.finance_tools import finance_agent_node, prepare_then_finance
from app.agent.nodes.prepare import prepare_node
from app.agent.state import AgentState


def build(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("prepare", prepare_node)
    graph.add_node("finance", finance_agent_node)
    graph.add_edge(START, "prepare")
    graph.add_edge("prepare", "finance")
    graph.add_edge("finance", END)
    return graph.compile(checkpointer=checkpointer)


__all__ = ["build"]
