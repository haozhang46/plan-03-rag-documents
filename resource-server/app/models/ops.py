from pydantic import BaseModel, Field


class OpsConfig(BaseModel):
    portainer_url: str | None = Field(default=None, serialization_alias="portainerUrl")
    meshery_url: str | None = Field(default=None, serialization_alias="mesheryUrl")

    model_config = {"populate_by_name": True}


class DockerOpsSummary(BaseModel):
    configured: bool = False
    reachable: bool = False
    stack_count: int | None = Field(default=None, serialization_alias="stackCount")
    running_containers: int | None = Field(default=None, serialization_alias="runningContainers")
    endpoint_count: int | None = Field(default=None, serialization_alias="endpointCount")
    error: str | None = None

    model_config = {"populate_by_name": True}


class KubernetesOpsSummary(BaseModel):
    configured: bool = False
    reachable: bool = False
    version: str | None = None
    connection_count: int | None = Field(default=None, serialization_alias="connectionCount")
    error: str | None = None

    model_config = {"populate_by_name": True}


class OpsSummary(BaseModel):
    docker: DockerOpsSummary
    kubernetes: KubernetesOpsSummary
    intent_node_count: int | None = Field(default=None, serialization_alias="intentNodeCount")

    model_config = {"populate_by_name": True}
