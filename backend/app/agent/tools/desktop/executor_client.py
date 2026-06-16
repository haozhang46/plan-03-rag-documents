import httpx

from app.config import get_settings


class ExecutorError(Exception):
    pass


def call_executor(
    name: str,
    args: dict,
    *,
    call_id: str | None = None,
    timeout: float = 60.0,
) -> str:
    settings = get_settings()
    url = f"{settings.desktop_executor_url.rstrip('/')}/v1/tool"
    workspace = settings.workspace_root or "."
    payload = {
        "call_id": call_id or name,
        "name": name,
        "args": args,
        "workspace_root": workspace,
    }
    try:
        resp = httpx.post(url, json=payload, timeout=timeout)
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        raise ExecutorError(f"executor unreachable: {exc}") from exc

    data = resp.json()
    if not data.get("ok"):
        raise ExecutorError(data.get("error") or "executor returned ok=false")
    return str(data.get("output") or "")
