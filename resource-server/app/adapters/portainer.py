import httpx

from app.models.ops import DockerOpsSummary


def _headers(token: str | None) -> dict[str, str]:
    if token:
        return {"X-API-Key": token}
    return {}


def fetch_portainer_summary(url: str | None, token: str | None) -> DockerOpsSummary:
    if not url or not url.strip():
        return DockerOpsSummary(configured=False, reachable=False)

    base = url.strip().rstrip("/")
    headers = _headers(token)

    try:
        with httpx.Client(timeout=5.0) as client:
            status_resp = client.get(f"{base}/api/status", headers=headers)
            if status_resp.status_code == 401:
                return DockerOpsSummary(
                    configured=True,
                    reachable=False,
                    error="Portainer authentication failed",
                )
            status_resp.raise_for_status()

            stacks_resp = client.get(f"{base}/api/stacks", headers=headers)
            stacks_resp.raise_for_status()
            stacks = stacks_resp.json()
            stack_count = len(stacks) if isinstance(stacks, list) else None

            endpoints_resp = client.get(f"{base}/api/endpoints", headers=headers)
            endpoints_resp.raise_for_status()
            endpoints = endpoints_resp.json()
            endpoint_count = len(endpoints) if isinstance(endpoints, list) else None

            running_containers: int | None = None
            if isinstance(endpoints, list) and endpoints:
                endpoint_id = endpoints[0].get("Id")
                if endpoint_id is not None:
                    containers_resp = client.get(
                        f"{base}/api/endpoints/{endpoint_id}/docker/containers/json",
                        params={"all": "false"},
                        headers=headers,
                    )
                    if containers_resp.status_code == 200:
                        containers = containers_resp.json()
                        running_containers = len(containers) if isinstance(containers, list) else None

            return DockerOpsSummary(
                configured=True,
                reachable=True,
                stack_count=stack_count,
                running_containers=running_containers,
                endpoint_count=endpoint_count,
            )
    except httpx.HTTPError as exc:
        return DockerOpsSummary(
            configured=True,
            reachable=False,
            error=str(exc),
        )
