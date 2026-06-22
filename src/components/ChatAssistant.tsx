import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';

export default function ChatAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "wel-1",
      sender: "bot",
      text: "Hello! I am the MedSpatial AI clinical education assistant. I have RAG access to our active medical knowledge base, regional outbreak monitors, and spatio-temporal disease coordinates.\n\nYou can ask me about typical vector disease systems, seasonal spikes, preventative care, or specific symptoms.\n\n*This result is not a medical diagnosis. Please consult a healthcare professional.*",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      });
      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        sender: "bot",
        text: "I encountered a routing error communicating with the NLP medical server. Please try submitting again. This result is not a medical diagnosis. Please consult a healthcare professional.",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const presetQueries = [
    "What are typical Malaria symptoms?",
    "What precautions prevent Cholera?",
    "How does Meningitis correlate to the Harmattan dry season?",
    "Tell me about Lassa Fever rodent prevention."
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="medical_chat_assistant">
      {/* Informative Side Panel explaining RAG */}
      <div className="lg:col-span-4 bento-card p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-50 dark:bg-sky-950 rounded-xl">
            <Sparkles className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Pathogen Knowledge Base</h3>
            <p className="text-xs text-slate-505 font-medium">Retrieval-Augmented Generation (RAG)</p>
          </div>
        </div>

        <p className="text-xs text-slate-650 leading-relaxed">
          The assistant connects to a structured server-side RAG engine populated with World Health Organization guidelines, regional pathogen prevalence, and active vector multipliers.
        </p>

        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="block text-[10px] uppercase font-mono font-extrabold text-slate-400">Quick Clinical Triggers</span>
          <div className="space-y-1.5">
            {presetQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(query)}
                disabled={sending}
                className="w-full p-2.5 bg-slate-50 hover:bg-sky-50/50 dark:bg-slate-950/40 dark:hover:bg-slate-800/50 border border-slate-150 dark:border-slate-850/60 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-350 transition leading-relaxed block"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dialogue Box */}
      <div className="lg:col-span-8 bento-card p-6 flex flex-col justify-between min-h-[460px] max-h-[580px]">
        {/* Dialogue View Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-1 ${
                m.sender === 'user'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-950/50 text-slate-200 border border-white/10 shadow-sm'
              }`}>
                {/* Paragraph spacing inside chat */}
                {m.text.split('\n').map((paragraph, idx) => (
                  <p key={idx} className={paragraph.startsWith('*') ? "italic font-semibold text-sky-600 dark:text-sky-400 mt-2 block" : ""}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {sending && (
            <div className="flex items-center space-x-2 text-xs text-slate-450 animate-pulse bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-150 inline-block">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
              <span>Querying medical RAG index...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Text Tray */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputVal);
          }}
          className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={sending}
            placeholder="Ask about vector disease symptoms, preventions, or regional outbreaks..."
            className="flex-1 px-4 py-3 bg-slate-950/40 text-slate-200 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-sky-400 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={sending || !inputVal.trim()}
            className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-md cursor-pointer disabled:opacity-50 hover:shadow-sky-505/20 transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
