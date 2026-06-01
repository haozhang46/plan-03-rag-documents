from langchain_core.runnables import RunnableConfig
from langgraph.graph import END, START, StateGraph
from langgraph.types import Send

from app.agent.graphs.reviewer import (
    increment_review_attempts_node,
    reviewer_node,
    route_after_reviewer,
)
from app.agent.state import AgentState, Subtask, SubtaskResult
from app.observability.langfuse import get_langfuse_client

_WORKER_NODES = {
    "rag": "rag_worker",
    "code": "code_worker",
    "chat": "chat_worker",
}


def _worker_payload(subtask: Subtask) -> dict:
    return {"subtask": subtask}


def dispatch_node(state: AgentState) -> list[Send]:
    subtasks = state.get("subtasks") or []
    client = get_langfuse_client()

    def _dispatch() -> list[Send]:
        return [
            Send(_WORKER_NODES[subtask["agent"]], _worker_payload(subtask))
            for subtask in subtasks
        ]

    if not client:
        return _dispatch()

    with client.start_as_current_observation(name="parallel.dispatch") as span:
        sends = _dispatch()
        span.update(
            metadata={
                "subtask_count": len(subtasks),
                "subtask_ids": [s["id"] for s in subtasks],
            }
        )
        return sends


def _run_worker(
    state: dict,
    config: RunnableConfig | None,
    agent: str,
    output: str,
    file_writes: list[str] | None = None,
) -> dict:
    subtask: Subtask = state["subtask"]
    client = get_langfuse_client()

    def _execute() -> dict:
        result: SubtaskResult = {
            "id": subtask["id"],
            "agent": subtask["agent"],
            "output": output,
        }
        if file_writes:
            result["file_writes"] = file_writes
        return {"subtask_results": [result]}

    if not client:
        return _execute()

    with client.start_as_current_observation(name="parallel.worker") as span:
        result = _execute()
        span.update(
            metadata={
                "subtask_id": subtask["id"],
                "agent": agent,
                "prompt": subtask["prompt"],
            }
        )
        return result


def rag_worker(state: dict, config: RunnableConfig | None = None) -> dict:
    subtask: Subtask = state["subtask"]
    return _run_worker(
        state,
        config,
        "rag",
        f"rag completed: {subtask['prompt']}",
    )


def code_worker(state: dict, config: RunnableConfig | None = None) -> dict:
    subtask: Subtask = state["subtask"]
    return _run_worker(
        state,
        config,
        "code",
        f"code completed: {subtask['prompt']}",
        file_writes=[f"{subtask['id']}.py"],
    )


def chat_worker(state: dict, config: RunnableConfig | None = None) -> dict:
    subtask: Subtask = state["subtask"]
    return _run_worker(
        state,
        config,
        "chat",
        f"chat completed: {subtask['prompt']}",
    )


def reduce_results_node(state: AgentState) -> dict:
    results = state.get("subtask_results") or []
    file_to_ids: dict[str, list[str]] = {}
    for result in results:
        for path in result.get("file_writes") or []:
            file_to_ids.setdefault(path, []).append(result["id"])

    conflicts = sorted(
        path for path, ids in file_to_ids.items() if len(ids) > 1
    )
    return {"parallel_conflicts": conflicts}


def build_parallel_graph(checkpointer=None):
    graph = StateGraph(AgentState)
    graph.add_node("dispatch", lambda state: {})
    graph.add_node("rag_worker", rag_worker)
    graph.add_node("code_worker", code_worker)
    graph.add_node("chat_worker", chat_worker)
    graph.add_node("reduce_results", reduce_results_node)
    graph.add_node("reviewer", reviewer_node)
    graph.add_node("increment_review_attempts", increment_review_attempts_node)
    graph.add_edge(START, "dispatch")
    graph.add_conditional_edges("dispatch", dispatch_node)
    graph.add_edge("rag_worker", "reduce_results")
    graph.add_edge("code_worker", "reduce_results")
    graph.add_edge("chat_worker", "reduce_results")
    graph.add_edge("reduce_results", "reviewer")
    graph.add_conditional_edges(
        "reviewer",
        route_after_reviewer,
        {"dispatch": "increment_review_attempts", "__end__": END},
    )
    graph.add_edge("increment_review_attempts", "dispatch")
    return graph.compile(checkpointer=checkpointer)
