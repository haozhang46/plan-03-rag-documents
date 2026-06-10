from dataclasses import dataclass

import httpx

from app.config import get_settings


@dataclass
class RagFlowChunk:
    chunk_id: str
    document_id: str
    content: str
    score: float
    document_name: str | None = None


class RagFlowClient:
    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        timeout: float = 60.0,
    ):
        settings = get_settings()
        self._base_url = (base_url or settings.ragflow_base_url).rstrip("/")
        self._api_key = api_key or settings.ragflow_api_key or ""
        self._timeout = timeout

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self._api_key:
            headers["Authorization"] = f"Bearer {self._api_key}"
        return headers

    def retrieve(
        self,
        question: str,
        dataset_ids: list[str],
        document_ids: list[str] | None = None,
        top_k: int | None = None,
    ) -> list[RagFlowChunk]:
        settings = get_settings()
        payload: dict = {
            "question": question,
            "dataset_ids": dataset_ids,
            "top_k": top_k or settings.ragflow_top_k,
        }
        if document_ids:
            payload["document_ids"] = document_ids

        with httpx.Client(timeout=self._timeout) as client:
            resp = client.post(
                f"{self._base_url}/api/v1/retrieval",
                headers=self._headers(),
                json=payload,
            )
            resp.raise_for_status()
            body = resp.json()

        if body.get("code") != 0:
            msg = body.get("message", "ragflow retrieval failed")
            raise RuntimeError(msg)

        chunks = body.get("data", {}).get("chunks") or []
        hits: list[RagFlowChunk] = []
        for row in chunks:
            hits.append(
                RagFlowChunk(
                    chunk_id=str(row.get("id", "")),
                    document_id=str(row.get("document_id", "")),
                    content=str(row.get("content", "")),
                    score=float(row.get("similarity", 0.0)),
                    document_name=row.get("document_keyword"),
                )
            )
        return hits

    def health_check(self) -> bool:
        try:
            with httpx.Client(timeout=5.0) as client:
                resp = client.get(
                    f"{self._base_url}/api/v1/datasets",
                    headers=self._headers(),
                    params={"page": 1, "page_size": 1},
                )
                if resp.status_code != 200:
                    return False
                body = resp.json()
                return body.get("code") == 0
        except httpx.HTTPError:
            return False
