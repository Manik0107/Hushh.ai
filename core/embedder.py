from __future__ import annotations

import os

from agno.knowledge.embedder.google import GeminiEmbedder

from config.settings import settings

os.environ["GOOGLE_API_KEY"] = settings.google_api_key


def get_embedder() -> GeminiEmbedder:
    return GeminiEmbedder(
        id=settings.embedding_model,
        dimensions=1536,
    )
