import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckSquare,
  Clock,
  AlertTriangle,
  FolderKanban,
  Target,
  Plus,
  ArrowRight,
  TrendingUp,
  Brain,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { GlassSkeletonCard } from '../components/ui/GlassSkeleton.js';
import api from '../services/api.js';
import { Task, Project, Goal, InsightResult } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [briefing, setBriefing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      const [dashRes, briefRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/dashboard/briefing'),
      ]);
      setData(dashRes.data.data);
      setBriefing(briefRes.data.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.patch(`/tasks/${taskId}/complete`);
      loadDashboard();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <GlassSkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  const { stats, todayTasks, activeProjects, activeGoals, insights } = data || {};

  return (
    <div className="space-y-8">
      {/* 1. Daily AI Briefing Banner */}
      {briefing && (
        <GlassCard className="p-6 border-accent-violet/30 shadow-2xl relative overflow-hidden" glow="violet">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-accent-violet/20 text-accent-violet">
                  <Brain className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-accent-cyan tracking-wider uppercase">
                  Daily Intelligence Briefing • {briefing.date}
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-slate-100">
                {briefing.criticalAlerts?.length > 0 ? (
                  <span className="text-accent-rose flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Workload Attention Needed
                  </span>
                ) : (
                  'Workload on Track & Optimized'
                )}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {briefing.focusRecommendation}
              </p>
            </div>

            <div className="shrink-0 flex gap-2">
              <GlassButton
                onClick={() => navigate('/ai')}
                size="sm"
                icon={<Sparkles className="w-4 h-4" />}
              >
                Open AI Chat
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Tasks</span>
            <CheckSquare className="w-4 h-4 text-accent-cyan" />
          </div>
          <p className="text-2xl font-bold font-display text-slate-100">{todayTasks?.length || 0}</p>
          <span className="text-[11px] text-slate-400">{stats?.completedTasks || 0} completed overall</span>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Projects</span>
            <FolderKanban className="w-4 h-4 text-accent-violet" />
          </div>
          <p className="text-2xl font-bold font-display text-slate-100">{stats?.activeProjectsCount || 0}</p>
          <span className="text-[11px] text-accent-cyan font-medium">In active development</span>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Goal Progress</span>
            <Target className="w-4 h-4 text-accent-emerald" />
          </div>
          <p className="text-2xl font-bold font-display text-slate-100">{stats?.taskCompletionRate || 0}%</p>
          <span className="text-[11px] text-slate-400">Milestone completion rate</span>
        </GlassCard>

        <GlassCard className="p-4 sm:p-5 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Risks</span>
            <AlertTriangle className="w-4 h-4 text-accent-rose" />
          </div>
          <p className="text-2xl font-bold font-display text-accent-rose">{insights?.length || 0}</p>
          <span className="text-[11px] text-slate-400">Proactively detected</span>
        </GlassCard>
      </div>

      {/* 3. Proactive Insights Section (Flagship Scenario highlights) */}
      {insights && insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-violet" />
              <span>Proactive Intelligence Alerts</span>
            </h3>
            <button
              onClick={() => navigate('/insights')}
              className="text-xs text-accent-violet hover:underline flex items-center gap-1 font-medium"
            >
              View All Insights <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 2).map((item: InsightResult) => (
              <GlassCard
                key={item.id}
                className="p-5 border-accent-violet/30 space-y-3 hover:border-accent-violet transition-all"
                glow="violet"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-accent-rose/20 text-accent-rose">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                  </div>
                  <GlassBadge variant={item.priority === 'critical' ? 'rose' : 'amber'}>
                    {item.priority}
                  </GlassBadge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>

                <div className="p-3 rounded-xl bg-black/40 text-[11px] space-y-1 text-slate-300">
                  <span className="font-semibold text-accent-cyan block">Recommendation:</span>
                  <p>{item.suggestedAction}</p>
                </div>

                <div className="flex justify-end pt-1">
                  <GlassButton
                    onClick={() => navigate('/ai')}
                    size="sm"
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Ask NEXUS AI
                  </GlassButton>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* 4. Two-Column Layout: Priority Tasks & Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-accent-cyan" />
              <span>Priority Tasks</span>
            </h3>
            <GlassButton
              onClick={() => navigate('/tasks')}
              variant="secondary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Task
            </GlassButton>
          </div>

          <GlassCard className="p-4 divide-y divide-white/[0.06]">
            {todayTasks?.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No pending tasks for today. You're completely caught up!
              </div>
            ) : (
              todayTasks?.map((task: Task) => (
                <div key={task._id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(task._id)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        task.status === 'completed'
                          ? 'bg-accent-emerald border-accent-emerald text-white'
                          : 'border-white/20 hover:border-accent-violet'
                      }`}
                    >
                      {task.status === 'completed' && <CheckSquare className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <h5 className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {task.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        {task.projectId && (
                          <span className="text-accent-cyan font-medium">{task.projectId.title}</span>
                        )}
                        {task.deadline && (
                          <span>• Due {new Date(task.deadline).toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                        )}
                        <span>• ~{task.estimatedDuration}m</span>
                      </div>
                    </div>
                  </div>

                  <GlassBadge
                    variant={
                      task.priority === 'urgent'
                        ? 'rose'
                        : task.priority === 'high'
                        ? 'amber'
                        : 'neutral'
                    }
                  >
                    {task.priority}
                  </GlassBadge>
                </div>
              ))
            )}
          </GlassCard>
        </div>

        {/* Right 1 Col: Active Projects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-accent-violet" />
              <span>Active Projects</span>
            </h3>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-accent-violet hover:underline font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {activeProjects?.map((proj: Project) => (
              <GlassCard
                key={proj._id}
                onClick={() => navigate(`/projects/${proj._id}`)}
                className="p-4 space-y-3 cursor-pointer"
                interactive
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-100">{proj.title}</h4>
                  <GlassBadge variant="cyan">{proj.status.replace('_', ' ')}</GlassBadge>
                </div>

                {proj.deadline && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent-amber" />
                    Due {new Date(proj.deadline).toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Progress</span>
                    <span className="font-bold text-slate-200">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-accent-violet to-accent-cyan h-1.5 rounded-full"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
