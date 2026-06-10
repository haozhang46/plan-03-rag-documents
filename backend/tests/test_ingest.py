from pathlib import Path

import pytest

from app.rag.chunking import split_text
from app.rag.ingest import extract_text, ingest_file


class _MockStore:
    def __init__(self):
        self.docs: list[tuple[str, str]] = []
        self.chunks: list[tuple[str, list[str]]] = []

    async def create_document(self, filename: str) -> str:
        doc_id = f"doc-{len(self.docs)}"
        self.docs.append((doc_id, filename))
        return doc_id

    async def add_chunks(self, doc_id: str, chunks: list[str]) -> None:
        self.chunks.append((doc_id, chunks))


@pytest.fixture
def txt_file(tmp_path) -> Path:
    path = tmp_path / "test.txt"
    path.write_text("Hello world. " * 200, encoding="utf-8")
    return path


def test_split_text_produces_chunks():
    text = "hello " * 1000
    chunks = split_text(text, chunk_size=100, overlap=20)
    assert len(chunks) > 1
    assert all(len(c) > 0 for c in chunks)


def test_extract_text_txt(txt_file):
    text = extract_text(txt_file)
    assert "Hello world" in text


@pytest.mark.asyncio
async def test_ingest_file_returns_doc_id(txt_file):
    store = _MockStore()
    doc_id = await ingest_file(store, "test.txt", txt_file)
    assert doc_id.startswith("doc-")
    assert len(store.docs) == 1
    assert store.docs[0][1] == "test.txt"
    assert len(store.chunks) == 1
    assert len(store.chunks[0][1]) > 0
