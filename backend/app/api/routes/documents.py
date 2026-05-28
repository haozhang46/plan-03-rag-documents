import shutil
import tempfile
from pathlib import Path

from fastapi import APIRouter, Request, UploadFile

from app.rag.ingest import ingest_file

router = APIRouter(prefix="/v1")


@router.post("/documents")
async def upload(file: UploadFile, request: Request) -> dict[str, str]:
    suffix = Path(file.filename or "upload").suffix or ".txt"
    tmp_dir = tempfile.mkdtemp()
    path = Path(tmp_dir) / f"upload{suffix}"
    try:
        path.write_bytes(await file.read())
        store = request.app.state.document_store
        doc_id = await ingest_file(store, file.filename or "upload", path)
        return {"document_id": str(doc_id)}
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
