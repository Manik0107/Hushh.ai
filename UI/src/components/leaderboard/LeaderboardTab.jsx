import { useState } from 'react';
import { BarChart2, Trophy } from '../icons/Icons';
import { LEADERBOARD_BY_SUBJECT, UNITS_BY_SUBJECT } from '../../data/mockData';
import RankCard from './RankCard';

export default function LeaderboardTab({ selectedSubject }) {
  const [mode, setMode] = useState('total');
  const [selectedUnit, setSelectedUnit] = useState('u1');

  if (!selectedSubject) {
    return (
      <section className="py-24 text-center">
        <Trophy size={42} className="mx-auto text-slate-600" />
        <p className="mt-3 text-sm text-slate-400">Select a subject to view the leaderboard.</p>
      </section>
    );
  }

  const leaderboard = LEADERBOARD_BY_SUBJECT[selectedSubject.id] || { total: [], byUnit: {} };
  const units = UNITS_BY_SUBJECT[selectedSubject.id] || [];
  const entries = mode === 'total' ? leaderboard.total || [] : leaderboard.byUnit[selectedUnit] || [];
  const currentUser = entries.find((entry) => entry.isCurrentUser);

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-5">
      <header className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Leaderboard</h1>
            <p className="mt-1 text-sm text-slate-400">{selectedSubject.name} - {entries.length} ranked students</p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMode('total')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                mode === 'total' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Total score
            </button>
            <button
              type="button"
              onClick={() => setMode('unit')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                mode === 'unit' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Unit wise
            </button>
          </div>
        </div>

        {mode === 'unit' ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {units.map((unit) => (
              <button
                key={unit.id}
                type="button"
                onClick={() => setSelectedUnit(unit.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  selectedUnit === unit.id
                    ? 'border-slate-300/45 bg-slate-100 text-slate-900'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Unit {unit.number}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {currentUser ? (
        <div className="glass-card flex items-center gap-3 rounded-xl p-4">
          <BarChart2 size={18} className="text-slate-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">Your rank: #{currentUser.rank}</p>
            <p className="text-xs text-slate-400">Score: {currentUser.score.toLocaleString()} points</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-2.5">
        {entries.map((entry) => (
          <RankCard key={`${mode}-${entry.rank}-${entry.name}`} entry={entry} isCurrentUser={Boolean(entry.isCurrentUser)} />
        ))}
      </div>
    </section>
  );
}
