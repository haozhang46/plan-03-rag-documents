from unittest.mock import MagicMock, patch

from app.rag.ragflow_client import RagFlowClient


def test_retrieve_parses_chunks():
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {
        "code": 0,
        "data": {
            "chunks": [
                {
                    "id": "chunk-1",
                    "document_id": "doc-1",
                    "content": "ragflow content",
                    "similarity": 0.95,
                    "document_keyword": "notes.md",
                }
            ]
        },
    }

    with patch("app.rag.ragflow_client.httpx.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.__enter__ = MagicMock(return_value=mock_client)
        mock_client.__exit__ = MagicMock(return_value=False)
        mock_client.post.return_value = mock_resp
        mock_client_cls.return_value = mock_client

        client = RagFlowClient(
            base_url="http://localhost", api_key="test-key"
        )
        hits = client.retrieve(
            question="what is ragflow?",
            dataset_ids=["dataset-1"],
        )

    assert len(hits) == 1
    assert hits[0].chunk_id == "chunk-1"
    assert hits[0].content == "ragflow content"
    assert hits[0].score == 0.95
