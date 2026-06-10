from langchain_core.language_models import BaseChatModel
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_core.messages import RemoveMessage
from langgraph.graph.message import REMOVE_ALL_MESSAGES

from app.agent.state import AgentState
from app.config import get_settings
from app.llm.factory import get_chat_model

SUMMARY_PREFIX = "Conversation summary so far:"


def _message_content(msg: BaseMessage) -> str:
    content = getattr(msg, "content", "")
    if isinstance(content, str):
        return content
    return str(content)


def estimate_tokens(messages: list[BaseMessage]) -> int:
    return sum(len(_message_content(m)) // 4 for m in messages)


def needs_summarize(state: AgentState) -> bool:
    return estimate_tokens(state["messages"]) > get_settings().summary_token_threshold


def summary_already_in_messages(messages: list[BaseMessage]) -> bool:
    return any(
        isinstance(m, SystemMessage) and SUMMARY_PREFIX in _message_content(m)
        for m in messages
    )


async def summarize_node(
    state: AgentState, llm: BaseChatModel | None = None
) -> dict:
    messages = state["messages"]
    to_summarize = messages[:-2]
    keep = messages[-2:]
    if not to_summarize:
        return {}

    model = llm or get_chat_model()
    transcript = "\n".join(
        f"{type(m).__name__}: {_message_content(m)}" for m in to_summarize
    )
    result = model.invoke(
        [
            SystemMessage(
                content=(
                    "Summarize the following conversation history concisely, "
                    "preserving key facts and decisions."
                )
            ),
            HumanMessage(content=transcript),
        ]
    )
    summary = _message_content(result)
    return {
        "summary": summary,
        "messages": [
            RemoveMessage(id=REMOVE_ALL_MESSAGES),
            SystemMessage(content=f"{SUMMARY_PREFIX}\n{summary}"),
            *keep,
        ],
    }
