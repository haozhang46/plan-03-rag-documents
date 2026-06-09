from typing import Literal

from app.agent.models.review import ReviewOutput
from app.agent.state import AgentState
from app.observability.langfuse import get_langfuse_client

_SPEC_ITEMS = (
    "all subtasks produced output",
    "no file write conflicts",
    "every subtask has non-empty output",
)


def run_spec_checklist(state: AgentState) -> ReviewOutput:
    subtasks = state.get("subtasks") or []
    results = state.get("subtask_results") or []
    conflicts = state.get("parallel_conflicts") or []
    checklist: list[str] = []
    failures: list[str] = []

    result_ids = {r["id"] for r in results}
    subtask_ids = {s["id"] for s in subtasks}
    if subtasks and subtask_ids <= result_ids:
        checklist.append("all subtasks produced output")
    elif subtasks:
        missing = sorted(subtask_ids - result_ids)
        checklist.append("all subtasks produced output: FAIL")
        failures.append(f"missing subtask outputs: {', '.join(missing)}")

    if conflicts:
        checklist.append("no file write conflicts: FAIL")
        failures.append(f"file conflicts: {', '.join(conflicts)}")
    else:
        checklist.append("no file write conflicts")

    empty_outputs = [r["id"] for r in results if not (r.get("output") or "").strip()]
    if results and not empty_outputs:
        checklist.append("every subtask has non-empty output")
    elif empty_outputs:
        checklist.append("every subtask has non-empty output: FAIL")
        failures.append(f"empty output for: {', '.join(empty_outputs)}")

    if state.get("code_error"):
        checklist.append("code execution succeeded: FAIL")
        failures.append(f"code error: {state['code_error']}")
    elif state.get("code_completed"):
        checklist.append("code execution succeeded")

    passed = len(failures) == 0
    feedback = "; ".join(failures)
    return ReviewOutput(passed=passed, feedback=feedback, checklist=checklist)


def reviewer_node(state: AgentState) -> dict:
    client = get_langfuse_client()

    def _run() -> dict:
        review = run_spec_checklist(state)
        if state.get("parallel_conflicts"):
            review = ReviewOutput(
                passed=False,
                feedback=review.feedback or f"file conflicts: {', '.join(state['parallel_conflicts'])}",
                checklist=review.checklist,
            )
        return {
            "review_passed": review.passed,
            "review_feedback": review.feedback,
        }

    if not client:
        return _run()

    with client.start_as_current_observation(name="reviewer.check") as span:
        result = _run()
        span.update(
            metadata={
                "review_passed": result.get("review_passed"),
                "review_feedback": result.get("review_feedback"),
            }
        )
        return result


def increment_review_attempts_node(state: AgentState) -> dict:
    return {"review_attempts": (state.get("review_attempts") or 0) + 1}


def route_after_reviewer(state: AgentState) -> Literal["dispatch", "__end__"]:
    if state.get("review_passed"):
        return "__end__"
    if (state.get("review_attempts") or 0) >= 1:
        return "__end__"
    return "dispatch"


def route_after_reviewer_supervisor(state: AgentState) -> Literal["route"]:
    return "route"
