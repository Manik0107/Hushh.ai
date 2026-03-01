import { useRef, useState } from 'react';
import { Zap } from '../icons/Icons';
import { startQuiz, submitAnswer, getQuizResult } from '../../api';
import QuizModal from './QuizModal';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

function difficultyColour(d) {
  if (d === 'easy') return 'border-green-200 bg-green-50 text-green-800';
  if (d === 'medium') return 'border-yellow-200 bg-yellow-50 text-yellow-800';
  return 'border-red-200 bg-red-50 text-red-800';
}

function transformQuestions(apiQuestions) {
  return apiQuestions.map((q) => ({
    id: q.id,
    text: q.question,
    options: q.options.map((opt) => opt.replace(/^[A-D]\.\s*/, '')),
    correct: ['A', 'B', 'C', 'D'].indexOf(q.correct_answer.toUpperCase()),
    explanation: q.explanation,
  }));
}

export default function QuizTab({ selectedSubject, realMaterials }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [scores, setScores] = useState({});
  const sessionRef = useRef(null);
  const roundsRef = useRef(null);

  if (!selectedSubject) {
    return (
      <section className="py-24 text-center">
        <Zap size={42} className="mx-auto text-slate-600" />
        <p className="mt-3 text-sm text-slate-400">Select a subject to start quiz practice.</p>
      </section>
    );
  }


  const hasRealData = realMaterials && Object.keys(realMaterials).length > 0;
  const realUnit = hasRealData ? Object.keys(realMaterials)[0] : 'general';

  const realSubject = hasRealData ? selectedSubject.name.toLowerCase().split(' ').pop() : selectedSubject.name;

  const handleStart = async (difficulty) => {
    setError(null);
    setLoading(difficulty);
    try {
      const session = await startQuiz(realSubject, realUnit, difficulty);
      sessionRef.current = session;
      roundsRef.current = session.rounds;

      const round = session.rounds.find((r) => r.difficulty === difficulty);
      if (!round) throw new Error('Round not found in session');

      setActiveQuiz({
        id: `${session.session_id}-${difficulty}`,
        name: `${selectedSubject.name} — ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Quiz`,
        difficulty,
        questions: transformQuestions(round.questions),
        timeLimit: 10,
        sessionId: session.session_id,
      });
    } catch (err) {
      setError(err.message || 'Failed to start quiz. Is the API server running?');
    } finally {
      setLoading(null);
    }
  };

  const handleComplete = async (result) => {
    setScores((prev) => ({ ...prev, [result.difficulty]: result.scorePercent }));
    try {
      const res = await getQuizResult(result.sessionId);
      console.log('Final result:', res);
    } catch { }
  };

  const avgScore = Object.values(scores).length
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
    : 0;

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-5">
      <header className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quiz Practice</h1>
            <p className="mt-1 text-sm text-slate-400">
              {selectedSubject.name} — AI-generated quizzes across 3 difficulty levels.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <SummaryCell label="Rounds" value={3} />
            <SummaryCell label="Attempted" value={Object.keys(scores).length} />
            <SummaryCell label="Avg score" value={`${avgScore}%`} />
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {DIFFICULTIES.map((difficulty) => (
          <div
            key={difficulty}
            className="glass-card flex flex-col items-start gap-3 rounded-2xl p-5"
          >
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${difficultyColour(difficulty)}`}
            >
              {difficulty}
            </span>
            <p className="text-sm font-semibold text-slate-800 capitalize">
              {difficulty} Round
            </p>
            <p className="text-xs text-slate-500">10 AI-generated questions from your PDFs.</p>
            {scores[difficulty] !== undefined && (
              <p className="text-xs font-semibold text-slate-700">
                Last score: {scores[difficulty]}%
              </p>
            )}
            <button
              type="button"
              className="btn-primary mt-auto w-full text-sm"
              onClick={() => handleStart(difficulty)}
              disabled={loading !== null}
            >
              {loading === difficulty ? 'Generating…' : 'Start Quiz'}
            </button>
          </div>
        ))}
      </div>

      {activeQuiz && (
        <QuizModal
          key={activeQuiz.id}
          quiz={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          onComplete={(result) => {
            setActiveQuiz(null);
            handleComplete({ ...result, difficulty: activeQuiz.difficulty, sessionId: activeQuiz.sessionId });
          }}
        />
      )}
    </section>
  );
}

function SummaryCell({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}
