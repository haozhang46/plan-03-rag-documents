from typing import Literal

from langchain_core.messages import AIMessage
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from app.agent.state import AgentState
from app.agent.tools.desktop.tools import build_desktop_tools
from app.config import get_settings
from app.llm.factory import get_chat_model


def _should_continue(state: AgentState) -> Literal["tools", "__end__"]:
    settings = get_settings()
    max_iter = settings.react_max_iterations
    iteration = state.get("react_iteration") or 0
    if iteration >= max_iter:
        return END

    messages = state["messages"]
    if not messages:
        return END
    last = messages[-1]
    if isinstance(last, AIMessage) and last.tool_calls:
        return "tools"
    return END


def _increment_iteration(state: AgentState) -> dict:
    return {"react_iteration": (state.get("react_iteration") or 0) + 1}


async def _call_model(state: AgentState) -> dict:
    tools = build_desktop_tools()
    model = get_chat_model().bind_tools(tools)
    response = await model.ainvoke(state["messages"])
    return {"messages": [response]}


def build_react_graph(checkpointer=None):
    tools = build_desktop_tools()
    tool_node = ToolNode(tools)

    graph = StateGraph(AgentState)
    graph.add_node("agent", _call_model)
    graph.add_node("tools", tool_node)
    graph.add_node("increment", _increment_iteration)
    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", _should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "increment")
    graph.add_edge("increment", "agent")
    return graph.compile(checkpointer=checkpointer)
