import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, CheckSquare, FolderKanban, Target, FileText, GitBranch, Loader2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassInput } from '../components/ui/GlassInput.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import api from '../services/api.js';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <SearchIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          <span>Global Search</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Search across tasks, projects, goals, notes, decisions, and indexed knowledge
        </p>
      </div>

      <GlassInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type keywords (e.g. 'audio', 'exam', 'composer', 'mongodb')..."
        icon={<SearchIcon className="w-4 h-4" />}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-violet-600 dark:text-violet-400" />
          <span>Searching NEXUS database...</span>
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Tasks Results */}
          {results.tasks?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                Matching Tasks ({results.tasks.length})
              </h3>
              <div className="space-y-2">
                {results.tasks.map((t: any) => (
                  <GlassCard key={t._id} className="p-3.5 flex items-center justify-between text-xs bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm" interactive>
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{t.title}</span>
                    </div>
                    <GlassBadge variant="neutral">{t.priority}</GlassBadge>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Projects Results */}
          {results.projects?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                Matching Projects ({results.projects.length})
              </h3>
              <div className="space-y-2">
                {results.projects.map((p: any) => (
                  <GlassCard key={p._id} className="p-3.5 flex items-center justify-between text-xs bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm" interactive>
                    <div className="flex items-center gap-2.5">
                      <FolderKanban className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{p.title}</span>
                    </div>
                    <GlassBadge variant="cyan">{p.progress}% Complete</GlassBadge>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Decisions Results */}
          {results.decisions?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
                Matching Decisions ({results.decisions.length})
              </h3>
              <div className="space-y-2">
                {results.decisions.map((d: any) => (
                  <GlassCard key={d._id} className="p-3.5 flex items-center justify-between text-xs bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm" interactive>
                    <div className="flex items-center gap-2.5">
                      <GitBranch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{d.title}</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Chosen: {d.chosenOption}</span>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
