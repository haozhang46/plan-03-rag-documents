import json
import sqlite3
from pathlib import Path

from app.models.topology import Topology


class TopologyStore:
    def __init__(self, db_path: str | Path) -> None:
        self.db_path = str(db_path)
        self._init_db()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    topology_json TEXT,
                    instances_json TEXT
                )
                """
            )

    def get_topology(self, project_id: str) -> Topology | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT topology_json FROM projects WHERE id = ?",
                (project_id,),
            ).fetchone()
        if not row or not row["topology_json"]:
            return None
        return Topology.model_validate_json(row["topology_json"])

    def save_topology(self, project_id: str, topology: Topology) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO projects (id, topology_json, instances_json)
                VALUES (?, ?, COALESCE((SELECT instances_json FROM projects WHERE id = ?), '{}'))
                ON CONFLICT(id) DO UPDATE SET topology_json = excluded.topology_json
                """,
                (project_id, topology.model_dump_json(by_alias=True), project_id),
            )

    def get_instances(self, project_id: str) -> dict[str, dict]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT instances_json FROM projects WHERE id = ?",
                (project_id,),
            ).fetchone()
        if not row or not row["instances_json"]:
            return {}
        data = json.loads(row["instances_json"])
        if not isinstance(data, dict):
            return {}
        return data

    def save_instances(self, project_id: str, instances: dict[str, dict]) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO projects (id, topology_json, instances_json)
                VALUES (?, COALESCE((SELECT topology_json FROM projects WHERE id = ?), NULL), ?)
                ON CONFLICT(id) DO UPDATE SET instances_json = excluded.instances_json
                """,
                (project_id, project_id, json.dumps(instances)),
            )
