from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from quiz.engine import get_result, start_quiz, submit_answer
from quiz.models import AnswerRequest, AnswerResponse, Difficulty, QuizResult, QuizSession

router = APIRouter(prefix="/quiz", tags=["Quiz"])


class StartRequest(BaseModel):
    subject: str
    unit: str
    difficulty: Difficulty


@router.post("/start", response_model=QuizSession)
async def quiz_start(request: StartRequest) -> QuizSession:
    try:
        session = start_quiz(subject=request.subject, unit=request.unit, difficulty=request.difficulty)
        return session
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/answer", response_model=AnswerResponse)
async def quiz_answer(request: AnswerRequest) -> AnswerResponse:
    result = submit_answer(
        session_id=request.session_id,
        difficulty=request.difficulty,
        question_id=request.question_id,
        answer=request.answer,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Session or question not found.")
    return result


@router.get("/result/{session_id}", response_model=QuizResult)
async def quiz_result(session_id: str) -> QuizResult:
    result = get_result(session_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Session not found.")
    return result
