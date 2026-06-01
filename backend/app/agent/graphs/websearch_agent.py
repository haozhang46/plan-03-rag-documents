from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph

from app.agent.state import AgentState
from app.agent.tools.web_search import web_search
from app.observability.langfuse import get_langfuse_client


def _extract_query(state: AgentState) -> str:
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            content = msg.content if isinstance(msg.content, str) else str(msg.content)
            return content.strip()
    return ""


def _format_results(results: list[dict]) -> str:
    if not results:
        body = "No web search results found."
    else:
        parts = []
        for i, item in enumerate(results, 1):
            title = item.get("title", "")
            url = item.get("url", "")
            snippet = item.get("snippet", "")
            parts.append(f"{i}. {title}\n   URL: {url}\n   {snippet}")
        body = "\n\n".join(parts)
    return f"<web_search_results>\n{body}\n</web_search_results>"


def _search_node(state: AgentState, config: RunnableConfig) -> dict:
    query = _extract_query(state)
    results = web_search(query) if query else []
    return {
        "messages": [SystemMessage(content=_format_results(results))],
        "web_search_results": results,
    }


def build_websearch_agent(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("search", _search_node)
    graph.add_edge(START, "search")
    graph.add_edge("search", END)
    return graph.compile(checkpointer=checkpointer)


_websearch_agent = build_websearch_agent()


def websearch_agent_node(state: AgentState, config: RunnableConfig) -> dict:
    client = get_langfuse_client()

    def _invoke() -> dict:
        result = _websearch_agent.invoke(state, config)
        merged = dict(result)
        merged["websearch_completed"] = True
        return merged

    if not client:
        return _invoke()

    with client.start_as_current_observation(name="subgraph.invoke") as span:
        result = _invoke()
        span.update(metadata={"name": "websearch_agent"})
        return result
