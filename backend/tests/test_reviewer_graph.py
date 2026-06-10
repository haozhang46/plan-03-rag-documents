import pytest
from pydantic import ValidationError

from app.agent.graphs.reviewer import (
    reviewer_node,
    route_after_reviewer,
    run_spec_checklist,
)
from app.agent.models.review import ReviewOutput


def test_review_output_schema():
    out = ReviewOutput(
        passed=True,
        feedback="",
        checklist=["all subtasks produced output", "no file write conflicts"],
    )
    assert out.passed is True
    assert out.checklist == [
        "all subtasks produced output",
        "no file write conflicts",
    ]


def test_review_output_requires_passed_and_checklist():
    with pytest.raises(ValidationError):
        ReviewOutput(feedback="missing fields")


def test_run_spec_checklist_passes_when_all_subtasks_have_output():
    state = {
        "subtasks": [
            {"id": "t1", "agent": "rag", "prompt": "q1"},
            {"id": "t2", "agent": "chat", "prompt": "q2"},
        ],
        "subtask_results": [
            {"id": "t1", "agent": "rag", "output": "found"},
            {"id": "t2", "agent": "chat", "output": "done"},
        ],
        "parallel_conflicts": [],
    }
    review = run_spec_checklist(state)
    assert review.passed is True
    assert review.feedback == ""
    assert "all subtasks produced output" in review.checklist
    assert "no file write conflicts" in review.checklist


def test_run_spec_checklist_fails_on_parallel_conflicts():
    state = {
        "subtasks": [{"id": "t1", "agent": "code", "prompt": "a"}],
        "subtask_results": [
            {"id": "t1", "agent": "code", "output": "ok", "file_writes": ["x.py"]},
        ],
        "parallel_conflicts": ["x.py"],
    }
    review = run_spec_checklist(state)
    assert review.passed is False
    assert "x.py" in review.feedback
    assert any("conflict" in item.lower() for item in review.checklist)


def test_run_spec_checklist_fails_on_missing_subtask_output():
    state = {
        "subtasks": [
            {"id": "t1", "agent": "rag", "prompt": "q1"},
            {"id": "t2", "agent": "code", "prompt": "q2"},
        ],
        "subtask_results": [
            {"id": "t1", "agent": "rag", "output": "found"},
        ],
        "parallel_conflicts": [],
    }
    review = run_spec_checklist(state)
    assert review.passed is False
    assert "t2" in review.feedback


def test_reviewer_node_sets_state_from_checklist():
    state = {
        "subtasks": [{"id": "t1", "agent": "chat", "prompt": "hi"}],
        "subtask_results": [{"id": "t1", "agent": "chat", "output": "hello"}],
        "parallel_conflicts": [],
    }
    result = reviewer_node(state)
    assert result["review_passed"] is True
    assert result["review_feedback"] == ""


def test_reviewer_node_fails_on_conflicts():
    state = {
        "subtasks": [{"id": "t1", "agent": "code", "prompt": "x"}],
        "subtask_results": [
            {"id": "t1", "agent": "code", "output": "ok", "file_writes": ["a.py"]},
        ],
        "parallel_conflicts": ["a.py"],
    }
    result = reviewer_node(state)
    assert result["review_passed"] is False
    assert result["review_feedback"]
    assert "a.py" in result["review_feedback"]


def test_route_after_reviewer_ends_when_passed():
    assert route_after_reviewer({"review_passed": True}) == "__end__"


def test_route_after_reviewer_retries_dispatch_once_on_fail():
    assert route_after_reviewer({"review_passed": False, "review_attempts": 0}) == "dispatch"
    assert route_after_reviewer({"review_passed": False, "review_attempts": 1}) == "__end__"


async def test_parallel_graph_sets_review_passed_on_success(monkeypatch):
    from langchain_core.messages import HumanMessage
    from langgraph.checkpoint.memory import MemorySaver

    from app.agent.graphs.parallel import build_parallel_graph

    graph = build_parallel_graph(checkpointer=MemorySaver())
    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content="parallel task")],
            "subtasks": [
                {"id": "t1", "agent": "rag", "prompt": "search docs"},
                {"id": "t2", "agent": "chat", "prompt": "summarize"},
            ],
        },
        {"configurable": {"thread_id": "review-pass-1"}},
    )

    assert result.get("review_passed") is True
    assert result.get("review_feedback") in ("", None)


async def test_parallel_graph_sets_review_feedback_on_conflict(monkeypatch):
    from langchain_core.messages import HumanMessage
    from langgraph.checkpoint.memory import MemorySaver

    from app.agent.graphs import parallel as parallel_mod
    from app.agent.graphs.parallel import build_parallel_graph

    def _conflict_code_worker(state, config=None):
        subtask = state["subtask"]
        return {
            "subtask_results": [
                {
                    "id": subtask["id"],
                    "agent": "code",
                    "output": "ok",
                    "file_writes": ["shared.py"],
                }
            ]
        }

    monkeypatch.setattr(parallel_mod, "code_worker", _conflict_code_worker)

    graph = build_parallel_graph(checkpointer=MemorySaver())
    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content="parallel conflict")],
            "subtasks": [
                {"id": "t1", "agent": "code", "prompt": "write a"},
                {"id": "t2", "agent": "code", "prompt": "write b"},
            ],
        },
        {"configurable": {"thread_id": "review-fail-1"}},
    )

    assert result.get("review_passed") is False
    assert result.get("review_feedback")
    assert "shared.py" in result["review_feedback"]
