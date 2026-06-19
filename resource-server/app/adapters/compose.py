import yaml

from app.models.topology import Edge, Node, PortMapping, Topology

_MYSQL_IMAGES = ("mysql", "mariadb", "postgres", "postgresql", "mongo", "mongodb")
_REDIS_IMAGES = ("redis", "memcached")


def _infer_kind(service_name: str, image: str | None) -> tuple[str, str | None]:
    image_lower = (image or "").lower()
    if any(token in image_lower for token in _MYSQL_IMAGES):
        engine = "mysql" if "mysql" in image_lower or "mariadb" in image_lower else image_lower.split(":")[0]
        if "postgres" in image_lower:
            engine = "postgres"
        if "mongo" in image_lower:
            engine = "mongodb"
        return "database", engine
    if any(token in image_lower for token in _REDIS_IMAGES):
        return "cache", "redis"
    if "nginx" in image_lower or service_name.lower() == "nginx":
        return "gateway", None
    return "service", None


def _parse_ports(raw_ports: list | None) -> list[PortMapping]:
    if not raw_ports:
        return []
    result: list[PortMapping] = []
    for entry in raw_ports:
        if isinstance(entry, str):
            if ":" in entry:
                host, container = entry.rsplit(":", 1)
                result.append(PortMapping(host=int(host), container=int(container)))
            else:
                result.append(PortMapping(container=int(entry)))
        elif isinstance(entry, int):
            result.append(PortMapping(container=entry))
    return result


def import_compose(content: str, project: str = "default") -> Topology:
    doc = yaml.safe_load(content) or {}
    services: dict = doc.get("services") or {}

    nodes: list[Node] = []
    for service_id, service in services.items():
        image = service.get("image")
        kind, engine = _infer_kind(service_id, image)
        nodes.append(
            Node(
                id=service_id,
                kind=kind,
                engine=engine,
                image=image,
                ports=_parse_ports(service.get("ports")),
            )
        )

    edges: list[Edge] = []
    for service_id, service in services.items():
        depends_on = service.get("depends_on") or []
        if isinstance(depends_on, dict):
            depends_on = list(depends_on.keys())
        env = service.get("environment") or {}
        if isinstance(env, list):
            env = {item.split("=", 1)[0]: item.split("=", 1)[1] for item in env if "=" in item}
        for dep in depends_on:
            edge_env = {}
            for key, value in env.items():
                if isinstance(value, str) and dep in value:
                    edge_env[key] = value
            edges.append(Edge.model_validate({"from": service_id, "to": dep, "env": edge_env}))

    return Topology(project=project, nodes=nodes, edges=edges, targets=[])


def export_compose(topology: Topology) -> str:
    services: dict = {}
    node_by_id = {node.id: node for node in topology.nodes}
    depends_map: dict[str, list[str]] = {node.id: [] for node in topology.nodes}
    env_map: dict[str, dict[str, str]] = {node.id: {} for node in topology.nodes}

    for edge in topology.edges:
        depends_map.setdefault(edge.from_, []).append(edge.to)
        for key, value in edge.env.items():
            env_map.setdefault(edge.from_, {})[key] = value

    for node in topology.nodes:
        svc: dict = {}
        if node.image:
            svc["image"] = node.image
        elif node.kind == "database" and node.engine == "mysql":
            svc["image"] = "mysql:8.0"
        elif node.kind == "cache":
            svc["image"] = "redis:7"
        elif node.kind == "service" and not node.image:
            svc["build"] = "."

        ports = []
        for mapping in node.ports:
            if mapping.host is not None:
                ports.append(f"{mapping.host}:{mapping.container}")
            else:
                ports.append(mapping.container)
        if ports:
            svc["ports"] = ports

        deps = depends_map.get(node.id) or []
        if deps:
            svc["depends_on"] = deps

        env = env_map.get(node.id) or {}
        if env:
            svc["environment"] = env

        services[node.id] = svc

    return yaml.safe_dump({"services": services}, sort_keys=False)
