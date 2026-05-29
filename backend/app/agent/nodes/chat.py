from langchain_core.language_models import BaseChatModel
from langchain_core.messages import AIMessage

from app.agent.state import AgentState
from app.llm.factory import get_chat_model


async def chat_node(state: AgentState, llm: BaseChatModel | None = None) -> AgentState:
    model = llm or get_chat_model()
    full: AIMessage | None = None
    async for chunk in model.astream(state["messages"]):
        full = chunk if full is None else full + chunk
    return {"messages": [full]} if full else {}
