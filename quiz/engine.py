from __future__ import annotations

import uuid
from typing import Optional

from quiz.agent import generate_questions
from quiz.models import (
    AnswerResponse,
    Difficulty,
    QuizResult,
    QuizRound,
    QuizSession,
)

_sessions: dict[str, QuizSession] = {}
_wrong_answers: dict[str, list[str]] = {}


def start_quiz(subject: str, unit: str, difficulty: Difficulty) -> QuizSession:
    questions = generate_questions(subject=subject, unit=unit, difficulty=difficulty, count=10)
    rounds = [QuizRound(difficulty=difficulty, questions=questions)]

    session = QuizSession(
        session_id=str(uuid.uuid4()),
        subject=subject,
        unit=unit,
        rounds=rounds,
        scores={difficulty.value: 0},
    )

    _sessions[session.session_id] = session
    _wrong_answers[session.session_id] = []

    return session


def submit_answer(
    session_id: str,
    difficulty: Difficulty,
    question_id: int,
    answer: str,
) -> Optional[AnswerResponse]:
    session = _sessions.get(session_id)
    if not session:
        return None

    target_round = next((r for r in session.rounds if r.difficulty == difficulty), None)
    if not target_round:
        return None

    question = next((q for q in target_round.questions if q.id == question_id), None)
    if not question:
        return None

    correct = answer.strip().upper() == question.correct_answer.strip().upper()

    if correct:
        session.scores[difficulty.value] = session.scores.get(difficulty.value, 0) + 1
    else:
        _wrong_answers[session_id].append(question.question)

    return AnswerResponse(
        correct=correct,
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        score_so_far=session.scores[difficulty.value],
    )


def get_result(session_id: str) -> Optional[QuizResult]:
    session = _sessions.get(session_id)
    if not session:
        return None

    total = sum(session.scores.values())
    max_total = 10 * len(session.rounds)

    return QuizResult(
        session_id=session_id,
        subject=session.subject,
        unit=session.unit,
        scores=session.scores,
        total=total,
        max_total=max_total,
        weak_areas=list(dict.fromkeys(_wrong_answers.get(session_id, []))),
    )
