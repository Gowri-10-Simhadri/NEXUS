import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Clock, RefreshCw, ArrowRight, CheckCircle2, Calendar, CheckSquare, Layers, Brain } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { GlassModal } from '../components/ui/GlassModal.js';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { InsightResult } from '../types/index.js';

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<InsightResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReevaluating, setIsReevaluating] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [schedulePlan, setSchedulePlan] = useState<any>(null);
  const navigate = useNavigate();

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/insights');
      setInsights(res.data.data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleReevaluateSchedule = async () => {
    setIsReevaluating(true);
    try {
      await loadInsights();
    } catch (err) {
      console.error(err);
    } finally {
      setIsReevaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            <span>Proactive Intelligence & Risk Radar</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Real-time automated detection of workload overload, deadline overlaps, and project stagnation based on your database records
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="sm"
          onClick={handleReevaluateSchedule}
          isLoading={isReevaluating}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh Workload & Risks
        </GlassButton>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <GlassCard className="p-12 text-center text-xs text-slate-500 space-y-3">
            <Sparkles className="w-10 h-10 text-emerald-500 mx-auto animate-pulse" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">All Workloads Optimal!</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                No critical workload conflicts, impending deadline crunches, or inactive projects detected.
              </p>
            </div>
            <GlassButton
              size="sm"
              variant="secondary"
              onClick={handleReevaluateSchedule}
              icon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Run On-Demand Evaluation
            </GlassButton>
          </GlassCard>
        ) : (
          insights.map((item) => (
            <GlassCard
              key={item.id}
              className="p-6 space-y-4 bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm"
              glow={item.priority === 'critical' ? 'rose' : item.priority === 'high' ? 'amber' : 'violet'}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`p-1.5 rounded-lg ${
                        item.priority === 'critical'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {item.description}
                  </p>
                </div>

                <GlassBadge
                  variant={
                    item.priority === 'critical'
                      ? 'rose'
                      : item.priority === 'high'
                      ? 'amber'
                      : 'violet'
                  }
                >
                  {item.priority} Priority
                </GlassBadge>
              </div>

              {/* Detected factors */}
              {item.reasons && item.reasons.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                  <span className="font-semibold text-cyan-700 dark:text-cyan-400 block text-[11px] uppercase tracking-wider">
                    Contextual Factors & Why This Was Detected:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {item.reasons.map((r, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/5 space-y-0.5 shadow-xs">
                        <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{r.label}</span>
                        <strong className="text-slate-900 dark:text-slate-200 text-xs">{r.detail}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action recommendation */}
              <div className="p-3.5 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-violet-700 dark:text-violet-400 block text-[11px] uppercase">
                    Suggested Action Plan:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{item.suggestedAction}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.entityType === 'project' && item.entityId && (
                    <GlassButton
                      onClick={() => navigate(`/projects/${item.entityId}`)}
                      size="sm"
                      variant="secondary"
                    >
                      View Project
                    </GlassButton>
                  )}
                  {item.entityType === 'task' && (
                    <GlassButton
                      onClick={() => navigate('/tasks')}
                      size="sm"
                      variant="secondary"
                    >
                      View Tasks
                    </GlassButton>
                  )}
                  <GlassButton
                    onClick={() => navigate('/ai')}
                    size="sm"
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Ask NEXUS
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Schedule Re-evaluation Plan Modal */}
      <GlassModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title="AI Schedule Re-Evaluation & Optimization"
        maxWidth="2xl"
      >
        {schedulePlan ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/40 space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider block">
                Workload Strategy Summary
              </span>
              <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed">{schedulePlan.summary}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Actionable Steps to Resolve Conflicts:</span>
              </h4>
              <ul className="space-y-1.5 pl-2">
                {schedulePlan.actionableSteps?.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 p-2 rounded-xl bg-white dark:bg-nexus-900/60 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-300 shadow-xs">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-nexus-900/80 border border-slate-200 dark:border-white/10 space-y-1">
              <span className="font-bold text-amber-700 dark:text-amber-400 block text-[11px] uppercase tracking-wider">
                Time-Blocking & Schedule Advice:
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{schedulePlan.timeManagementAdvice}</p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <GlassButton variant="ghost" onClick={() => setPlanModalOpen(false)}>
                Dismiss
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={() => {
                  setPlanModalOpen(false);
                  navigate('/calendar');
                }}
                icon={<Calendar className="w-4 h-4" />}
              >
                Go to Calendar
              </GlassButton>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400">Loading schedule plan...</div>
        )}
      </GlassModal>
    </div>
  );
};
