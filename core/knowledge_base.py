from __future__ import annotations

from pathlib import Path

from agno.knowledge.knowledge import Knowledge
from agno.knowledge.reader.pdf_reader import PDFReader

from config.settings import settings
from core.vector_store import get_vector_store


def build_knowledge_base() -> Knowledge:
    return Knowledge(
        vector_db=get_vector_store(),
        max_results=5,
    )


def ingest_pdfs(recreate: bool = False) -> Knowledge:
    kb = build_knowledge_base()

    if recreate and kb.vector_db:
        kb.vector_db.drop()
        kb.vector_db.create()

    pdf_dir = settings.pdf_dir
    if not pdf_dir.exists():
        pdf_dir.mkdir(parents=True, exist_ok=True)

    reader = PDFReader()
    for pdf_path in pdf_dir.glob("*.pdf"):
        kb.insert(path=str(pdf_path), reader=reader, upsert=True)

    return kb


def ingest_single_pdf(file_path: Path, recreate: bool = False) -> Knowledge:
    kb = build_knowledge_base()

    if recreate and kb.vector_db:
        kb.vector_db.drop()
        kb.vector_db.create()

    kb.insert(path=str(file_path), reader=PDFReader(), upsert=True)

    return kb
