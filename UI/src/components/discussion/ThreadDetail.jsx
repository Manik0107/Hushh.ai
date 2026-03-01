import { useState } from 'react';
import { ChevronLeft, Send, ThumbsDown, ThumbsUp } from '../icons/Icons';

function CommentRow({ comment }) {
  return (
    <article className="flex gap-3 border-t border-slate-200 py-3 first:border-t-0 first:pt-0">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-900">
        {comment.author.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-slate-900">{comment.author.name}</p>
          <p className="text-xs text-slate-500">{comment.timeAgo}</p>
        </div>
        <p className="mt-1 text-sm text-slate-600">{comment.text}</p>
      </div>
    </article>
  );
}

export default function ThreadDetail({ thread, onBack, onAddComment }) {
  const [vote, setVote] = useState(null);
  const [reply, setReply] = useState('');

  const helpfulCount = thread.upvotes + (vote === 'up' ? 1 : 0);
  const notHelpfulCount = thread.downvotes + (vote === 'down' ? 1 : 0);

  const submitReply = () => {
    const text = reply.trim();
    if (!text) {
      return;
    }

    onAddComment(thread.id, text);
    setReply('');
  };

  return (
    <section className="animate-[fade-in_220ms_ease-out] space-y-4">
      <button type="button" onClick={onBack} className="btn-ghost text-sm">
        <ChevronLeft size={14} />
        Back to discussions
      </button>

      <article className="glass-card rounded-2xl p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {thread.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-xl font-bold text-slate-900">{thread.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{thread.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 font-semibold text-slate-900">
              {thread.author.avatar}
            </span>
            {thread.author.name}
          </span>
          <span>{thread.timeAgo}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`btn-ghost text-xs ${vote === 'up' ? 'border-slate-300/45 bg-slate-100 text-slate-900' : ''}`}
            onClick={() => setVote((current) => (current === 'up' ? null : 'up'))}
          >
            <ThumbsUp size={13} />
            Helpful ({helpfulCount})
          </button>

          <button
            type="button"
            className={`btn-ghost text-xs ${vote === 'down' ? 'border-slate-300/45 bg-slate-100 text-slate-900' : ''}`}
            onClick={() => setVote((current) => (current === 'down' ? null : 'down'))}
          >
            <ThumbsDown size={13} />
            Not helpful ({notHelpfulCount})
          </button>
        </div>
      </article>

      <article className="glass-card rounded-2xl p-5 sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Replies ({thread.comments.length})</h3>
        <div className="mt-3 space-y-1">
          {thread.comments.length ? (
            thread.comments.map((comment) => <CommentRow key={comment.id} comment={comment} />)
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-400">
              No replies yet. Add the first answer.
            </p>
          )}
        </div>
      </article>

      <article className="glass-card rounded-2xl p-5 sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">Post an answer</h3>
        <textarea
          rows={4}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Write your explanation, suggestion, or resource link"
          className="input-field mt-3 resize-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">Keep answers short and clear for faster peer review.</p>
          <button type="button" onClick={submitReply} className="btn-primary text-sm" disabled={!reply.trim()}>
            <Send size={13} />
            Post answer
          </button>
        </div>
      </article>
    </section>
  );
}
