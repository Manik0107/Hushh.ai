import { Bot, Send, Sparkles, User, X } from '../icons/Icons';

function MessageBubble({ message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <article className={`flex gap-2 ${isAssistant ? '' : 'justify-end'}`}>
      {isAssistant ? (
        <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-900 text-white">
          <Bot size={14} />
        </div>
      ) : null}

      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isAssistant
            ? 'border border-slate-200 bg-white text-slate-900'
            : 'bg-slate-900 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        <p className="mt-1 text-[11px] text-slate-400">{message.time}</p>
      </div>

      {!isAssistant ? (
        <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-700">
          <User size={13} />
        </div>
      ) : null}
    </article>
  );
}

export default function ChatDrawer({
  open,
  onClose,
  messages,
  draft,
  onDraftChange,
  onSend,
  isTyping,
  quickPrompts,
  onUsePrompt,
  selectedSubject,
  units,
  selectedUnitId,
  onSelectUnit,
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/35 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-[61] h-screen w-full max-w-md border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">AI Study Assistant</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {selectedSubject ? selectedSubject.name : 'Select subject to get contextual answers'}
            </p>
          </div>

          <button type="button" onClick={onClose} className="btn-ghost px-2 py-2" aria-label="Close assistant">
            <X size={15} />
          </button>
        </header>

        <div className="border-b border-slate-200 px-4 py-3">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="ai-unit">
            Context unit
          </label>
          <select
            id="ai-unit"
            value={selectedUnitId || ''}
            onChange={(event) => onSelectUnit(event.target.value)}
            className="input-field text-sm"
            disabled={!units.length}
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                Unit {unit.number} - {unit.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex h-[calc(100%-13rem)] flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isTyping ? (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <Sparkles size={13} className="text-slate-600" />
                <div className="flex items-center gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
                AI is thinking
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200 px-4 py-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
                  onClick={() => onUsePrompt(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
                className="input-field"
                placeholder="Ask for summary, revision plan, or quiz tips"
              />
              <button type="submit" className="btn-primary px-3 py-2" aria-label="Send message">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
