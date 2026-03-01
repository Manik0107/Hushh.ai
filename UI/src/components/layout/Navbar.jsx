import { BookOpen, Brain, Menu, Sparkles } from '../icons/Icons';

export default function Navbar({
  semesterOptions,
  selectedSemester,
  onSemesterChange,
  subjects,
  selectedSubjectId,
  onSubjectChange,
  selectedSubject,
  onToggleSidebar,
  onToggleAssistant,
  assistantOpen,
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="btn-ghost absolute left-3 top-1/2 inline-flex -translate-y-1/2"
        aria-label="Toggle navigation"
      >
        <Menu size={17} />
      </button>

      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-2 px-3 pl-14 sm:gap-3 sm:px-5 sm:pl-14">


        <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <BookOpen size={18} />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-semibold text-slate-900">
              Study<span className="gradient-text">Buddy</span>
            </p>
            <p className="truncate text-xs text-slate-500">Smart workspace for semester prep</p>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          {selectedSubject ? (
            <div className="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              <Brain size={14} className="text-slate-600" />
              <span className="truncate">Semester {selectedSemester}</span>
              <span className="text-slate-400">/</span>
              <span className="truncate font-medium text-slate-800">{selectedSubject.name}</span>
              <span className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-600">
                {selectedSubject.code}
              </span>
            </div>
          ) : (
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              Select semester and subject to begin
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:gap-3">
          <select
            aria-label="Select semester"
            value={selectedSemester}
            onChange={(event) => onSemesterChange(Number(event.target.value))}
            className="input-field w-20 !py-2 text-xs sm:w-28 lg:w-36 sm:text-sm"
          >
            {semesterOptions.map((semesterNumber) => (
              <option key={semesterNumber} value={semesterNumber}>
                Semester {semesterNumber}
              </option>
            ))}
          </select>

          <select
            aria-label="Select subject"
            value={selectedSubjectId || ''}
            onChange={(event) => onSubjectChange(event.target.value)}
            className="input-field w-24 !py-2 text-xs sm:w-40 lg:w-56 sm:text-sm"
            disabled={!subjects.length}
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

        </div>
      </div>
    </header>
  );
}
