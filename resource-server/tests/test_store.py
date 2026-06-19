import tempfile
from pathlib import Path

from app.models.topology import Edge, Node, Topology
from app.store.sqlite import TopologyStore


def test_get_topology_returns_none_for_missing_project():
    with tempfile.TemporaryDirectory() as tmp:
        store = TopologyStore(Path(tmp) / "test.db")
        assert store.get_topology("demo") is None


def test_topology_round_trip():
    with tempfile.TemporaryDirectory() as tmp:
        store = TopologyStore(Path(tmp) / "test.db")
        topology = Topology(
            project="demo",
            nodes=[
                Node(id="api", kind="service", ports=[{"container": 8000, "host": 8000}]),
                Node(id="app-db", kind="database", engine="mysql"),
            ],
            edges=[Edge.model_validate({"from": "api", "to": "app-db"})],
        )
        store.save_topology("demo", topology)
        loaded = store.get_topology("demo")
        assert loaded is not None
        assert loaded.nodes[0].id == "api"
        assert loaded.edges[0].from_ == "api"


def test_instances_round_trip():
    with tempfile.TemporaryDirectory() as tmp:
        store = TopologyStore(Path(tmp) / "test.db")
        instances = {
            "app-db": {"host": "localhost", "port": 3306, "database": "myapp"},
            "cache": {"host": "localhost", "port": 6379},
        }
        store.save_instances("demo", instances)
        assert store.get_instances("demo") == instances
