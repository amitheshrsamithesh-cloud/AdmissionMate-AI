import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  HelpCircle, 
  Hourglass, 
  ArrowRight,
  Bot,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { Message } from '../types';

interface AiAssistantViewProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

const EXTENDED_SUGGESTED_QUERIES = [
  'What documents are missing for Stanford?',
  'How do I pay college application fees with PayPal?',
  'What is my Admission Readiness Score and how do I improve it?',
  'Which target colleges match my GPA of 3.92 and SAT 1540?',
  'Explain Stanford University application fee & deadlines',
  'Have I paid any college application fees yet?',
];

export default function AiAssistantView({
  messages,
  onSendMessage,
  isSending
}: AiAssistantViewProps) {
  
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    
    onSendMessage(inputText);
    setInputText('');
  };

  const handleSuggestedClick = (question: string) => {
    if (isSending) return;
    onSendMessage(question);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      
      {/* Recommended Questions Sidebar Panel */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hidden lg:flex">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <HelpCircle className="h-5 w-5 text-[#006A6A] dark:text-teal-400" />
            <h3 className="font-display font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">
              Suggested Admissions Queries
            </h3>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Click any query below to evaluate admission criteria, check missing transcripts, or inspect PayPal application fee status.
          </p>
          
          <div className="space-y-2">
            {EXTENDED_SUGGESTED_QUERIES.map((question, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedClick(question)}
                disabled={isSending}
                className="w-full text-left p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-[#006A6A]/40 dark:hover:border-teal-500/40 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50/20 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between group disabled:opacity-50"
                id={`btn-suggested-query-${i}`}
              >
                <span className="group-hover:text-[#006A6A] dark:group-hover:text-teal-400 truncate mr-2">
                  {question}
                </span>
                <ArrowRight className="h-3 w-3 text-slate-300 dark:text-slate-600 group-hover:text-[#006A6A] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-teal-100 dark:border-[#006A6A]/30 bg-teal-50/40 dark:bg-[#006A6A]/10 flex gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <Sparkles className="h-4.5 w-4.5 text-[#006A6A] dark:text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Live Context Agent:</strong> Powered by Gemini 3.8 Flash. Analyzes your actual uploaded files, readiness score, and PayPal payments.
          </p>
        </div>
      </div>

      {/* Primary Chat Interface */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden h-full">
        
        {/* Chat Header */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#006A6A] text-white flex items-center justify-center font-bold shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-none font-display">
                AdmissionMate AI Counselor
              </h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected to Student Profile & PayPal Ledger
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-teal-100 dark:bg-[#006A6A]/40 text-[#006A6A] dark:text-teal-300 px-2.5 py-1 rounded-full font-bold font-mono uppercase">
              Gemini 3.8 Flash
            </span>
          </div>
        </div>

        {/* Messages scrollpane */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30 dark:bg-slate-950/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border ${
                  isUser 
                    ? 'bg-teal-50 dark:bg-slate-800 border-teal-100 dark:border-slate-700 text-[#006A6A] dark:text-teal-400' 
                    : 'bg-teal-50 dark:bg-[#006A6A]/20 border-teal-100 dark:border-[#006A6A]/40 text-[#006A6A] dark:text-teal-400'
                }`}>
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble Container */}
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-[#006A6A] text-white rounded-tr-none shadow-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-150 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <p className={`text-[9px] mt-1.5 font-mono text-right ${isUser ? 'text-teal-200' : 'text-slate-400 dark:text-slate-500'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="h-8 w-8 rounded-full bg-teal-50 dark:bg-slate-800 border border-teal-100 dark:border-slate-700 text-[#006A6A] dark:text-teal-400 shrink-0 flex items-center justify-center">
                <Bot className="h-4 w-4 animate-bounce" />
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                  AdmissionMate AI is analyzing your profile...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick mobile recommendations */}
        <div className="lg:hidden p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2 overflow-x-auto">
          {EXTENDED_SUGGESTED_QUERIES.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestedClick(q)}
              className="text-[10px] font-bold text-[#006A6A] dark:text-teal-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shrink-0"
              id={`btn-mobile-suggested-${idx}`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder="Ask about required documents, readiness score, or PayPal application fees..."
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#006A6A] focus:bg-white dark:focus:bg-slate-900 transition-colors"
            id="chat-input"
          />
          <button 
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="p-2.5 bg-[#006A6A] hover:bg-[#005151] text-white rounded-xl disabled:opacity-50 transition-colors shadow-sm"
            id="btn-chat-send"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>

      </div>

    </div>
  );
}
