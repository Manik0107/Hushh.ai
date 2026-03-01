from __future__ import annotations

from agno.vectordb.pgvector import PgVector, SearchType

from config.settings import settings
from core.embedder import get_embedder


def get_vector_store() -> PgVector:
    return PgVector(
        table_name=settings.db_table,
        db_url=settings.db_url,
        search_type=SearchType.hybrid,
        embedder=get_embedder(),
    )
