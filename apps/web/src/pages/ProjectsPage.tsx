import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban, Clock, CheckSquare, Sparkles, ChevronRight, Trash2, CheckCircle2, Archive } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { GlassModal } from '../components/ui/GlassModal.js';
import { GlassInput, GlassTextArea } from '../components/ui/GlassInput.js';
import api from '../services/api.js';
import { Project, Goal } from '../types/index.js';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed'>('all');
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalId, setGoalId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [deadline, setDeadline] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projRes, goalRes] = await Promise.all([
        api.get('/projects'),
        api.get('/goals'),
      ]);
      setProjects(projRes.data.data.projects);
      setGoals(goalRes.data.data.goals);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/projects', {
        title,
        description,
        goalId: goalId || undefined,
        priority,
        deadline: deadline || undefined,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setGoalId('');
      setDeadline('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return p.status === 'completed' || p.progress === 100;
    return p.status !== 'completed' && p.progress < 100;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-100">Projects Dashboard</h2>
          <p className="text-xs text-slate-400">
            Create initiatives, attach actionable tasks, and track automated completion progress
          </p>
        </div>

        <GlassButton
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          New Project
        </GlassButton>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: 'all', label: 'All Projects' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id as any)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === tab.id
                ? 'bg-accent-cyan text-white shadow-md shadow-accent-cyan/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full">
            <GlassCard className="p-12 text-center text-xs text-slate-400 space-y-3">
              <FolderKanban className="w-10 h-10 text-slate-500 mx-auto" />
              <div>
                <p className="font-semibold text-slate-200 text-sm">No projects found</p>
                <p className="text-slate-400 mt-1">
                  Create a project to group tasks, monitor milestones, and automatically calculate progress.
                </p>
              </div>
              <GlassButton
                size="sm"
                onClick={() => setIsModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Create First Project
              </GlassButton>
            </GlassCard>
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const total = proj.totalTasks ?? 0;
            const completed = proj.completedTasks ?? 0;
            const isFinished = proj.status === 'completed' || (total > 0 && completed === total);

            return (
              <GlassCard
                key={proj._id}
                onClick={() => navigate(`/projects/${proj._id}`)}
                className="p-5 flex flex-col justify-between space-y-4 cursor-pointer hover:scale-[1.01] transition-transform"
                interactive
                glow={isFinished ? 'violet' : 'cyan'}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-slate-100 font-display leading-tight">
                      {proj.title}
                    </h3>
                    <GlassBadge variant={isFinished ? 'emerald' : 'cyan'}>
                      {isFinished ? 'Completed' : proj.status.replace('_', ' ')}
                    </GlassBadge>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  )}

                  {proj.deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-accent-amber font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Due {new Date(proj.deadline).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-3 border-t border-white/[0.08]">
                  <div className="flex justify-between items-center text-xs">
                    {total === 0 ? (
                      <span className="text-slate-400 italic">No tasks yet (0/0)</span>
                    ) : (
                      <span className="text-slate-300 font-medium">
                        {completed} / {total} tasks completed
                      </span>
                    )}
                    <span className="font-bold text-slate-100">{proj.progress}%</span>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isFinished
                          ? 'bg-gradient-to-r from-accent-emerald to-accent-cyan'
                          : 'bg-gradient-to-r from-accent-violet to-accent-cyan'
                      }`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Create Project Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <GlassInput
            label="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AI Research Dashboard"
            required
          />

          <GlassTextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Objectives, deliverables, or technical specs..."
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Link to Long-Term Goal</label>
              <select
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full rounded-xl bg-nexus-900/60 border border-white/10 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-violet/50"
              >
                <option value="">No Linked Goal (Independent)</option>
                {goals.map((g) => (
                  <option key={g._id} value={g._id}>
                    🎯 {g.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl bg-nexus-900/60 border border-white/10 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-violet/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <GlassInput
            label="Target Project Deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">
              Create Project
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
