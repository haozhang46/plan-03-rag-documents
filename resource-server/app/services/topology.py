from app.models.topology import Topology


def format_topology_markdown(topology: Topology) -> str:
    if not topology.nodes:
        return ""

    lines = ["## Service Topology", ""]

    adjacency: dict[str, list[str]] = {}
    for edge in topology.edges:
        adjacency.setdefault(edge.from_, []).append(edge.to)

    for node in topology.nodes:
        label = node.id
        if node.engine:
            label += f" ({node.engine})"
        elif node.kind != "service":
            label += f" ({node.kind})"
        deps = adjacency.get(node.id) or []
        if deps:
            dep_labels = []
            for dep_id in deps:
                dep_node = next((n for n in topology.nodes if n.id == dep_id), None)
                if dep_node and dep_node.engine:
                    dep_labels.append(f"{dep_id} ({dep_node.engine})")
                else:
                    dep_labels.append(dep_id)
            lines.append(f"- {label} → {', '.join(dep_labels)}")
        else:
            lines.append(f"- {label}")

    if topology.targets:
        lines.append("")
        target_bits = [f"{target.id}={target.type}" for target in topology.targets]
        lines.append(f"- targets: {', '.join(target_bits)}")

    return "\n".join(lines)


def deployment_summary(topology: Topology | None) -> dict:
    if topology is None:
        return {
            "platform": "unknown",
            "services": [],
            "nodeCount": 0,
            "targets": [],
        }

    platform = "unknown"
    if topology.targets:
        primary = topology.targets[0].type
        if primary == "docker-compose":
            platform = "docker-compose"
        elif primary == "kubernetes":
            platform = "kubernetes"
        else:
            platform = "unknown"
    elif any(node.kind == "service" for node in topology.nodes):
        platform = "docker-compose"

    services = [
        {
            "name": node.id,
            "kind": node.kind,
            "image": node.image,
            "ports": [
                f"{p.host}:{p.container}" if p.host is not None else str(p.container)
                for p in node.ports
            ],
        }
        for node in topology.nodes
        if node.kind in ("service", "gateway", "worker")
    ]

    return {
        "platform": platform,
        "services": services,
        "nodeCount": len(topology.nodes),
        "targets": [target.model_dump() for target in topology.targets],
    }
