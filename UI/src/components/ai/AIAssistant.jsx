import { useEffect, useMemo, useRef, useState } from 'react';
import { sendChatMessage } from '../../api';
import { AI_QUICK_PROMPTS } from '../../data/mockData';
import { Brain } from '../icons/Icons';
import ChatDrawer from './ChatDrawer';

function nowLabel() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function AIAssistant({ open, onOpenChange, selectedSubject, units, realMaterials }) {
  const introText = selectedSubject
    ? `I am ready to help with ${selectedSubject.name}. Ask for summaries, revision plans, or likely quiz questions.`
    : 'I am your AI study assistant. Select a subject first so I can answer with context.';

  
  const hasRealData = realMaterials && Object.keys(realMaterials).length > 0;
  const activeUnits = hasRealData
    ? Object.keys(realMaterials).map((name, i) => ({ id: `ru-${i}`, name }))
    : units;

  const [messages, setMessages] = useState([
    { id: `intro-${selectedSubject?.id || 'none'}`, role: 'assistant', text: introText, time: 'Now' },
  ]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const sessionIdRef = useRef(`session-${Date.now()}`);

  const quickPrompts = useMemo(() => AI_QUICK_PROMPTS.slice(0, 3), []);

  useEffect(() => {
    
    if (activeUnits.length > 0 && (!selectedUnitId || !activeUnits.find(u => u.id === selectedUnitId))) {
      setSelectedUnitId(activeUnits[0].id);
    }
  }, [activeUnits, selectedUnitId]);

  const pushAssistantReply = async (prompt) => {
    setIsTyping(true);
    try {
      const activeUnitName = activeUnits.find(u => u.id === selectedUnitId)?.name || '';
      const contextPrompt = selectedSubject
        ? `[Subject: ${selectedSubject.name} | Unit: ${activeUnitName}] ${prompt}`
        : prompt;

      const data = await sendChatMessage(contextPrompt, sessionIdRef.current);

      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: 'assistant', text: data.answer, time: nowLabel() },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: 'Sorry, I could not reach the backend. Make sure the API server is running.',
          time: nowLabel(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = (text = draft) => {
    const message = text.trim();
    if (!message || isTyping) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text: message, time: nowLabel() },
    ]);
    setDraft('');
    pushAssistantReply(message);
  };

  return (
    <>
      <button
        type="button"
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-lg transition ${open
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-900 bg-slate-900 text-white hover:bg-black'
          }`}
        onClick={() => onOpenChange(!open)}
      >
        <Brain size={15} />
        AI Tutor
        <span className="inline-block h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
      </button>

      <ChatDrawer
        open={open}
        onClose={() => onOpenChange(false)}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSend={() => sendMessage()}
        isTyping={isTyping}
        quickPrompts={quickPrompts}
        onUsePrompt={(prompt) => {
          onOpenChange(true);
          sendMessage(prompt);
        }}
        selectedSubject={selectedSubject}
        units={activeUnits}
        selectedUnitId={selectedUnitId}
        onSelectUnit={setSelectedUnitId}
      />
    </>
  );
}
