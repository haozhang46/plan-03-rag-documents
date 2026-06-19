import yaml

from app.adapters.compose import export_compose, import_compose
from app.models.topology import Topology


def test_import_compose_builds_nodes_and_edges():
    with open("tests/fixtures/sample-compose.yml", encoding="utf-8") as f:
        content = f.read()

    topology = import_compose(content, project="my-app")

    node_ids = {node.id for node in topology.nodes}
    assert node_ids == {"api", "app-db", "cache"}
    assert any(node.id == "app-db" and node.kind == "database" for node in topology.nodes)
    assert any(node.id == "cache" and node.kind == "cache" for node in topology.nodes)

    edge_pairs = {(edge.from_, edge.to) for edge in topology.edges}
    assert ("api", "app-db") in edge_pairs
    assert ("api", "cache") in edge_pairs


def test_export_compose_round_trip():
    with open("tests/fixtures/sample-compose.yml", encoding="utf-8") as f:
        original = f.read()

    topology = import_compose(original, project="my-app")
    exported = export_compose(topology)
    doc = yaml.safe_load(exported)

    assert set(doc["services"].keys()) == {"api", "app-db", "cache"}
    assert doc["services"]["api"]["depends_on"] == ["app-db", "cache"]
    assert doc["services"]["app-db"]["image"] == "mysql:8.0"

    round_trip = import_compose(exported, project="my-app")
    assert {n.id for n in round_trip.nodes} == {n.id for n in topology.nodes}
    assert len(round_trip.edges) == len(topology.edges)


def test_export_empty_topology():
    topology = Topology(project="empty", nodes=[], edges=[], targets=[])
    exported = export_compose(topology)
    doc = yaml.safe_load(exported)
    assert doc["services"] == {}
