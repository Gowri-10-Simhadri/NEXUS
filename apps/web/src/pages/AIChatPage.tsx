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
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
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
 * Custom Markdown and Code Block Renderer with Copy Button
 */
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks: ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm leading-relaxed font-sans select-text">
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
              className="my-3 rounded-2xl overflow-hidden border border-white/10 bg-nexus-950/90 shadow-2xl"
            >
              {/* Code block header */}
              <div className="flex items-center justify-between px-4 py-2 bg-nexus-900/90 border-b border-white/10 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-accent-cyan" />
                  <span className="font-mono text-[11px] font-semibold text-slate-300">
                    {language || 'code'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(codeContent, index)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all text-[11px]"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3 text-accent-emerald" />
                      <span className="text-accent-emerald font-medium">Copied!</span>
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
              <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed bg-black/40">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Render standard Markdown paragraphs, headings, bullet lists
        const paragraphs = part.split(/\n\n+/);
        return (
          <div key={index} className="space-y-2">
            {paragraphs.map((para, pIdx) => {
              const trimmed = para.trim();
              if (!trimmed) return null;

              // Heading 1 / 2 / 3
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="text-base font-bold text-slate-100 mt-3 mb-1">
                    {trimmed.replace(/^###\s+/, '')}
                  </h4>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="text-lg font-bold text-slate-100 mt-4 mb-1">
                    {trimmed.replace(/^##\s+/, '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={pIdx} className="text-xl font-bold text-slate-100 mt-5 mb-2">
                    {trimmed.replace(/^#\s+/, '')}
                  </h2>
                );
              }

              // Bullet lists
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const items = trimmed.split('\n');
                return (
                  <ul key={pIdx} className="space-y-1.5 pl-4 my-2">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="list-disc text-slate-200 leading-relaxed text-sm">
                        {renderInlineMarkdown(item.replace(/^[-*]\s+/, ''))}
                      </li>
                    ))}
                  </ul>
                );
              }

              // Numbered lists
              if (/^\d+\.\s/.test(trimmed)) {
                const items = trimmed.split('\n');
                return (
                  <ol key={pIdx} className="space-y-1.5 pl-5 list-decimal my-2">
                    {items.map((item, iIdx) => (
                      <li key={iIdx} className="text-slate-200 leading-relaxed text-sm">
                        {renderInlineMarkdown(item.replace(/^\d+\.\s+/, ''))}
                      </li>
                    ))}
                  </ol>
                );
              }

              return (
                <p key={pIdx} className="text-slate-200 leading-relaxed">
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

/**
 * Parses bold, code chips, and links inside text lines
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Replace inline bold **text** and inline code `code`
  const segments = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return segments.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-slate-100">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 text-accent-cyan font-mono text-[11px]"
        >
          {seg.slice(1, -1)}
        </code>
      );
    }
    return seg;
  });
}

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

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load conversation history on mount
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

  // Load active conversation messages
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

  // Start a new chat
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInputPrompt('');
    setErrorMessage(null);
    textareaRef.current?.focus();
  };

  // Delete a conversation
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

  // Send message to Gemini through Express backend
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    setErrorMessage(null);
    const userMessage: Message = {
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    // Optimistically update UI
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
        // Refresh conversations list
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
    <div className="flex h-[calc(100vh-5.5rem)] -m-4 sm:-m-8 overflow-hidden bg-nexus-950 text-slate-100">
      {/* ─── SIDEBAR: Conversation History ──────────────────────── */}
      <aside
        className={`shrink-0 border-r border-white/[0.08] bg-nexus-900/60 backdrop-blur-2xl flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-64 sm:w-72' : 'w-0 -translate-x-full'
        } overflow-hidden`}
      >
        {/* New Chat Header */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
          <GlassButton
            onClick={handleNewChat}
            variant="primary"
            size="sm"
            className="w-full flex items-center justify-center gap-2 shadow-lg shadow-accent-violet/30"
            icon={<Plus className="w-4 h-4" />}
          >
            New Chat
          </GlassButton>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Recent Conversations
          </span>

          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 px-4 space-y-2">
              <MessageSquare className="w-6 h-6 mx-auto text-slate-400" />
              <p>No chat history yet. Start a new conversation!</p>
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
                      ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30 font-semibold shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-accent-violet' : 'text-slate-400'}`} />
                    <span className="truncate">{c.title || 'Conversation'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteConversation(e, c._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-accent-rose hover:bg-white/10 transition-all"
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
      <main className="flex-1 flex flex-col min-w-0 bg-nexus-950/80 relative">
        {/* Top Chat Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-nexus-900/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title={sidebarOpen ? 'Hide History' : 'Show History'}
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-gradient-to-tr from-accent-violet to-accent-cyan text-white shadow-md shadow-accent-violet/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h1 className="text-sm font-bold font-display text-slate-100 flex items-center gap-1.5">
                  <span>NEXUS AI</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-accent-violet/20 text-accent-violet font-semibold border border-accent-violet/30">
                    Gemini Live
                  </span>
                </h1>
              </div>
            </div>
          </div>

          <GlassButton onClick={handleNewChat} size="sm" variant="ghost" icon={<Plus className="w-3.5 h-3.5" />}>
            New
          </GlassButton>
        </div>

        {/* Chat Messages Flow */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {messages.length === 0 ? (
            /* Empty State Hero */
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 py-12 animate-fadeIn">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-accent-violet via-accent-purple to-accent-cyan flex items-center justify-center mx-auto shadow-2xl shadow-accent-violet/50">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-100">
                  How can NEXUS assist you today?
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                  Ask general technical, mathematical, coding, or writing questions—or inquire about your projects, tasks, and deadlines.
                </p>
              </div>

              {/* Quick Starter Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {quickStarters.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-4 rounded-2xl bg-nexus-900/60 hover:bg-nexus-900 border border-white/10 hover:border-accent-violet/40 text-left transition-all group space-y-1 shadow-md hover:shadow-accent-violet/10"
                  >
                    <span className="text-xs font-bold text-accent-cyan block group-hover:text-accent-violet transition-colors">
                      {item.label}
                    </span>
                    <p className="text-xs text-slate-300 leading-snug line-clamp-2">{item.prompt}</p>
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
                    } animate-fadeIn`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-md ${
                        isUser
                          ? 'bg-gradient-to-tr from-accent-violet to-accent-cyan text-white'
                          : 'bg-nexus-900 border border-white/10 text-accent-cyan'
                      }`}
                    >
                      {isUser ? user?.name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4 text-accent-violet" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-xl ${
                        isUser
                          ? 'bg-gradient-to-r from-accent-violet to-accent-purple text-white rounded-tr-none'
                          : 'bg-nexus-900/90 border border-white/10 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{msg.content}</p>
                      ) : (
                        <FormattedMessage content={msg.content} />
                      )}

                      {/* Timestamp */}
                      <div
                        className={`flex items-center gap-1 mt-2 text-[10px] ${
                          isUser ? 'text-white/70 justify-end' : 'text-slate-400 justify-start'
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
                <div className="flex items-start gap-3 animate-fadeIn">
                  <div className="w-8 h-8 rounded-xl bg-nexus-900 border border-white/10 flex items-center justify-center text-accent-violet shadow-md">
                    <Sparkles className="w-4 h-4 animate-spin text-accent-violet" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none p-4 bg-nexus-900/90 border border-white/10 text-slate-300 flex items-center gap-3">
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 rounded-full bg-accent-violet animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-accent-cyan animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-accent-emerald animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs font-medium text-slate-400">NEXUS is thinking...</span>
                  </div>
                </div>
              )}

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-accent-rose/15 border border-accent-rose/30 text-accent-rose text-xs flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
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
        <div className="p-4 sm:p-6 border-t border-white/[0.08] bg-nexus-950/90 backdrop-blur-xl">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-2xl bg-nexus-900/90 border border-white/15 focus-within:border-accent-violet/60 focus-within:ring-2 focus-within:ring-accent-violet/20 shadow-2xl transition-all">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask NEXUS anything (e.g. 'What is recursion?', 'Write Python code', 'What tasks are due?')..."
                rows={2}
                className="w-full p-4 pr-16 bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none resize-none"
              />

              {/* Send Button */}
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputPrompt.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-gradient-to-tr from-accent-violet to-accent-cyan text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg shadow-accent-violet/30 cursor-pointer"
                  title="Send message (Enter)"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-2">
              <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
              <span>Selective Workspace Context: <strong>Active</strong></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
