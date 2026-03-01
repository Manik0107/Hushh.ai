import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Timer, X } from '../icons/Icons';

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function QuizModal({ quiz, onClose, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [submitted, setSubmitted] = useState(false);
  const hasCompletedRef = useRef(false);

  const result = useMemo(() => {
    const totalQuestions = quiz.questions.length;
    const correctAnswers = quiz.questions.reduce((total, question) => {
      return selectedAnswers[question.id] === question.correct ? total + 1 : total;
    }, 0);

    const scorePercent = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return {
      totalQuestions,
      correctAnswers,
      scorePercent,
    };
  }, [quiz.questions, selectedAnswers]);

  const submitQuiz = useCallback(() => {
    if (hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    setSubmitted(true);

    onComplete({
      quizId: quiz.id,
      scorePercent: result.scorePercent,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      completedAt: 'just now',
    });
  }, [onComplete, quiz.id, result.correctAnswers, result.scorePercent, result.totalQuestions]);

  useEffect(() => {
    if (submitted) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, submitQuiz]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [onClose]);

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];
  const attemptedCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div
      className="fixed inset-0 z-[72] flex items-center justify-center p-3 sm:p-5 bg-black/35 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex w-full max-w-4xl max-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quiz session</p>
            <h2 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{quiz.name}</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${timeLeft <= 60 ? 'border-slate-400 bg-slate-100 text-slate-900' : 'border-slate-300 bg-slate-50 text-slate-700'
                }`}
            >
              <Timer size={12} />
              {formatTime(timeLeft)}
            </span>

            <button type="button" onClick={onClose} className="btn-ghost px-2 py-2" aria-label="Close quiz">
              <X size={15} />
            </button>
          </div>
        </header>

        {!submitted ? (
          <>
            <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
              <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span>{attemptedCount} answered</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <article className="glass-card rounded-2xl p-4 sm:p-5">
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">{currentQuestion.text}</h3>

                <div className="mt-4 space-y-2.5">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const selected = selectedAnswers[currentQuestion.id] === optionIndex;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setSelectedAnswers((current) => ({
                            ...current,
                            [currentQuestion.id]: optionIndex,
                          }))
                        }
                        className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition ${selected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                      >
                        <span className="mr-2 text-xs font-semibold text-slate-500">{String.fromCharCode(65 + optionIndex)}.</span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </article>
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 sm:px-6">
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                disabled={currentIndex === 0}
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    className="btn-primary text-sm"
                    onClick={() => setCurrentIndex((index) => Math.min(questions.length - 1, index + 1))}
                  >
                    Next question
                  </button>
                ) : (
                  <button type="button" className="btn-primary text-sm" onClick={submitQuiz}>
                    Submit quiz
                  </button>
                )}
              </div>
            </footer>
          </>
        ) : (
          <div className="grid flex-1 place-items-center px-4 py-6">
            <article className="glass-card w-full max-w-lg rounded-2xl p-6 text-center">
              <CheckCircle size={42} className="mx-auto text-slate-700" />
              <h3 className="mt-3 text-2xl font-bold text-slate-900">Quiz completed</h3>
              <p className="mt-1 text-sm text-slate-600">You can retry this quiz anytime to improve your score.</p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <ResultCell label="Score" value={`${result.scorePercent}%`} />
                <ResultCell label="Correct" value={`${result.correctAnswers}`} />
                <ResultCell label="Time left" value={formatTime(timeLeft)} />
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                <button type="button" className="btn-secondary text-sm" onClick={onClose}>
                  Close
                </button>
              </div>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCell({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
