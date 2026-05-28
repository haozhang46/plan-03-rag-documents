from langchain_core.language_models import BaseChatModel

from app.agent.state import AgentState
from app.llm.factory import get_chat_model


def chat_node(state: AgentState, llm: BaseChatModel | None = None) -> AgentState:
    model = llm or get_chat_model()
    response = model.invoke(state["messages"])
    return {"messages": [response]}
