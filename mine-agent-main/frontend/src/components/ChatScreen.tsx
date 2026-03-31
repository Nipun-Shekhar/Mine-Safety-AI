import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getChatResponse } from '../services/geminiService';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: string;
}

// --- Markdown-to-JSX renderer for AI responses ---
const renderFormattedContent = (content: string): React.ReactNode => {
  const blocks = content.split(/\n\n+/);

  return blocks.map((block, blockIdx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    const lines = trimmed.split('\n');
    const isNumberedList = lines.every(l => /^\s*\d+[\.\)]\s+/.test(l.trim()) || !l.trim());
    const isBulletList = lines.every(l => /^\s*[-•*]\s+/.test(l.trim()) || !l.trim());

    if (isNumberedList || isBulletList) {
      return (
        <ol key={blockIdx} className={`space-y-2 my-3 ${isNumberedList ? 'list-decimal' : 'list-disc'} pl-5`}>
          {lines.filter(l => l.trim()).map((line, i) => {
            const text = line.replace(/^\s*(\d+[\.\)]|[-•*])\s+/, '');
            return (
              <li key={i} className="text-[14px] text-slate-200 leading-relaxed">
                {renderInlineMarkdown(text)}
              </li>
            );
          })}
        </ol>
      );
    }

    const headingMatch = trimmed.match(/^\*\*(.+?)\*\*:?\s*([\s\S]*)$/);
    if (headingMatch && !headingMatch[2].includes('\n')) {
      return (
        <div key={blockIdx} className="my-2">
          <span className="font-bold text-white text-[15px]">{headingMatch[1]}</span>
          {headingMatch[2] && <span className="text-slate-300 text-[14px]"> {headingMatch[2]}</span>}
        </div>
      );
    }

    return (
      <p key={blockIdx} className="text-[14px] text-slate-200 leading-[1.8] my-2">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });
};

const renderInlineMarkdown = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);
    const codeMatch = remaining.match(/`([^`]+?)`/);

    let earliest: { match: RegExpMatchArray; type: string } | null = null;
    for (const [type, match] of [['bold', boldMatch], ['italic', italicMatch], ['code', codeMatch]] as const) {
      if (match && match.index !== undefined) {
        if (!earliest || match.index < earliest.match.index!) {
          earliest = { match, type };
        }
      }
    }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    const { match, type } = earliest;
    const idx = match.index!;

    if (idx > 0) {
      parts.push(remaining.substring(0, idx));
    }

    if (type === 'bold') {
      parts.push(<strong key={key++} className="font-semibold text-white">{match[1]}</strong>);
    } else if (type === 'italic') {
      parts.push(<em key={key++} className="italic text-slate-300">{match[1]}</em>);
    } else if (type === 'code') {
      parts.push(
        <code key={key++} className="bg-white/10 text-amber-300 px-1.5 py-0.5 rounded text-[13px] font-mono">
          {match[1]}
        </code>
      );
    }

    remaining = remaining.substring(idx + match[0].length);
  }

  return parts;
};

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'System initialized. I have full access to DGMS accident records, safety reports, and mining incident data (2016–2022). How can I assist your safety analysis today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await getChatResponse(input, history);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto px-4">
      {/* Title */}
      <div className="py-4 flex-shrink-0">
        <h1 className="font-headline text-xl font-semibold tracking-tight text-white">Digital Mine Safety Officer</h1>
      </div>

      {/* Scrollable Messages Area */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-4 pr-2 chat-scroll-area">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[75%]`}>
                <div className={`px-5 py-4 rounded-2xl ${msg.role === 'user'
                    ? 'bg-amber-600/90 text-white rounded-br-md'
                    : 'bg-[#1A1A1F] border border-white/[0.06] text-slate-200 rounded-bl-md'
                  }`}>
                  {msg.role === 'ai' ? (
                    <div className="prose-invert">
                      {renderFormattedContent(msg.content)}
                    </div>
                  ) : (
                    <p className="text-[14px] leading-relaxed">{msg.content}</p>
                  )}
                </div>

                <div className={`mt-1 px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <span className="text-[10px] text-slate-600 tracking-wider uppercase">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-[#1A1A1F] border border-white/[0.06] px-5 py-4 rounded-2xl rounded-bl-md flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
              </div>
              <span className="text-xs text-slate-500 tracking-wide">Analyzing...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area — pinned at bottom of container */}
      <div className="flex-shrink-0 py-4">
        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 mb-3 justify-center">
          {[
            'Methane accidents in 2021',
            'Summarize recent incidents',
            'Safety recommendations for underground mines'
          ].map((query) => (
            <button
              key={query}
              onClick={() => setInput(query)}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-400 hover:text-white border border-white/10 hover:border-amber-500/30 transition-all"
            >
              {query}
            </button>
          ))}
        </div>

        {/* Input field */}
        <div className="relative">
          <div className="absolute -inset-1 bg-amber-500/10 rounded-2xl blur-xl opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative flex items-center bg-[#141417] border border-white/10 rounded-xl focus-within:border-amber-500/40 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-white text-sm py-4 px-5 placeholder:text-slate-600"
              placeholder="Ask about mine safety data, incidents, regulations..."
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="m-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white p-3 rounded-lg flex items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
