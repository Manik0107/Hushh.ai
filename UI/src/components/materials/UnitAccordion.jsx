import { useState } from 'react';
import { ChevronDown, FileText, ImageIcon, LinkIcon } from '../icons/Icons';
import MaterialRow from './MaterialRow';

export default function UnitAccordion({ unitData, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const pdfCount = unitData.files.filter((file) => file.type === 'pdf').length;
  const linkCount = unitData.files.filter((file) => file.type === 'link').length;
  const imageCount = unitData.files.filter((file) => file.type === 'image').length;

  return (
    <section className="glass-card overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">{unitData.unitName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Tag icon={FileText} value={pdfCount} label="PDF" color="text-slate-700" />
            <Tag icon={ImageIcon} value={imageCount} label="Image" color="text-slate-700" />
            <Tag icon={LinkIcon} value={linkCount} label="Link" color="text-slate-700" />
            <span>{unitData.files.length} files</span>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-slate-700' : ''}`}
        />
      </button>

      <div
        className="overflow-hidden border-t border-slate-200 transition-all duration-300"
        style={{ maxHeight: isOpen ? `${unitData.files.length * 86}px` : '0px' }}
      >
        <div className="space-y-1.5 p-2.5">
          {unitData.files.map((file) => (
            <MaterialRow key={file.id} material={file} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Tag({ icon, value, label, color }) {
  if (!value) {
    return null;
  }

  const TagIcon = icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 ${color}`}>
      <TagIcon size={11} />
      {value} {label}
    </span>
  );
}
