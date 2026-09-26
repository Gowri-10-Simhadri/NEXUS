import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Clock, Filter, Trash2, Calendar, Tag, FolderKanban, Search, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { GlassModal } from '../components/ui/GlassModal.js';
import { GlassInput, GlassTextArea } from '../components/ui/GlassInput.js';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { Task, Project } from '../types/index.js';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterView, setFilterView] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickProjectOpen, setIsQuickProjectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const navigate = useNavigate();

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [deadline, setDeadline] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState(60);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const [taskRes, projRes] = await Promise.all([
        api.get(`/tasks?view=${filterView === 'all' ? '' : filterView}`),
        api.get('/projects'),
      ]);
      setTasks(taskRes.data.data.tasks);
      setProjects(projRes.data.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filterView]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title,
        description,
        projectId: projectId || undefined,
        priority,
        deadline: deadline || undefined,
        estimatedDuration,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setProjectId('');
      setDeadline('');
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    try {
      const res = await api.post('/projects', {
        title: newProjectTitle,
        priority: 'high',
      });
      const createdProj = res.data.data.project;
      setProjects((prev) => [...prev, createdProj]);
      setProjectId(createdProj._id);
      setNewProjectTitle('');
      setIsQuickProjectOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      await api.patch(`/tasks/${taskId}/complete`);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter tasks based on project and search
  const filteredTasks = tasks.filter((task) => {
    const matchesProject =
      selectedProjectId === 'all' ||
      (selectedProjectId === 'standalone' && !task.projectId) ||
      (task.projectId && (task.projectId as any)._id === selectedProjectId);

    const matchesSearch =
      !searchQuery.trim() ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesProject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Tasks Management</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Organize, prioritize, and track all your actionable deliverables across projects and standalone tasks
          </p>
        </div>

        <GlassButton
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Task
        </GlassButton>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'today', label: 'Due Today' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterView(tab.id as any)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterView === tab.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Project Filter Select */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="rounded-xl bg-white dark:bg-nexus-900/80 border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-sm"
          >
            <option value="all">All Projects & Standalone</option>
            <option value="standalone">Standalone Tasks Only</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                📁 {p.title}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative flex-1 md:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white dark:bg-nexus-900/80 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <GlassCard className="p-12 text-center text-xs text-slate-500 space-y-3">
            <CheckSquare className="w-10 h-10 text-slate-400 mx-auto" />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No tasks found</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {searchQuery
                  ? 'No tasks matched your search query.'
                  : 'Add your first task or assign tasks to projects to begin organizing your workflow.'}
              </p>
            </div>
            <GlassButton
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Task
            </GlassButton>
          </GlassCard>
        ) : (
          filteredTasks.map((task) => (
            <GlassCard
              key={task._id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm"
              interactive
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => handleToggleComplete(task._id)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    task.status === 'completed'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/40'
                      : 'border-slate-300 dark:border-white/20 hover:border-violet-500'
                  }`}
                >
                  {task.status === 'completed' && <CheckSquare className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-1">
                  <h4
                    className={`text-sm font-semibold ${
                      task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {task.projectId ? (
                      <button
                        onClick={() => navigate(`/projects/${(task.projectId as any)._id || task.projectId}`)}
                        className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 font-medium hover:bg-cyan-100 transition-colors flex items-center gap-1 border border-cyan-200 dark:border-cyan-800/40"
                      >
                        <FolderKanban className="w-3 h-3" />
                        <span>{(task.projectId as any).title || 'Project'}</span>
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                        Standalone
                      </span>
                    )}

                    {task.deadline && (
                      <span className={`flex items-center gap-1 font-medium ${
                        new Date(task.deadline) < new Date() && task.status !== 'completed'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        <Clock className="w-3 h-3" />
                        Due {new Date(task.deadline).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    <span>• ~{task.estimatedDuration}m</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <GlassBadge
                  variant={
                    task.priority === 'urgent'
                      ? 'rose'
                      : task.priority === 'high'
                      ? 'amber'
                      : task.priority === 'low'
                      ? 'neutral'
                      : 'violet'
                  }
                >
                  {task.priority}
                </GlassBadge>

                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <GlassInput
            label="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement multi-track MIDI export pipeline"
            required
          />

          <GlassTextArea
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key acceptance criteria or technical notes..."
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Assign to Project</label>
                <button
                  type="button"
                  onClick={() => setIsQuickProjectOpen(true)}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                >
                  + New Project
                </button>
              </div>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl bg-white dark:bg-nexus-900/60 border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-sm"
              >
                <option value="">No Project (Standalone)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    📁 {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl bg-white dark:bg-nexus-900/60 border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Deadline (Date & Time)"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <GlassInput
              label="Estimated Duration (Minutes)"
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(Number(e.target.value))}
              min={5}
              step={15}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">
              Save Task
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Quick Project Creation Mini-Modal */}
      <GlassModal
        isOpen={isQuickProjectOpen}
        onClose={() => setIsQuickProjectOpen(false)}
        title="Quick Create Project"
        maxWidth="md"
      >
        <form onSubmit={handleQuickCreateProject} className="space-y-4">
          <GlassInput
            label="Project Title"
            value={newProjectTitle}
            onChange={(e) => setNewProjectTitle(e.target.value)}
            placeholder="e.g. AI Research Dashboard"
            required
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <GlassButton variant="ghost" type="button" onClick={() => setIsQuickProjectOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">
              Create & Select
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
