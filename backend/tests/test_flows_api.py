from langgraph.checkpoint.memory import MemorySaver

from app.flows.registry import GraphRegistry


def test_list_flows(client):
    client.app.state.graph_registry = GraphRegistry.load_all(
        checkpointer=MemorySaver()
    )
    resp = client.get("/v1/flows")
    assert resp.status_code == 200
    flows = resp.json()["flows"]
    ids = {f["flow_id"] for f in flows}
    assert "default" in ids
    assert "knowledge-rag" in ids
    assert all("title" in f and "description" in f for f in flows)
