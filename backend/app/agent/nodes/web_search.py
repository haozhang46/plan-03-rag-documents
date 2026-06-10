from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig

from app.agent.state import AgentState
from app.config import get_settings
from app.web.searxng_client import SearXNGClient, WebSearchResult


def _format_web_results(results: list[WebSearchResult]) -> str:
    lines: list[str] = []
    for i, r in enumerate(results, start=1):
        lines.append(f"{i}. {r.title}")
        lines.append(f"   {r.url}")
        if r.snippet:
            lines.append(f"   {r.snippet}")
    return "\n".join(lines)


def _build_web_context_message(results: list[WebSearchResult]) -> dict:
    body = _format_web_results(results)
    return {
        "messages": [
            SystemMessage(content=f"<web_results>\n{body}\n</web_results>")
        ],
        "web_sources": [r.url for r in results if r.url],
    }


def web_search_node(state: AgentState, config: RunnableConfig) -> dict:
    if not get_settings().web_search_enabled:
        return {}
    if not state.get("use_web_search"):
        return {}

    last_human = next(
        (m for m in reversed(state["messages"]) if isinstance(m, HumanMessage)),
        None,
    )
    if last_human is None or not last_human.content.strip():
        return {}

    client = SearXNGClient()
    try:
        results = client.search(last_human.content)
    except Exception:
        return {}

    if not results:
        return {}
    return _build_web_context_message(results)
