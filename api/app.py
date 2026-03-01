from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import chat, ingest


def create_app() -> FastAPI:
    application = FastAPI(
        title="PDF RAG Chatbot",
        description="RAG chatbot powered by Agno, Gemini 2.5 Flash, and pgvector.",
        version="1.0.0",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(ingest.router)
    application.include_router(chat.router)

    @application.get("/", tags=["Health"])
    async def root() -> dict:
        return {"status": "ok", "service": "PDF RAG Chatbot", "docs": "/docs"}

    @application.get("/health", tags=["Health"])
    async def health() -> dict:
        return {"status": "healthy"}

    return application


app = create_app()
