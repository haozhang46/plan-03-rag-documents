from typing import Annotated, Literal, NotRequired, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages
from operator import add


class Subtask(TypedDict):
    id: str
    agent: Literal["rag", "code", "chat"]
    prompt: str


class SubtaskResult(TypedDict):
    id: str
    agent: Literal["rag", "code", "chat"]
    output: str
    file_writes: NotRequired[list[str]]


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    document_ids: NotRequired[list[str]]
    citations: NotRequired[list[str]]
    query_embedding: NotRequired[list[float]]
    next_agent: NotRequired[Literal["rag", "chat", "code"]]
    planner_reason: NotRequired[str]
    rag_completed: NotRequired[bool]
    code_snippet: NotRequired[str]
    code_completed: NotRequired[bool]
    code_error: NotRequired[str]
    selected_skills: NotRequired[list[str]]
    skill_context: NotRequired[str]
    l3_context: NotRequired[str]
    summary: NotRequired[str]
    subtasks: NotRequired[list[Subtask]]
    subtask_results: NotRequired[Annotated[list[SubtaskResult], add]]
    parallel_conflicts: NotRequired[list[str]]
