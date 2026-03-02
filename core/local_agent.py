from __future__ import annotations
import os

from agno.agent import Agent
from agno.models.google import Gemini
from agno.knowledge.embedder.ollama import OllamaEmbedder
from agno.knowledge.knowledge import Knowledge
from agno.vectordb.pgvector import PgVector

from config.settings import settings, get_next_google_api_key



_SYSTEM_PROMPT = """\
You are a friendly and patient study tutor. Your job is to help students understand
content from their PDF study materials clearly and thoroughly.

Answer questions directly and concisely based ONLY on the provided context.
If you don't know the answer, say "That does not appear to be covered in your notes."
"""

def get_local_embedder() -> OllamaEmbedder:
    return OllamaEmbedder(
        id="nomic-embed-text",
        dimensions=768
    )

def build_local_knowledge_base() -> Knowledge:
    db_url = os.getenv("DB_URL", "postgresql+psycopg://ai:ai@localhost:5532/ai")
    
    vector_db = PgVector(
        table_name="local_pdf_knowledge",
        db_url=db_url,
        embedder=get_local_embedder(),
    )
    
    return Knowledge(
        vector_db=vector_db,
    )

def build_local_agent() -> Agent:
    knowledge_base = build_local_knowledge_base()
    
    return Agent(
        model=Gemini(id=settings.gemini_model, api_key=get_next_google_api_key()),
        knowledge=knowledge_base,
        search_knowledge=True,
        read_chat_history=True,
        markdown=True,
        instructions=_SYSTEM_PROMPT,
        description="PDF RAG Chatbot powered by Gemini 2.5 Flash",
    )

if __name__ == "__main__":
    print("Initializing Agent...")
    
    agent = build_local_agent()
    print("Agent ready! Try asking a question.")
