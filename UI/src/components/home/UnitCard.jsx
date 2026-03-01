import { FileText, User } from '../icons/Icons';

function ProgressRing({ value }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-14 w-14">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="4" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="#111827"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-bold text-slate-900">{value}%</span>
    </div>
  );
}

export default function UnitCard({ unit }) {
  return (
    <article className="glass-card glass-card-hover flex h-full flex-col gap-4 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
            U{unit.number}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{unit.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">Unit {unit.number}</p>
          </div>
        </div>

        <ProgressRing value={unit.progress} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <User size={13} className="text-slate-500" />
        <span>{unit.teacher}</span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <FileText size={13} className="text-slate-500" />
          <span>{unit.materialCount} materials</span>
        </div>

        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
            unit.progress === 100
              ? 'border-slate-300 bg-slate-100 text-slate-900'
              : unit.progress > 0
                ? 'border-slate-300 bg-slate-50 text-slate-700'
                : 'border-slate-200 bg-white text-slate-500'
          }`}
        >
          {unit.progress === 100 ? 'Complete' : unit.progress > 0 ? 'In progress' : 'Not started'}
        </span>
      </div>
    </article>
  );
}
