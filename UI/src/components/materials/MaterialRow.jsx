import { Download, FileText, ImageIcon, LinkIcon, User } from '../icons/Icons';

const TYPE_META = {
  pdf: {
    Icon: FileText,
    label: 'PDF',
    className: 'border-slate-300/35 bg-slate-100 text-slate-700',
  },
  image: {
    Icon: ImageIcon,
    label: 'Image',
    className: 'border-slate-300/35 bg-slate-100 text-slate-700',
  },
  link: {
    Icon: LinkIcon,
    label: 'Link',
    className: 'border-slate-300/35 bg-slate-100 text-slate-700',
  },
};

export default function MaterialRow({ material }) {
  const meta = TYPE_META[material.type] || TYPE_META.pdf;
  const ActionIcon = material.type === 'link' ? LinkIcon : Download;

  return (
    <article className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-slate-300/35 hover:bg-slate-50">
      <div className={`grid h-9 w-9 place-items-center rounded-lg border ${meta.className}`}>
        <meta.Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900 group-hover:text-slate-900">{material.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className={`rounded-md border px-1.5 py-0.5 font-semibold ${meta.className}`}>{meta.label}</span>
          {material.size ? <span>{material.size}</span> : null}
          <span>{material.date}</span>
        </div>
      </div>

      <div className="hidden items-center gap-1.5 text-xs text-slate-400 md:flex">
        <User size={12} className="text-slate-500" />
        <span>{material.teacher}</span>
      </div>

      <button
        type="button"
        className="btn-ghost px-2 py-2 opacity-0 transition group-hover:opacity-100"
        title={material.type === 'link' ? 'Open resource' : 'Download'}
      >
        <ActionIcon size={13} />
      </button>
    </article>
  );
}
