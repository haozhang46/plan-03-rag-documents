from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage, SystemMessage

from app.agent.nodes.summarize import SUMMARY_PREFIX, summary_already_in_messages
from app.agent.state import AgentState
from app.llm.factory import get_chat_model


async def chat_node(state: AgentState, llm: BaseChatModel | None = None) -> AgentState:
    model = llm or get_chat_model()
    messages = list(state["messages"])
    summary = state.get("summary")
    if summary and not summary_already_in_messages(messages):
        messages = [
            SystemMessage(content=f"{SUMMARY_PREFIX}\n{summary}"),
            *messages,
        ]
    full: AIMessage | None = None
    async for chunk in model.astream(messages):
        full = chunk if full is None else full + chunk
    return {"messages": [full]} if full else {}
