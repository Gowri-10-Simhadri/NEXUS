import React, { useState, useEffect } from 'react';
import { Search, Sparkles, CheckSquare, FolderKanban, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        isOpen ? onClose() : {};
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.data);
      } catch {
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-nexus-950/80 backdrop-blur-md" onClick={onClose} />

      {/* Palette Card */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-nexus-900/95 light:bg-white/95 backdrop-blur-2xl border border-white/15 light:border-black/15 shadow-2xl overflow-hidden z-10 animate-scaleUp">
        {/* Input area */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 light:border-black/10">
          <Search className="w-5 h-5 text-accent-violet" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a search query, task, or natural language question..."
            className="w-full bg-transparent text-slate-100 light:text-slate-900 placeholder-slate-500 text-sm focus:outline-none"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : (
            <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white/10 rounded-md text-slate-400">
              ESC
            </kbd>
          )}
        </div>

        {/* Results / Navigation Suggestions */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-3">
          {query.trim() && results && (
            <div>
              {/* Task matches */}
              {results.tasks?.length > 0 && (
                <div className="mb-3">
                  <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tasks
                  </span>
                  {results.tasks.map((t: any) => (
                    <div
                      key={t._id}
                      onClick={() => {
                        navigate('/tasks');
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckSquare className="w-4 h-4 text-accent-cyan" />
                        <span className="font-medium">{t.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Project matches */}
              {results.projects?.length > 0 && (
                <div className="mb-3">
                  <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Projects
                  </span>
                  {results.projects.map((p: any) => (
                    <div
                      key={p._id}
                      onClick={() => {
                        navigate(`/projects/${p._id}`);
                        onClose();
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors text-xs text-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderKanban className="w-4 h-4 text-accent-violet" />
                        <span className="font-medium">{p.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{p.progress}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick AI Action Suggestion */}
          <div
            onClick={() => {
              navigate('/ai');
              onClose();
            }}
            className="flex items-center justify-between p-3 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 hover:bg-accent-violet/20 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3 text-xs text-slate-200">
              <Sparkles className="w-4 h-4 text-accent-violet" />
              <span>
                Ask NEXUS AI:{' '}
                <strong className="text-accent-violet">{query || 'What should I prioritize today?'}</strong>
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-accent-violet" />
          </div>
        </div>
      </div>
    </div>
  );
};
