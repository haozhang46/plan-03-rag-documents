import tempfile
from pathlib import Path

from fastapi import APIRouter, Request, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from app.rag.ingest import ingest_file

router = APIRouter(prefix="/v1")


class CreateDocumentRequest(BaseModel):
    filename: str
    content_type: str
    embedding_model: str = "nomic-embed-text"
    embedding_dimensions: int = 768


class ChunkInput(BaseModel):
    content: str
    embedding: list[float]
    chunk_index: int | None = None


class AddChunksRequest(BaseModel):
    chunks: list[ChunkInput] = Field(min_length=1)


def _store_unavailable() -> JSONResponse:
    return JSONResponse(
        status_code=503,
        content={"detail": "Document store unavailable — Postgres required"},
    )


@router.post("/documents")
async def create_document(body: CreateDocumentRequest, request: Request):
    store = getattr(request.app.state, "store", None)
    if store is None:
        return _store_unavailable()
    doc_id = await store.create_document_meta(
        body.filename,
        body.content_type,
        body.embedding_model,
        body.embedding_dimensions,
    )
    return {"document_id": doc_id}


@router.post("/documents/{document_id}/chunks")
async def upload_chunks(
    document_id: str, body: AddChunksRequest, request: Request
):
    store = getattr(request.app.state, "store", None)
    if store is None:
        return _store_unavailable()
    rows = [c.model_dump() for c in body.chunks]
    count = await store.add_chunks_precomputed(document_id, rows)
    return {"ok": True, "count": count}


@router.post("/documents/upload")
async def upload(file: UploadFile, request: Request):
    store = getattr(request.app.state, "store", None)
    if store is None:
        return _store_unavailable()

    suffix = Path(file.filename or "upload").suffix
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)

    try:
        doc_id = await ingest_file(store, file.filename or "upload", tmp_path)
        return {"document_id": str(doc_id)}
    finally:
        tmp_path.unlink(missing_ok=True)
