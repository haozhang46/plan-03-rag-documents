from app.config import get_settings


def test_upload_document(client, monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "mock")
    get_settings.cache_clear()

    async def fake_ingest(_store, _filename, _path):
        return "test-doc-id"

    monkeypatch.setattr("app.api.routes.documents.ingest_file", fake_ingest)

    content = b"Hello, this is a test document for upload."
    response = client.post(
        "/v1/documents",
        files={"file": ("test.txt", content, "text/plain")},
    )

    assert response.status_code == 200
    assert response.json() == {"document_id": "test-doc-id"}

    get_settings.cache_clear()
