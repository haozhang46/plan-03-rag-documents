from typing import Annotated, Literal, NotRequired, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    document_ids: NotRequired[list[str]]
    citations: NotRequired[list[str]]
    query_embedding: NotRequired[list[float]]
    next_agent: NotRequired[Literal["rag", "chat"]]
    planner_reason: NotRequired[str]
    rag_completed: NotRequired[bool]
