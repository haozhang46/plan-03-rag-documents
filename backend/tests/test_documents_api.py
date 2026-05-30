from app.config import get_settings
from app.rag.store import DocumentStore


class _FakeEmbeddings:
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[0.1] * 1536 for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        return [0.1] * 1536


def test_upload_document(client, monkeypatch):
    client.app.state.store = DocumentStore(embeddings=_FakeEmbeddings())
    monkeypatch.setenv("EMBEDDING_PROVIDER", "mock")
    get_settings.cache_clear()

    async def fake_ingest(_store, _filename, _path):
        return "test-doc-id"

    monkeypatch.setattr("app.api.routes.documents.ingest_file", fake_ingest)

    content = b"Hello, this is a test document for upload."
    response = client.post(
        "/v1/documents/upload",
        files={"file": ("test.txt", content, "text/plain")},
    )

    assert response.status_code == 200
    assert response.json() == {"document_id": "test-doc-id"}

    get_settings.cache_clear()
