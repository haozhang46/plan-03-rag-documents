from typing import Any, Literal

from pydantic import BaseModel, Field


NodeKind = Literal["service", "database", "cache", "gateway", "worker"]
TargetType = Literal["docker-compose", "kubernetes", "paas"]


class PortMapping(BaseModel):
    container: int
    host: int | None = None


class Node(BaseModel):
    id: str
    kind: NodeKind
    runtime: str | None = None
    engine: str | None = None
    image: str | None = None
    ports: list[PortMapping] = Field(default_factory=list)


class Edge(BaseModel):
    from_: str = Field(alias="from")
    to: str
    env: dict[str, str] = Field(default_factory=dict)

    model_config = {"populate_by_name": True}


class Target(BaseModel):
    id: str
    type: TargetType
    env: str | None = None


class Topology(BaseModel):
    version: Literal[1] = 1
    project: str
    nodes: list[Node] = Field(default_factory=list)
    edges: list[Edge] = Field(default_factory=list)
    targets: list[Target] = Field(default_factory=list)


class ResourceInstance(BaseModel):
    host: str | None = None
    port: int | None = None
    database: str | None = None
    user: str | None = None
    password: str | None = None
    dsn: str | None = None

    model_config = {"extra": "allow"}


class InstancesConfig(BaseModel):
    instances: dict[str, ResourceInstance | dict[str, Any]] = Field(default_factory=dict)
