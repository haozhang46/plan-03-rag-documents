import httpx

from app.models.ops import KubernetesOpsSummary


def fetch_meshery_summary(url: str | None) -> KubernetesOpsSummary:
    if not url or not url.strip():
        return KubernetesOpsSummary(configured=False, reachable=False)

    base = url.strip().rstrip("/")

    try:
        with httpx.Client(timeout=5.0) as client:
            version_resp = client.get(f"{base}/api/system/version")
            if version_resp.status_code >= 400:
                return KubernetesOpsSummary(
                    configured=True,
                    reachable=False,
                    error=f"Meshery returned {version_resp.status_code}",
                )
            version_resp.raise_for_status()
            version_data = version_resp.json()
            version = None
            if isinstance(version_data, dict):
                version = version_data.get("version") or version_data.get("build")

            connection_count: int | None = None
            sync_resp = client.get(f"{base}/api/system/sync")
            if sync_resp.status_code == 200:
                sync_data = sync_resp.json()
                if isinstance(sync_data, dict):
                    connections = sync_data.get("connections") or sync_data.get("environments")
                    if isinstance(connections, list):
                        connection_count = len(connections)

            return KubernetesOpsSummary(
                configured=True,
                reachable=True,
                version=str(version) if version else None,
                connection_count=connection_count,
            )
    except httpx.HTTPError as exc:
        return KubernetesOpsSummary(
            configured=True,
            reachable=False,
            error=str(exc),
        )
