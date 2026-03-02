from __future__ import annotations

import json
import os

from agno.agent import Agent
from agno.models.google import Gemini

from config.settings import settings, get_next_google_api_key
from core.knowledge_base import build_knowledge_base
from quiz.models import Difficulty, Question



_DIFFICULTY_RULES = {
    Difficulty.easy: (
        "Generate EASY questions: direct recall and definitions. "
        "Examples: 'What is X?', 'Which of the following defines Y?'. "
        "The student should be able to answer from basic reading of the notes."
    ),
    Difficulty.medium: (
        "Generate MEDIUM questions: application and interpretation. "
        "Examples: 'Which formula applies when...?', 'What does this value indicate?'. "
        "Require the student to understand and apply concepts, not just recall them."
    ),
    Difficulty.hard: (
        "Generate HARD questions: analysis, edge cases, and multi-step reasoning. "
        "Examples: 'Why does X happen when Y changes?', 'What would occur if...?'. "
        "Require deep understanding and critical thinking."
    ),
}

_BASE_PROMPT = """\
You are a quiz generator for students. Using ONLY the knowledge retrieved from the
provided study materials, generate exactly {count} multiple-choice questions at
{difficulty} difficulty for the topic: {subject} - {unit}.

Difficulty guidance: {difficulty_rule}

Rules:
- Every question must have exactly 4 options labelled A, B, C, D.
- correct_answer must be exactly one of: "A", "B", "C", "D".
- Each question must include a short explanation (1-2 sentences) of why the answer is correct.
- Do NOT invent facts. All questions must be grounded in the retrieved content.
- All 10 questions must be distinct; do not repeat the same concept twice.

Return a valid JSON array of {count} objects with this exact structure:
[
  {{
    "id": 1,
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correct_answer": "A",
    "explanation": "..."
  }},
  ...
]
Return ONLY the JSON array. No extra text.
"""


def generate_questions(
    subject: str,
    unit: str,
    difficulty: Difficulty,
    count: int = 10,
) -> list[Question]:
    knowledge_base = build_knowledge_base()

    agent = Agent(
        model=Gemini(id=settings.gemini_model, api_key=get_next_google_api_key()),
        knowledge=knowledge_base,
        search_knowledge=True,
        markdown=False,
    )

    prompt = _BASE_PROMPT.format(
        count=count,
        difficulty=difficulty.value,
        subject=subject,
        unit=unit,
        difficulty_rule=_DIFFICULTY_RULES[difficulty],
    )

    response = agent.run(
        prompt,
        stream=False,
    )

    raw = response.content if response and hasattr(response, "content") else ""
    raw = raw.strip()

    import re
    match = re.search(r"```(?:json)?\s*(\[.*?\])\s*```", raw, re.DOTALL)
    if match:
        raw = match.group(1)
    else:
        start = raw.find("[")
        end = raw.rfind("]")
        if start != -1 and end != -1:
            raw = raw[start : end + 1]

    data = json.loads(raw)
    return [Question(**q) for q in data]
