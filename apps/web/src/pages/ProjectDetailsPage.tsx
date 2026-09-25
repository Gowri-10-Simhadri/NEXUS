import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Plus, CheckSquare, Sparkles, Trash2, Calendar, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { GlassModal } from '../components/ui/GlassModal.js';
import { GlassInput, GlassTextArea } from '../components/ui/GlassInput.js';
import api from '../services/api.js';
import { Project, Task } from '../types/index.js';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [taskEstimated, setTaskEstimated] = useState(60);
  const [taskDeadline, setTaskDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data.project);
      setTasks(res.data.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleToggleTask = async (taskId: string) => {
    try {
      await api.patch(`/tasks/${taskId}/complete`);
      loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        projectId: id,
        priority: taskPriority,
        estimatedDuration: taskEstimated,
        deadline: taskDeadline || undefined,
      });
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskDeadline('');
      loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProjectStatus = async () => {
    if (!project) return;
    const newStatus = project.status === 'completed' ? 'in_progress' : 'completed';
    try {
      await api.put(`/projects/${project._id}`, { status: newStatus });
      loadProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    try {
      await api.delete(`/projects/${project._id}`);
      navigate('/projects');
    } catch (err) {
      console.error(err);
    }
  };

  if (!project && !isLoading) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-slate-400">Project not found.</p>
        <GlassButton onClick={() => navigate('/projects')}>Back to Projects</GlassButton>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const allTasksCompleted = totalCount > 0 && completedCount === totalCount;

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'completed') return t.status === 'completed';
    if (taskFilter === 'pending') return t.status !== 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <GlassButton
            size="sm"
            variant={project?.status === 'completed' ? 'secondary' : 'primary'}
            onClick={handleToggleProjectStatus}
            icon={project?.status === 'completed' ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          >
            {project?.status === 'completed' ? 'Reopen Project' : 'Mark Project Completed'}
          </GlassButton>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-accent-rose hover:bg-white/10 transition-colors"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Project Banner Card */}
      {project && (
        <GlassCard className="p-6 sm:p-8 space-y-6" glow="cyan">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <GlassBadge variant={project.status === 'completed' ? 'emerald' : 'cyan'}>
                  {project.status === 'completed' ? 'Completed' : project.status.replace('_', ' ')}
                </GlassBadge>
                <GlassBadge variant={project.priority === 'urgent' ? 'rose' : 'amber'}>
                  {project.priority} priority
                </GlassBadge>
                {allTasksCompleted && project.status !== 'completed' && (
                  <span className="text-xs text-accent-emerald font-semibold flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready for completion!
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                {project.title}
              </h1>
              {project.description && (
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              {project.deadline && (
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Target Deadline</span>
                  <span className="text-accent-amber font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {new Date(project.deadline).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar & Task Statistics */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex justify-between text-xs text-slate-300 font-medium">
              <span>
                {totalCount === 0
                  ? 'No tasks created yet'
                  : `${completedCount} of ${totalCount} deliverables completed`}
              </span>
              <span className="font-bold text-accent-cyan">{project.progress}% Complete</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  project.progress === 100
                    ? 'bg-gradient-to-r from-accent-emerald to-accent-cyan'
                    : 'bg-gradient-to-r from-accent-violet to-accent-cyan'
                }`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </GlassCard>
      )}

      {/* Task Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold font-display flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-accent-cyan" />
              <span>Project Deliverables ({tasks.length})</span>
            </h3>

            {/* Filter */}
            <div className="flex items-center gap-1 bg-nexus-900/60 p-1 rounded-xl border border-white/10 text-[11px]">
              {(['all', 'pending', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTaskFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                    taskFilter === tab ? 'bg-accent-violet text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <GlassButton
            onClick={() => setIsTaskModalOpen(true)}
            size="sm"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Deliverable Task
          </GlassButton>
        </div>

        <GlassCard className="p-4 divide-y divide-white/[0.08]">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 space-y-3">
              <CheckSquare className="w-8 h-8 text-slate-500 mx-auto" />
              <div>
                <p className="font-semibold text-slate-200">
                  {totalCount === 0 ? 'No tasks in this project yet' : 'No tasks match current filter'}
                </p>
                <p className="text-slate-400 mt-1 max-w-sm mx-auto">
                  {totalCount === 0
                    ? 'Break down this project into specific tasks (e.g. Design UI, API Integration, Testing) to monitor progress automatically.'
                    : 'Switch your filter tab to see all tasks.'}
                </p>
              </div>
              {totalCount === 0 && (
                <GlassButton
                  size="sm"
                  onClick={() => setIsTaskModalOpen(true)}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add First Task
                </GlassButton>
              )}
            </div>
          ) : (
            filteredTasks.map((t) => (
              <div
                key={t._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleTask(t._id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      t.status === 'completed'
                        ? 'bg-accent-emerald border-accent-emerald text-white'
                        : 'border-white/20 hover:border-accent-violet'
                    }`}
                  >
                    {t.status === 'completed' && <CheckSquare className="w-3.5 h-3.5" />}
                  </button>
                  <div className="space-y-0.5">
                    <h5
                      className={`text-xs sm:text-sm font-semibold ${
                        t.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {t.title}
                    </h5>
                    {t.description && (
                      <p className="text-xs text-slate-400">{t.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                      {t.deadline && (
                        <span className="flex items-center gap-1 text-accent-amber">
                          <Clock className="w-3 h-3" /> Due {new Date(t.deadline).toLocaleDateString()}
                        </span>
                      )}
                      <span>~{t.estimatedDuration}m estimated</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <GlassBadge variant={t.priority === 'urgent' ? 'rose' : t.priority === 'high' ? 'amber' : 'violet'}>
                    {t.priority}
                  </GlassBadge>
                  <button
                    onClick={() => handleDeleteTask(t._id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-accent-rose transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </GlassCard>
      </div>

      {/* Add Task Modal */}
      <GlassModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Deliverable to Project"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <GlassInput
            label="Task Title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Implement multi-track MIDI exporter"
            required
            autoFocus
          />

          <GlassTextArea
            label="Description / Technical Notes (Optional)"
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
            placeholder="Acceptance criteria or dependencies..."
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full rounded-xl bg-nexus-900/60 border border-white/10 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <GlassInput
              label="Estimated Duration (Mins)"
              type="number"
              value={taskEstimated}
              onChange={(e) => setTaskEstimated(Number(e.target.value))}
              min={15}
              step={15}
            />
          </div>

          <GlassInput
            label="Deadline (Optional)"
            type="datetime-local"
            value={taskDeadline}
            onChange={(e) => setTaskDeadline(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton variant="ghost" type="button" onClick={() => setIsTaskModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">Add to Project</GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Delete Project Confirmation Modal */}
      <GlassModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p>
            Are you sure you want to delete <strong className="text-white">{project?.title}</strong>?
          </p>
          <p className="text-slate-400">
            Associated tasks will become standalone tasks rather than being deleted permanently.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <GlassButton variant="ghost" type="button" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton variant="danger" type="button" onClick={handleDeleteProject}>
              Confirm Delete
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};
