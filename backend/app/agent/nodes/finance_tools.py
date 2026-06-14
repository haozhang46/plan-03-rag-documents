from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.runnables import RunnableConfig

from app.agent.state import AgentState
from app.agent.tools.finance.pfm_tools import build_finance_tools
from app.llm.factory import get_chat_model


async def finance_agent_node(state: AgentState, config: RunnableConfig) -> dict:
    access_token = (config.get("configurable") or {}).get("access_token")
    if not access_token:
        return {
            "messages": [
                AIMessage(content="Finance agent requires Authorization Bearer token on chat requests.")
            ]
        }

    tools = build_finance_tools(access_token)
    tool_by_name = {tool.name: tool for tool in tools}
    model = get_chat_model().bind_tools(tools)

    messages = list(state["messages"])
    ai = await model.ainvoke(messages)
    if not ai.tool_calls:
        return {"messages": [ai]}

    tool_messages: list[ToolMessage] = []
    for call in ai.tool_calls:
        tool = tool_by_name.get(call["name"])
        if tool is None:
            content = f"Unknown tool: {call['name']}"
        else:
            content = str(tool.invoke(call["args"]))
        tool_messages.append(ToolMessage(content=content, tool_call_id=call["id"]))

    final = await model.ainvoke(messages + [ai, *tool_messages])
    return {"messages": [ai, *tool_messages, final]}

