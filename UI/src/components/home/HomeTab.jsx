import { BookOpen, AlertCircle, Layers } from '../icons/Icons';
import { UNITS_BY_SUBJECT } from '../../data/mockData';
import UnitCard from './UnitCard';

export default function HomeTab({ selectedSubject, selectedSemester, onGoToMaterials, realMaterials }) {
  if (!selectedSubject) {
    return (
      <section className="animate-[fade-in_220ms_ease-out] py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-300/30 bg-slate-100 text-slate-700">
          <BookOpen size={30} />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-900">Welcome to Hushh Study</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400 sm:text-base">
          Select your semester and subject from the top bar to unlock units, discussions, quiz practice, and leaderboard tracking.
        </p>
      </section>
    );
  }

  let units = [];
  if (realMaterials && Object.keys(realMaterials).length > 0) {
    units = Object.entries(realMaterials).map(([unitName, files], index) => ({
      id: `real-u${index + 1}`,
      number: index + 1,
      name: unitName,
      teacher: files[0]?.teacher || 'Uploaded',
      materialCount: files.length,
      progress: 0,
      color: ['violet', 'blue', 'emerald', 'amber', 'rose'][index % 5],
    }));
  } else {
    units = UNITS_BY_SUBJECT[selectedSubject.id] || [];
  }
  const completedCount = units.filter((unit) => unit.progress === 100).length;
  const inProgressCount = units.filter((unit) => unit.progress > 0 && unit.progress < 100).length;
  const totalMaterials = units.reduce((total, unit) => total + unit.materialCount, 0);
  const averageProgress = units.length
    ? Math.round(units.reduce((total, unit) => total + unit.progress, 0) / units.length)
    : 0;

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-6">
      <div className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-400/40 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Semester {selectedSemester}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                {selectedSubject.code}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{selectedSubject.name}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {units.length} units, {totalMaterials} total materials
            </p>
          </div>

          <div className="rounded-xl border border-slate-400/35 bg-slate-100 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-slate-700">Average progress</p>
            <p className="text-2xl font-bold text-slate-900">{averageProgress}%</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Completed" value={completedCount} tone="emerald" />
          <StatCard label="In progress" value={inProgressCount} tone="violet" />
          <StatCard label="Not started" value={units.length - completedCount - inProgressCount} tone="slate" />
          <StatCard label="Materials" value={totalMaterials} tone="blue" />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Course units</h2>
          <button type="button" onClick={onGoToMaterials} className="btn-secondary text-xs">
            <Layers size={14} />
            Open materials
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      </div>


    </section>
  );
}

function StatCard({ label, value, tone }) {
  const toneMap = {
    emerald: 'border-slate-300/35 bg-slate-100 text-slate-700',
    violet: 'border-slate-300/35 bg-slate-100 text-slate-700',
    slate: 'border-slate-300/20 bg-slate-100 text-slate-700',
    blue: 'border-slate-300/35 bg-slate-100 text-slate-700',
  };

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneMap[tone]}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
