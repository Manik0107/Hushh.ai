import { useMemo, useState } from 'react';
import { Plus, X } from '../icons/Icons';

export default function NewQueryModal({ onClose, onCreate, units }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitId, setUnitId] = useState(units[0]?.id || 'all');
  const [tagText, setTagText] = useState('Help,Concept');

  const tagPreview = useMemo(
    () => tagText.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 5),
    [tagText],
  );

  const canSubmit = title.trim().length >= 8 && description.trim().length >= 15;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-xl rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create new query</h3>
            <p className="mt-1 text-sm text-slate-400">Ask your doubt clearly so peers and faculty can respond quickly.</p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-2 py-2" aria-label="Close dialog">
            <X size={15} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="query-title">
              Title
            </label>
            <input
              id="query-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="input-field"
              placeholder="Example: How to approach memory allocation numericals?"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="query-description">
              Description
            </label>
            <textarea
              id="query-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="input-field resize-none"
              placeholder="Explain what you tried and where you are stuck"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="query-unit">
                Unit
              </label>
              <select
                id="query-unit"
                value={unitId}
                onChange={(event) => setUnitId(event.target.value)}
                className="input-field"
              >
                {units.length ? (
                  units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Unit {unit.number}
                    </option>
                  ))
                ) : (
                  <option value="all">All Units</option>
                )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600" htmlFor="query-tags">
                Tags (comma separated)
              </label>
              <input
                id="query-tags"
                value={tagText}
                onChange={(event) => setTagText(event.target.value)}
                className="input-field"
                placeholder="Help,Exam,Unit 3"
              />
            </div>
          </div>

          {tagPreview.length ? (
            <div className="flex flex-wrap gap-1.5">
              {tagPreview.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Minimum 8 chars title and 15 chars description.</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-45"
              onClick={() => {
                onCreate({
                  title: title.trim(),
                  description: description.trim(),
                  tags: tagPreview.length ? tagPreview : ['Help'],
                  unitId,
                });
              }}
            >
              <Plus size={14} />
              Post query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
