import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import AppLogo from './AppLogo';
import { Send, Bot, Sparkles, AlertTriangle, CornerDownLeft, MessageSquare, Trash2 } from 'lucide-react';
import { Task, ChatMessage } from '../types';

interface AIChatPanelProps {
  tasks: Task[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function AIChatPanel({ tasks, messages, setMessages }: AIChatPanelProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Default open on desktop
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presets = [
    { label: "⚡ What should I skip?", text: "What tasks should I skip or postpone right now to stay on track?" },
    { label: "🚨 Assess deadline risk", text: "Are my deadlines at risk? Give me a quick assessment." },
    { label: "📅 Prioritize remaining hours", text: "Help me prioritize my remaining work hours for today." }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          tasks
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "### ❌ Communication Timeout\nMy core scheduler experienced a slight connection delay. Heuristics recommend focusing strictly on your highest priority task (**Assignment**) in the meantime!\n\n*Please ensure your environment configuration is complete.*",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `### Welcome back, Planner! 🤖
I'm your **Digital Twin**. I've loaded your schedule and local parameters. 

Ask me any questions about priority optimization, what items are safe to postpone, or click one of the quick actions below to analyze your deadlines.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div 
      id="ai-chat-panel-container"
      className="h-screen relative z-20 flex shrink-0"
    >
      {/* Tab toggle for desktop sidebar */}
      <button
        id="ai-chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-12 top-20 w-12 h-12 rounded-l-xl bg-[#171F34] border border-r-0 border-white/5 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all shadow-lg hidden lg:flex"
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Main sliding panel with overflow-hidden */}
      <div className={`h-full flex flex-col bg-[#0B1020] transition-all duration-300 overflow-hidden ${
        isOpen ? 'w-full lg:w-96 xl:w-[400px] border-l border-white/5' : 'w-0'
      }`}>
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <AppLogo className="w-8 h-8 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-slate-100 font-sans flex items-center gap-1.5">
                  AI Priority Guide
                  <span className="flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
                <p className="text-[10px] text-slate-400 font-sans">Digital Twin Core v3.5</p>
              </div>
            </div>
            
            <button
              id="clear-chat-history"
              onClick={handleClearHistory}
              title="Clear History"
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
          >
            <div className={`p-3.5 rounded-2xl text-xs font-sans shadow-md border ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white border-blue-500/20 rounded-tr-none'
                : 'bg-[#171F34] text-slate-200 border-white/5 rounded-tl-none'
            }`}>
              {msg.sender === 'user' ? (
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="markdown-body">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => <h1 className="text-sm font-bold text-slate-100 mt-2 mb-1 border-b border-white/5 pb-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xs font-bold text-slate-100 mt-2.5 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xs font-semibold text-blue-400 mt-2 mb-1">{children}</h3>,
                      p: ({ children }) => <p className="leading-relaxed mb-2 text-slate-300">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2.5 pl-0.5 text-slate-300">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2.5 pl-0.5 text-slate-300">{children}</ol>,
                      li: ({ children }) => <li className="marker:text-blue-400 inline-block w-full">{children}</li>,
                      code: ({ children }) => <code className="bg-slate-900/60 text-pink-400 px-1 py-0.5 rounded font-mono text-[10px] border border-white/5">{children}</code>,
                      strong: ({ children }) => <strong className="font-semibold text-blue-400">{children}</strong>,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-purple-500 bg-purple-500/5 px-2 py-1 my-1 rounded text-slate-400 italic">{children}</blockquote>
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 mr-auto max-w-[80%] bg-[#171F34] border border-white/5 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-400 italic">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
            <span>AI Advisor compiling priorities...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Presets and Input */}
      <div className="p-3 border-t border-white/5 space-y-3 shrink-0 bg-[#0B1020]/95 backdrop-blur-md pb-6 md:pb-3">
        {/* Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 font-sans tracking-widest uppercase px-1 font-mono">Quick Suggestions</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(preset.text)}
                disabled={isLoading}
                className="text-[10px] font-sans text-slate-300 bg-[#171F34]/80 hover:bg-[#1d263d] border border-white/5 hover:border-white/10 rounded-lg px-2 py-1 text-left transition-all shrink-0 max-w-full truncate cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
          className="relative bg-[#171F34] border border-white/5 hover:border-white/10 rounded-xl focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/10 transition-all p-1.5 flex items-center gap-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask AI Advisor about tasks..."
            className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-xs text-slate-100 placeholder-slate-500 font-sans px-2.5 h-8"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
      </div>
      </div>
    </div>
  );
}
