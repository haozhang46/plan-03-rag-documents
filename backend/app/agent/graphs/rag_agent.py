from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph

from app.agent.nodes.rag import retrieve_rag_context
from app.agent.state import AgentState
from app.observability.langfuse import get_langfuse_client


def _retrieve_node(state: AgentState, config: RunnableConfig) -> dict:
    return retrieve_rag_context(state, config)


def build_rag_agent(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("retrieve", _retrieve_node)
    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", END)
    return graph.compile(checkpointer=checkpointer)


_rag_agent = build_rag_agent()


def rag_agent_node(state: AgentState, config: RunnableConfig) -> dict:
    client = get_langfuse_client()

    def _invoke() -> dict:
        result = _rag_agent.invoke(state, config)
        merged = dict(result)
        merged["rag_completed"] = True
        return merged

    if not client:
        return _invoke()

    with client.start_as_current_observation(name="subgraph.invoke") as span:
        result = _invoke()
        span.update(metadata={"name": "rag_agent"})
        return result
