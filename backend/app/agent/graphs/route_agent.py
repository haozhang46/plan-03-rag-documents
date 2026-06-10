from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph

from app.agent.nodes.planner import planner_node
from app.agent.state import AgentState
from app.observability.langfuse import get_langfuse_client


def _route_node(state: AgentState, config: RunnableConfig) -> dict:
    return planner_node(state)


def build_route_agent(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("decide", _route_node)
    graph.add_edge(START, "decide")
    graph.add_edge("decide", END)
    return graph.compile(checkpointer=checkpointer)


_route_agent = build_route_agent()


def route_agent_node(state: AgentState, config: RunnableConfig) -> dict:
    client = get_langfuse_client()

    def _invoke() -> dict:
        return _route_agent.invoke(state, config)

    if not client:
        return _invoke()

    with client.start_as_current_observation(name="subgraph.invoke") as span:
        result = _invoke()
        span.update(
            metadata={
                "name": "route_agent",
                "next_agent": result.get("next_agent"),
                "planner_reason": result.get("planner_reason"),
            }
        )
        return result
