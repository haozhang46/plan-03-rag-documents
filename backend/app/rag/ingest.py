from pathlib import Path

from pypdf import PdfReader

from app.rag.chunking import split_text
from app.rag.store import DocumentStore


def extract_text(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        return "\n".join(p.extract_text() or "" for p in PdfReader(path).pages)
    return path.read_text(encoding="utf-8")


async def ingest_file(store: DocumentStore, filename: str, path: Path) -> str:
    doc_id = await store.create_document(filename)
    chunks = split_text(extract_text(path))
    await store.add_chunks(doc_id, chunks)
    return doc_id
