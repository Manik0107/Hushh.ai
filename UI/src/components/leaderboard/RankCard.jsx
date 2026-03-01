import { Medal, Zap } from '../icons/Icons';

const TOP_THEME = {
  1: {
    border: 'border-slate-300',
    bg: 'from-slate-100 to-white',
  },
  2: {
    border: 'border-slate-300',
    bg: 'from-slate-50 to-white',
  },
  3: {
    border: 'border-slate-300',
    bg: 'from-slate-100 to-white',
  },
};

export default function RankCard({ entry, isCurrentUser }) {
  if (entry.rank <= 3) {
    const topTheme = TOP_THEME[entry.rank];

    return (
      <article className={`rounded-2xl border bg-gradient-to-br p-4 ${topTheme.border} ${topTheme.bg}`}>
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-slate-300 text-slate-700">
            <Medal size={20} />
          </div>

          <div
            className={`grid h-11 w-11 place-items-center rounded-full text-sm font-bold ${
              isCurrentUser ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {entry.avatar}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-slate-900">
                #{entry.rank} {entry.name}
              </p>
              {isCurrentUser ? (
                <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  You
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span>{entry.badge}</span>
              <span className="inline-flex items-center gap-1">
                <Zap size={11} />
                {entry.quizzesTaken} quizzes
              </span>
              <span>{entry.streak} day streak</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-slate-900">{entry.score.toLocaleString()}</p>
            <p className="text-xs text-slate-500">points</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        isCurrentUser ? 'border-slate-300 bg-slate-100' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <p className="w-10 text-sm font-bold text-slate-500">#{entry.rank}</p>

      <div
        className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${
          isCurrentUser ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
        }`}
      >
        {entry.avatar}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{entry.name}</p>
          {isCurrentUser ? (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">You</span>
          ) : null}
        </div>
        <p className="text-xs text-slate-500">{entry.badge}</p>
      </div>

      <p className="hidden text-xs text-slate-600 sm:block">{entry.quizzesTaken} quizzes</p>
      <p className="w-20 text-right text-sm font-bold text-slate-900">{entry.score.toLocaleString()}</p>
    </article>
  );
}
