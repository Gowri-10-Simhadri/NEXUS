import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Trash2, CheckCircle2, ChevronRight, Info, Search, Calendar } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { GlassModal } from '../components/ui/GlassModal.js';
import { GlassInput, GlassTextArea } from '../components/ui/GlassInput.js';
import api from '../services/api.js';
import { DecisionItem } from '../types/index.js';

export const DecisionsPage: React.FC = () => {
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [chosenOption, setChosenOption] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [outcome, setOutcome] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDecisions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/knowledge/decisions');
      setDecisions(res.data.data.decisions);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, []);

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/knowledge/decisions', {
        title,
        context,
        chosenOption,
        reasoning,
        outcome,
      });
      setIsModalOpen(false);
      setTitle('');
      setContext('');
      setChosenOption('');
      setReasoning('');
      setOutcome('');
      loadDecisions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDecision = async (id: string) => {
    try {
      await api.delete(`/knowledge/decisions/${id}`);
      loadDecisions();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDecisions = decisions.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.chosenOption.toLowerCase().includes(q) ||
      d.context.toLowerCase().includes(q) ||
      d.reasoning.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            <span>Strategic Decision Memory</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Log architectural, technical, and lifestyle decisions with rationale so the AI can explain "why did we choose this?" in the future
          </p>
        </div>

        <GlassButton onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Record a Decision
        </GlassButton>
      </div>

      {/* Explanatory Banner */}
      <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/40 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900 dark:text-slate-100">
            Why record decisions in NEXUS?
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Projects often suffer from "decision amnesia" where developers or creators forget why a particular library, database, or architecture was selected months later. NEXUS stores your chosen option and trade-offs, enabling the AI to recall exact decision contexts whenever you ask.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-nexus-900/60 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-300 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search past decisions, options chosen, or reasoning..."
          className="bg-transparent flex-1 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            Clear ({filteredDecisions.length} results)
          </button>
        )}
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {filteredDecisions.length === 0 ? (
          <GlassCard className="p-12 text-center text-xs text-slate-500 space-y-3">
            <GitBranch className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No decisions logged yet</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {searchQuery
                  ? 'No decisions matched your search query.'
                  : 'Record important project decisions (e.g. "Use MongoDB Atlas for flexible JSON document storage") to establish historical context.'}
              </p>
            </div>
            <GlassButton
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Record First Decision
            </GlassButton>
          </GlassCard>
        ) : (
          filteredDecisions.map((dec) => (
            <GlassCard key={dec._id} className="p-6 space-y-4 bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm" glow="violet">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                      Recorded Decision
                    </span>
                    <span className="text-[11px] text-slate-500">
                      • {new Date(dec.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">{dec.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <GlassBadge variant="emerald">Chosen: {dec.chosenOption}</GlassBadge>
                  <button
                    onClick={() => handleDeleteDecision(dec._id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Decision"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-slate-100">Context / Problem:</strong> {dec.context}
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-nexus-900/60 border border-slate-200 dark:border-white/10 space-y-1 text-xs">
                <span className="font-semibold text-violet-600 dark:text-violet-400 block text-[11px] uppercase tracking-wider">
                  Reasoning & Trade-offs:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{dec.reasoning}</p>
              </div>

              {dec.outcome && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">Outcome / Status:</strong> {dec.outcome}
                </p>
              )}
            </GlassCard>
          ))
        )}
      </div>

      {/* Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Architectural or Product Decision"
      >
        <form onSubmit={handleCreateDecision} className="space-y-4">
          <GlassInput
            label="Decision Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Database Selection for AI Research Dashboard"
            required
            autoFocus
          />

          <GlassTextArea
            label="Context & Problem Statement"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="What challenge required a strategic choice? (e.g. Needed flexible JSON document models for hierarchical task trees)"
            rows={2}
            required
          />

          <GlassInput
            label="Selected Option"
            value={chosenOption}
            onChange={(e) => setChosenOption(e.target.value)}
            placeholder="e.g. MongoDB Atlas"
            required
          />

          <GlassTextArea
            label="Reasoning & Trade-offs Considered"
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Why was this option chosen over alternatives? (e.g. Rich JSON queries, cloud-native scalability, zero schema migration downtime)"
            rows={3}
            required
          />

          <GlassInput
            label="Expected or Observed Outcome (Optional)"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="e.g. Implemented in production sprint 1 without schema blockers"
          />

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">Save Decision</GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
