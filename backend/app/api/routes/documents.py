import tempfile
from pathlib import Path

from fastapi import APIRouter, Request, UploadFile

from app.rag.ingest import ingest_file

router = APIRouter(prefix="/v1")


@router.post("/documents")
async def upload(file: UploadFile, request: Request):
    store = getattr(request.app.state, "store", None)
    if store is None:
        from fastapi.responses import JSONResponse

        return JSONResponse(
            status_code=503,
            content={"detail": "Document store unavailable — Postgres required"},
        )

    suffix = Path(file.filename or "upload").suffix
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = Path(tmp.name)

    try:
        doc_id = await ingest_file(store, file.filename or "upload", tmp_path)
        return {"document_id": str(doc_id)}
    finally:
        tmp_path.unlink(missing_ok=True)
