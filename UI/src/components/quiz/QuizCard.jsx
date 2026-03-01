import { Clock, Star, Zap } from '../icons/Icons';

function difficultyClass(difficulty) {
  const normalized = difficulty.toLowerCase();
  if (normalized === 'easy') {
    return 'badge-easy';
  }
  if (normalized === 'hard') {
    return 'badge-hard';
  }
  return 'badge-medium';
}

export default function QuizCard({ quiz, onStart, lastAttempt }) {
  return (
    <article className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">{quiz.unitName}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{quiz.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className={`rounded-full px-2 py-0.5 font-semibold ${difficultyClass(quiz.difficulty)}`}>
              {quiz.difficulty}
            </span>
            <span className="inline-flex items-center gap-1">
              <Zap size={12} className="text-slate-600" />
              {quiz.questionCount} questions
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              {quiz.timeLimit} min
            </span>
          </div>
        </div>

        <button type="button" onClick={() => onStart(quiz)} className="btn-primary text-sm">
          Start quiz
        </button>
      </div>

      {lastAttempt ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-900">Last attempt</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-slate-700">
              <Star size={12} />
              {lastAttempt.scorePercent}%
            </span>
            <span>
              {lastAttempt.correctAnswers}/{lastAttempt.totalQuestions} correct
            </span>
            <span>{lastAttempt.completedAt}</span>
          </div>
        </div>
      ) : null}
    </article>
  );
}
