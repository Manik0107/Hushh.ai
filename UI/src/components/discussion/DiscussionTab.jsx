import { useState } from 'react';
import { MessageSquare, Plus, Search } from '../icons/Icons';
import { THREADS_BY_SUBJECT, UNITS_BY_SUBJECT } from '../../data/mockData';
import NewQueryModal from './NewQueryModal';
import ThreadCard from './ThreadCard';
import ThreadDetail from './ThreadDetail';

function normalizeThread(thread) {
  const comments = Array.isArray(thread.comments) ? thread.comments : [];
  return {
    ...thread,
    comments,
    commentCount: typeof thread.commentCount === 'number' ? thread.commentCount : comments.length,
  };
}

export default function DiscussionTab({ selectedSubject }) {
  const baseThreads = (selectedSubject ? THREADS_BY_SUBJECT[selectedSubject.id] : []) || [];
  const units = (selectedSubject ? UNITS_BY_SUBJECT[selectedSubject.id] : []) || [];

  const [threads, setThreads] = useState(() => baseThreads.map(normalizeThread));
  const [query, setQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState(null);

  if (!selectedSubject) {
    return (
      <section className="py-24 text-center">
        <MessageSquare size={42} className="mx-auto text-slate-600" />
        <p className="mt-3 text-sm text-slate-400">Select a subject to open the discussion forum.</p>
      </section>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredThreads = normalizedQuery
    ? threads.filter((thread) => {
        return (
          thread.title.toLowerCase().includes(normalizedQuery) ||
          thread.description.toLowerCase().includes(normalizedQuery) ||
          thread.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
          thread.author.name.toLowerCase().includes(normalizedQuery)
        );
      })
    : threads;

  const selectedThread = threads.find((thread) => thread.id === selectedThreadId);

  const handleCreateThread = ({ title, description, tags, unitId }) => {
    const targetUnit = units.find((unit) => unit.id === unitId);
    const unitTag = targetUnit ? `Unit ${targetUnit.number}` : null;

    const nextThread = normalizeThread({
      id: `local-thread-${Date.now()}`,
      title,
      description,
      tags: unitTag ? [unitTag, ...tags] : tags,
      author: { name: 'You', avatar: 'YO' },
      upvotes: 0,
      downvotes: 0,
      timeAgo: 'just now',
      comments: [],
    });

    setThreads((current) => [nextThread, ...current]);
    setShowNewModal(false);
  };

  const handleAddComment = (threadId, text) => {
    setThreads((current) =>
      current.map((thread) => {
        if (thread.id !== threadId) {
          return thread;
        }

        const nextComment = {
          id: `${threadId}-reply-${Date.now()}`,
          author: { name: 'You', avatar: 'YO' },
          text,
          timeAgo: 'just now',
          upvotes: 0,
        };

        const comments = [...thread.comments, nextComment];
        return {
          ...thread,
          comments,
          commentCount: comments.length,
        };
      }),
    );
  };

  if (selectedThread) {
    return <ThreadDetail thread={selectedThread} onBack={() => setSelectedThreadId(null)} onAddComment={handleAddComment} />;
  }

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-5">
      <header className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discussion Forum</h1>
            <p className="mt-1 text-sm text-slate-400">{selectedSubject.name} - ask doubts, share resources, and help peers.</p>
          </div>

          <button type="button" onClick={() => setShowNewModal(true)} className="btn-primary text-sm">
            <Plus size={14} />
            New query
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="relative">

            {query == '' && 
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            }<input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="     Search threads by title, tag, or author"
              className="input-field pl-9"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {filteredThreads.length} threads
          </div>
        </div>
      </header>

      <div className="space-y-3">
        {filteredThreads.length ? (
          filteredThreads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} onOpen={() => setSelectedThreadId(thread.id)} />
          ))
        ) : (
          <div className="glass-card rounded-2xl py-14 text-center text-slate-400">No discussions matched your search.</div>
        )}
      </div>

      {showNewModal ? (
        <NewQueryModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateThread}
          units={units}
        />
      ) : null}
    </section>
  );
}
