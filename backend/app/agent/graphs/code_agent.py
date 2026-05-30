import re

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph

from app.agent.state import AgentState
from app.agent.tools.run_python import run_python
from app.observability.langfuse import get_langfuse_client

_PYTHON_BLOCK_RE = re.compile(r"```python\s*\n(.*?)```", re.DOTALL | re.IGNORECASE)


def _extract_code(state: AgentState) -> str:
    if snippet := state.get("code_snippet"):
        return snippet.strip()
    for msg in reversed(state["messages"]):
        if isinstance(msg, HumanMessage):
            content = msg.content if isinstance(msg.content, str) else str(msg.content)
            match = _PYTHON_BLOCK_RE.search(content)
            if match:
                return match.group(1).strip()
            return content.strip()
    return ""


def _run_code_node(state: AgentState, config: RunnableConfig) -> dict:
    code = _extract_code(state)
    if not code:
        return {
            "messages": [SystemMessage(content="code execution failed: no code found")],
            "code_error": "no code found",
        }

    result = run_python(code)
    if result.get("error") or result["exit_code"] != 0:
        error = result.get("error") or result["stderr"] or f"exit code {result['exit_code']}"
        output_parts = []
        if result["stdout"]:
            output_parts.append(f"stdout:\n{result['stdout']}")
        if result["stderr"]:
            output_parts.append(f"stderr:\n{result['stderr']}")
        body = "\n".join(output_parts) if output_parts else error
        return {
            "messages": [SystemMessage(content=f"code execution failed:\n{body}")],
            "code_error": error,
        }

    stdout = result["stdout"].rstrip()
    return {
        "messages": [SystemMessage(content=f"code execution output:\n{stdout}")],
        "code_completed": True,
    }


def build_code_agent(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("run", _run_code_node)
    graph.add_edge(START, "run")
    graph.add_edge("run", END)
    return graph.compile(checkpointer=checkpointer)


_code_agent = build_code_agent()


def _state_with_skill_context(state: AgentState) -> AgentState:
    skill_context = state.get("skill_context")
    if not skill_context:
        return state
    return {
        **state,
        "messages": [
            SystemMessage(content=f"<skills>\n{skill_context}\n</skills>"),
            *state["messages"],
        ],
    }


def code_agent_node(state: AgentState, config: RunnableConfig) -> dict:
    client = get_langfuse_client()

    def _invoke() -> dict:
        return _code_agent.invoke(_state_with_skill_context(state), config)

    if not client:
        return _invoke()

    with client.start_as_current_observation(name="subgraph.invoke") as span:
        result = _invoke()
        span.update(metadata={"name": "code_agent"})
        return result
