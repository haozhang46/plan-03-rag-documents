from langgraph.checkpoint.memory import MemorySaver

from app.flows.registry import GraphRegistry


def test_load_all_registers_builtin_flows():
    reg = GraphRegistry.load_all(checkpointer=MemorySaver())
    ids = {f["flow_id"] for f in reg.list_flows()}
    assert ids == {
        "default",
        "linear-rag",
        "supervisor",
        "parallel",
        "knowledge-rag",
        "rag-flow",
        "finance-agent",
    }


def test_get_graph_returns_compiled_graph():
    reg = GraphRegistry.load_all(checkpointer=MemorySaver())
    g1 = reg.get("supervisor")
    g2 = reg.get("supervisor")
    assert g1 is g2


def test_get_unknown_flow_raises_key_error():
    reg = GraphRegistry.load_all(checkpointer=MemorySaver())
    try:
        reg.get("missing-flow")
        assert False, "expected KeyError"
    except KeyError as exc:
        assert "missing-flow" in str(exc)
