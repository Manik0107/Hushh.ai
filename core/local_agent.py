import os
from typing import Optional

from pydantic import Field
from agno.agent import Agent
from agno.models.ollama import Ollama
from agno.embedder.ollama import OllamaEmbedder
from agno.knowledge.pdf import PDFKnowledgeBase
from agno.vectordb.pgvector import PgVector

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

def build_local_knowledge_base() -> PDFKnowledgeBase:
    db_url = os.getenv("DB_URL", "postgresql+psycopg://ai:ai@localhost:5532/ai")
    
    vector_db = PgVector(
        table_name="local_pdf_knowledge",
        db_url=db_url,
        embedder=get_local_embedder(),
    )
    
    knowledge_base = PDFKnowledgeBase(
        path="data/pdfs",
        vector_db=vector_db,
    )
    
    return knowledge_base

def build_local_agent() -> Agent:
    knowledge_base = build_local_knowledge_base()
    
    return Agent(
        model=Ollama(id="llama2"),
        knowledge=knowledge_base,
        search_knowledge=True,
        read_chat_history=True,
        markdown=True,
        instructions=_SYSTEM_PROMPT,
        description="PDF RAG Chatbot powered by local Llama 2 and Ollama",
    )

if __name__ == "__main__":
    print("Initializing Local Llama 2 Agent...")
    
    agent = build_local_agent()
    print("Agent ready! Try asking a question.")
