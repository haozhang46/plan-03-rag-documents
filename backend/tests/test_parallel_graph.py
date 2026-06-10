from langchain_core.messages import HumanMessage
from langgraph.checkpoint.memory import MemorySaver

from app.agent.graphs.parallel import build_parallel_graph, dispatch_node, reduce_results_node


def test_dispatch_returns_send_for_each_subtask():
    state = {
        "subtasks": [
            {"id": "t1", "agent": "rag", "prompt": "search docs"},
            {"id": "t2", "agent": "code", "prompt": "run calc"},
        ],
    }
    sends = dispatch_node(state)
    assert len(sends) == 2
    targets = {s.node for s in sends}
    assert targets == {"rag_worker", "code_worker"}


def test_reduce_results_merges_and_detects_file_conflicts():
    state = {
        "subtask_results": [
            {
                "id": "t1",
                "agent": "rag",
                "output": "found context",
                "file_writes": ["report.md"],
            },
            {
                "id": "t2",
                "agent": "code",
                "output": "42",
                "file_writes": ["report.md", "out.txt"],
            },
        ],
    }
    result = reduce_results_node(state)
    assert result["parallel_conflicts"] == ["report.md"]
    assert len(state["subtask_results"]) == 2


async def test_parallel_graph_runs_two_subtasks(monkeypatch):
    worker_calls = {"rag": 0, "code": 0}

    from app.agent.graphs import parallel as parallel_mod

    original_rag = parallel_mod.rag_worker
    original_code = parallel_mod.code_worker

    def _counting_rag(state, config=None):
        worker_calls["rag"] += 1
        return original_rag(state, config)

    def _counting_code(state, config=None):
        worker_calls["code"] += 1
        return original_code(state, config)

    monkeypatch.setattr(parallel_mod, "rag_worker", _counting_rag)
    monkeypatch.setattr(parallel_mod, "code_worker", _counting_code)

    graph = build_parallel_graph(checkpointer=MemorySaver())
    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content="parallel task")],
            "subtasks": [
                {"id": "t1", "agent": "rag", "prompt": "search docs"},
                {"id": "t2", "agent": "code", "prompt": "print 1+1"},
            ],
        },
        {"configurable": {"thread_id": "parallel-1"}},
    )

    assert worker_calls["rag"] == 1
    assert worker_calls["code"] == 1
    assert len(result["subtask_results"]) == 2
    ids = {r["id"] for r in result["subtask_results"]}
    assert ids == {"t1", "t2"}
    assert result.get("parallel_conflicts") == []


def test_dispatch_emits_langfuse_parent_and_worker_spans(monkeypatch):
    calls = []

    class _FakeClient:
        def start_as_current_observation(self, **kwargs):
            calls.append(kwargs)

            class _Ctx:
                def __enter__(self):
                    return self

                def __exit__(self, *args):
                    return False

                def update(self, **kwargs):
                    calls.append(kwargs)

            return _Ctx()

    monkeypatch.setattr(
        "app.agent.graphs.parallel.get_langfuse_client", lambda: _FakeClient()
    )

    from app.agent.graphs import parallel as parallel_mod

    state = {
        "subtasks": [{"id": "t1", "agent": "rag", "prompt": "q"}],
    }
    parallel_mod.dispatch_node(state)
    parallel_mod.rag_worker({"subtask": state["subtasks"][0]})

    assert any(c.get("name") == "parallel.dispatch" for c in calls)
    assert any(c.get("name") == "parallel.worker" for c in calls)
