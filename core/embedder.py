from __future__ import annotations

import os

from agno.knowledge.embedder.google import GeminiEmbedder

from config.settings import settings, get_next_google_api_key


def get_embedder() -> GeminiEmbedder:
    return GeminiEmbedder(
        id=settings.embedding_model,
        api_key=get_next_google_api_key(),
        dimensions=1536,
    )
