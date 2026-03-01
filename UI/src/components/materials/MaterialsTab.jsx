import { useRef, useState } from 'react';
import { Filter, Layers, Search, Upload } from '../icons/Icons';
import { MATERIALS_BY_SUBJECT } from '../../data/mockData';
import { uploadPDF } from '../../api';
import UnitAccordion from './UnitAccordion';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'link', label: 'Links' },
  { id: 'image', label: 'Images' },
];

export default function MaterialsTab({ selectedSubject, realMaterials }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const res = await uploadPDF(file);
      setUploadMsg({ type: 'success', text: `Ingested: ${res.filename}` });
      
      window.location.reload();
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  
  let rawUnits = [];
  if (realMaterials && Object.keys(realMaterials).length > 0) {
    rawUnits = Object.entries(realMaterials).map(([unitName, files], index) => ({
      id: `real-u${index + 1}`,
      number: index + 1,
      name: unitName,
      teacher: files[0]?.teacher || 'Uploaded',
      materialCount: files.length,
      progress: 0,
      color: ['violet', 'blue', 'emerald', 'amber', 'rose'][index % 5],
      files: files.map((f, i) => ({
        id: `real-f-${index}-${i}`,
        name: f.name,
        type: f.type,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        teacher: f.teacher,
        size: 'PDF',
      })),
    }));
  } else {
    
    rawUnits = (selectedSubject ? MATERIALS_BY_SUBJECT[selectedSubject.id] : []) || [];
  }

  const normalized = query.trim().toLowerCase();
  const filteredUnits = rawUnits
    .map((unit) => {
      const files = unit.files.filter((file) => {
        const typeMatches = filter === 'all' || file.type === filter;
        const textMatches =
          !normalized ||
          file.name.toLowerCase().includes(normalized) ||
          (file.teacher && file.teacher.toLowerCase().includes(normalized));

        return typeMatches && textMatches;
      });

      return {
        ...unit,
        files,
      };
    })
    .filter((unit) => unit.files.length > 0);

  const fileCount = filteredUnits.reduce((total, unit) => total + unit.files.length, 0);

  if (!selectedSubject) {
    return (
      <section className="py-24 text-center">
        <Layers size={42} className="mx-auto text-slate-600" />
        <p className="mt-3 text-sm text-slate-400">Select a subject to view uploaded materials.</p>
      </section>
    );
  }

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-5">
      <header className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Materials</h1>
            <p className="mt-1 text-sm text-slate-400">
              {selectedSubject.name} - {fileCount} matching files across {filteredUnits.length} units
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              type="button"
              className="btn-primary text-sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} />
              {uploading ? 'Uploading…' : 'Upload PDF'}
            </button>
            {uploadMsg && (
              <p className={`text-xs ${uploadMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {uploadMsg.text}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[220px] flex-1">

            {!query &&
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            }<input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="    Search by file name or teacher"
              className="input-field pl-9"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <Filter size={14} className="ml-1 text-slate-400" />
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setFilter(option.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${filter === option.id
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {filteredUnits.length ? (
        <div className="space-y-3">
          {filteredUnits.map((unit, index) => (
            <UnitAccordion key={unit.unitId} unitData={unit} defaultOpen={index === 0} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl py-16 text-center text-slate-400">
          No materials matched this filter.
        </div>
      )}
    </section>
  );
}
