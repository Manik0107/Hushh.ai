from __future__ import annotations

import shutil
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from config.settings import settings
from core.knowledge_base import ingest_single_pdf

router = APIRouter(prefix="/ingest", tags=["Ingest"])


class IngestResponse(BaseModel):
    message: str
    filename: str


@router.post("", response_model=IngestResponse)
async def ingest_pdf(file: UploadFile = File(...)) -> IngestResponse:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        settings.pdf_dir.mkdir(parents=True, exist_ok=True)
        save_path = settings.pdf_dir / file.filename

        with save_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        ingest_single_pdf(file_path=save_path, recreate=False)

        return IngestResponse(
            message=f"Successfully ingested '{file.filename}' into the knowledge base.",
            filename=file.filename,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        await file.close()
