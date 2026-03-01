from __future__ import annotations

from enum import Enum

from pydantic import BaseModel


class Difficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class Question(BaseModel):
    id: int
    question: str
    options: list[str]
    correct_answer: str
    explanation: str


class QuizRound(BaseModel):
    difficulty: Difficulty
    questions: list[Question]


class QuizSession(BaseModel):
    session_id: str
    subject: str
    unit: str
    rounds: list[QuizRound]
    scores: dict[str, int] = {}


class AnswerRequest(BaseModel):
    session_id: str
    difficulty: Difficulty
    question_id: int
    answer: str


class AnswerResponse(BaseModel):
    correct: bool
    correct_answer: str
    explanation: str
    score_so_far: int


class QuizResult(BaseModel):
    session_id: str
    subject: str
    unit: str
    scores: dict[str, int]
    total: int
    max_total: int
    weak_areas: list[str]
