import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Bot,
  User as UserIcon,
  Loader2,
  AlertCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Clock,
  Zap,
} from 'lucide-react';
import { Button3D } from '../components/ui/Button3D.js';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

interface Message {
  _id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string | Date;
}

interface Conversation {
  _id: string;
  title: string;
  updatedAt: string;
}

/**
 * Custom Markdown and Code Block Renderer with Copy Button & Dark Typography
 */
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm leading-relaxed font-sans select-text text-slate-800">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const isLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const language = isLang ? firstLine : '';
          const codeContent = isLang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div
              key={index}
              className="my-3 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-xl"
            >
              {/* Code block header */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-mono text-[11px] font-semibold text-slate-200">
                    {language || 'code'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeContent, index)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all text-[11px] font-medium"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code content */}
              <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed bg-slate-900/95">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        const paragraphs = part.split(/\n\n+/);
        return (
          <div key={index} className="space-y-2">
            {paragraphs.map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="text-base font-bold text-slate-900 mt-3 mb-1">
                    {trimmed.replace(/^###\s+/, '')}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="text-lg font-bold text-slate-900 mt-4 mb-1">
                    {trimmed.replace(/^##\s+/, '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={pIdx} className="text-xl font-bold text-slate-900 mt-5 mb-2">
                    {trimmed.replace(/^#\s+/, '')}
                  </h2>
                );
              }

              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split('\n');
                return (
                  <ul key={pIdx} className="space-y-1.5 pl-4 my-2">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="list-disc text-slate-800 leading-relaxed text-sm">
                        {renderInlineMarkdown(item.replace(/^[-*]\s+/, ''))}
                      </li>
                    ))}
                  </ul>
                );
              }

              if (/^\d+\.\s/.test(trimmed)) {
                const items = trimmed.split('\n');
                return (
                  <ol key={pIdx} className="space-y-1.5 pl-5 list-decimal my-2">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="text-slate-800 leading-relaxed text-sm">
                        {renderInlineMarkdown(item.replace(/^\d+\.\s+/, ''))}
                      </li>
                    ))}
                  </ol>
                );
              }

              return (
                <p key={pIdx} className="text-slate-800 leading-relaxed">
                  {renderInlineMarkdown(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

function renderInlineMarkdown(text: string): React.ReactNode {
  const segments = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return segments.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-950">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-100 text-violet-700 font-mono text-[11px] font-semibold border border-slate-200"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }
    return seg;
  });
}

/**
 * 3D Animated AI Neural Orb Visualizer
 */
const AINeuralOrb: React.FC<{ isThinking?: boolean }> = ({ isThinking = false }) => {
  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center select-none">
      {/* Outer Rotating Energy Ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-dashed border-violet-400/60 animate-spin-neural"
        style={{ animationDuration: isThinking ? '4s' : '16s' }}
      />

      {/* Counter-Rotating Middle Ring */}
      <div
        className="absolute inset-2 rounded-full border border-cyan-400/50 animate-spin-neural"
        style={{ animationDirection: 'reverse', animationDuration: isThinking ? '3s' : '12s' }}
      />

      {/* Core Glowing Orb */}
      <div
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-violet-600 via-pink-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/40 animate-pulse-glow"
      >
        <Sparkles className="w-6 h-6 text-white animate-pulse" />
      </div>

      {/* Orbital Node Sparks */}
      <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
      <div className="absolute bottom-2 left-1 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
      <div className="absolute top-3 left-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
    </div>
  );
};

export const AIChatPage: React.FC = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/ai/conversations');
      const list = res.data.data.conversations || [];
      setConversations(list);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversationMessages = async (id: string) => {
    setActiveConversationId(id);
    setErrorMessage(null);
    try {
      const res = await api.get(`/ai/conversations/${id}`);
      setMessages(res.data.data.conversation.messages || []);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error?.message || 'Failed to load conversation messages.');
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputPrompt('');
    setErrorMessage(null);
    textareaRef.current?.focus();
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConversationId === id) {
        handleNewChat();
      }
    } catch (err: any) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    setErrorMessage(null);
    const userMessage: Message = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: textToSend.trim(),
        conversationId: activeConversationId || undefined,
      });

      const { message: assistantMessage, conversationId, title } = res.data.data;

      setMessages((prev) => [...prev, assistantMessage]);

      if (!activeConversationId && conversationId) {
        setActiveConversationId(conversationId);
        setConversations((prev) => [{ _id: conversationId, title, updatedAt: new Date().toISOString() }, ...prev]);
      } else {
        loadConversations();
      }
    } catch (err: any) {
      const errorText =
        err.response?.data?.error?.message ||
        err.message ||
        'Unable to generate AI response. Please check backend connection.';
      setErrorMessage(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickStarters = [
    { label: 'JavaScript Closures', prompt: 'Explain JavaScript closures with clear practical code examples.' },
    { label: 'Algorithm: String Reversal', prompt: 'Write a Python program to reverse a string with multiple methods.' },
    { label: 'My Incomplete Projects', prompt: 'Which of my projects are currently incomplete in NEXUS?' },
    { label: 'Pending Tasks Due', prompt: 'What tasks do I currently have due this week in NEXUS?' },
  ];

  return (
    <div className="flex h-[calc(100vh-5.5rem)] -m-4 sm:-m-8 overflow-hidden bg-slate-50 text-slate-900">
      {/* ─── SIDEBAR: Conversation History ──────────────────────── */}
      <aside
        className={`shrink-0 border-r border-slate-200 bg-white/95 backdrop-blur-2xl flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64 sm:w-72' : 'w-0 -translate-x-full'
        } overflow-hidden shadow-sm`}
      >
        {/* New Chat Header */}
        <div className="p-4 border-b border-slate-200">
          <Button3D
            onClick={handleNewChat}
            variant="primary"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            icon={<Plus className="w-4 h-4" />}
          >
            New Chat
          </Button3D>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
            Recent Conversations
          </span>

          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 px-4 space-y-2">
              <MessageSquare className="w-6 h-6 mx-auto text-slate-400" />
              <p className="font-medium">No chat history yet. Start a new conversation!</p>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = activeConversationId === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => loadConversationMessages(c._id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-violet-50 text-violet-800 border border-violet-200 font-bold shadow-sm'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                    <span className="truncate">{c.title || 'Conversation'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(e, c._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-200 transition-all cursor-pointer"
                    title="Delete Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ─── MAIN CHAT AREA ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Top Chat Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title={sidebarOpen ? 'Hide History' : 'Show History'}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/20">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h1 className="text-sm font-extrabold font-display text-slate-900 flex items-center gap-2">
                  <span>NEXUS AI</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-violet-100 text-violet-800 font-bold border border-violet-200">
                    Gemini Intelligence
                  </span>
                </h1>
              </div>
            </div>
          </div>

          <Button3D onClick={handleNewChat} size="sm" variant="secondary" icon={<Plus className="w-3.5 h-3.5" />}>
            New Chat
          </Button3D>
        </div>

        {/* Chat Messages Flow */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {messages.length === 0 ? (
            /* Empty State Hero with 3D Neural Orb */
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 py-10">
              <div className="space-y-4 flex flex-col items-center">
                <AINeuralOrb />

                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
                  How can NEXUS assist you today?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed font-normal">
                  Ask general technical, mathematical, coding, or writing questions—or query your projects, tasks, and deadlines directly.
                </p>
              </div>

              {/* Quick Starter Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
                {quickStarters.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-violet-400 text-left transition-all group space-y-1 shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <span className="text-xs font-bold text-violet-700 block group-hover:text-violet-900 transition-colors">
                      {item.label}
                    </span>
                    <p className="text-xs text-slate-600 leading-snug line-clamp-2">{item.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Render Message History */
            <div className="max-w-4xl mx-auto space-y-6 pb-4">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 sm:gap-4 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-2xl shrink-0 flex items-center justify-center font-bold text-xs shadow-md ${
                        isUser
                          ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                          : 'bg-white border border-slate-200 text-violet-700'
                      }`}
                    >
                      {isUser ? user?.name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" /> : <Bot className="w-5 h-5 text-violet-600" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-5 shadow-sm ${
                        isUser
                          ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-violet-500/15'
                          : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none shadow-[0_4px_16px_rgba(0,0,0,0.03)]'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans font-medium">{msg.content}</p>
                      ) : (
                        <FormattedMessage content={msg.content} />
                      )}

                      {/* Timestamp */}
                      <div
                        className={`flex items-center gap-1 mt-2.5 text-[10px] ${
                          isUser ? 'text-white/80 justify-end' : 'text-slate-400 justify-start'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Thinking / Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-violet-600 shadow-sm">
                    <Sparkles className="w-4 h-4 animate-spin text-violet-600" />
                  </div>
                  <div className="rounded-3xl rounded-tl-none p-4 bg-white border border-slate-200 text-slate-700 flex items-center gap-3 shadow-sm">
                    <div className="flex space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-600 animate-bounce" />
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">NEXUS is generating answer...</span>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3 shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div className="space-y-1">
                    <strong className="block font-bold">Generation Error:</strong>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ─── CHAT INPUT SECTION ────────────────────────────────── */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl bg-white border-2 border-slate-200 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/15 shadow-lg transition-all">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NEXUS anything (e.g. 'What is recursion?', 'Write Python code', 'What tasks are due?')..."
                rows={2}
                className="w-full p-4 pr-16 bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none resize-none font-medium"
              />

              {/* 3D Send Button */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button3D
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || isLoading}
                  variant="primary"
                  size="sm"
                  className="px-3.5 py-2"
                  icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500 px-2 font-medium">
              <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>NEXUS Proactive Context Active</span>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
