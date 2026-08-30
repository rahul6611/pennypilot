import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { CopilotMessage } from '../../../types/ai';
import { Expense } from '../../../types/expense';
import { Participant } from '../../../types/user';
import { AIProviderFactory } from '../providers/AIProviderFactory';
import { Sparkles, Send, Bot, User, AlertCircle } from 'lucide-react';

export interface CopilotChatProps {
  expenses: Expense[];
  userBudget: number;
  currentUser: Participant;
  currency: string;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({
  expenses,
  userBudget,
  currentUser
}) => {
  const isAiConfigured = AIProviderFactory.isAIEnabled();

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello ${currentUser.name}! I am your PennyPilot Money Copilot. Ask me anything about your spending trends, budget projections, or who owes you money!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'Why did I spend more this month?',
    'How much did I spend on food this month?',
    'Predict my month-end spending',
    'Who owes me the most?'
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    try {
      const provider = AIProviderFactory.getProvider();
      const assistantMsg = await provider.answerCopilotQuery(text, expenses, userBudget, currentUser);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'AI insights unavailable at the moment. Please verify your environment configuration.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card variant="glass" className="space-y-4 flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-md">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">AI Money Copilot</h3>
            <p className="text-[11px] text-slate-400">Contextual financial intelligence on your data</p>
          </div>
        </div>

        {!isAiConfigured && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
            <AlertCircle className="w-3 h-3" /> AI Local Engine Active
          </span>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 text-xs whitespace-nowrap hover:border-brand-500/40 hover:text-white transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.text}
              <span className="block text-[10px] opacity-60 text-right mt-1">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-brand-400" />
            <span>Analyzing your expenses...</span>
          </div>
        )}
      </div>

      {/* Query Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask Copilot about your expenses..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
        />
        <Button type="submit" variant="gradient" size="sm" className="px-3">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </Card>
  );
};
