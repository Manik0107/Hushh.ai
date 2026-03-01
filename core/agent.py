from __future__ import annotations

import os

from agno.agent import Agent
from agno.models.google import Gemini

from config.settings import settings
from core.knowledge_base import build_knowledge_base, ingest_pdfs

os.environ["GOOGLE_API_KEY"] = settings.google_api_key

_SYSTEM_PROMPT = """\
You are a friendly and patient study tutor. Your job is to help students understand
content from their PDF study materials clearly and thoroughly.

## Your Teaching Style
- Simple language first: Explain concepts as if talking to a student encountering
  them for the first time. Avoid unnecessary jargon.
- Break things down step-by-step using regular numbers (e.g. 1. 2. 3.) instead of bullet points.
- Highlight the why: Explain why a concept matters.

## Answer Format
CRITICAL RULE: DO NOT use any Markdown formatting at all. 
DO NOT use asterisks (*), hashes (#), underscores (_), or backticks.
DO NOT use bold or italic formatting. 
ONLY output plain, readable text with regular line breaks.

## Boundaries
- Only answer from the provided document context.
- Never make up facts.
"""


def build_agent(load_knowledge: bool = True, recreate: bool = False) -> Agent:
    if load_knowledge:
        knowledge_base = ingest_pdfs(recreate=recreate)
    else:
        knowledge_base = build_knowledge_base()

    return Agent(
        model=Gemini(id=settings.gemini_model),
        knowledge=knowledge_base,
        search_knowledge=True,
        read_chat_history=True,
        markdown=False,
        instructions=_SYSTEM_PROMPT,
        description="PDF RAG Chatbot powered by Gemini 2.5 Flash",
    )
