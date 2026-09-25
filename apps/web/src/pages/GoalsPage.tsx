import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle2, Circle, Clock, Trash2, CheckSquare, RotateCcw, Sparkles } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { GlassModal } from '../components/ui/GlassModal.js';
import { GlassInput, GlassTextArea } from '../components/ui/GlassInput.js';
import api from '../services/api.js';
import { Goal } from '../types/index.js';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Career & Learning');
  const [targetDate, setTargetDate] = useState('');
  const [milestonesText, setMilestonesText] = useState('1. Complete foundational concepts\n2. Build prototype system\n3. Deploy & evaluate performance');
  const [isLoading, setIsLoading] = useState(true);

  // Quick milestone addition per card
  const [newMilestoneInputs, setNewMilestoneInputs] = useState<Record<string, string>>({});

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/goals');
      setGoals(res.data.data.goals);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const milestones = milestonesText
      .split('\n')
      .filter((m) => m.trim().length > 0)
      .map((m) => ({
        title: m.replace(/^\d+[\.\)]\s*/, '').trim(),
        completed: false,
      }));

    try {
      await api.post('/goals', {
        title,
        description,
        category,
        targetDate: targetDate || undefined,
        milestones,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setTargetDate('');
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (goal: Goal, milestoneIndex: number) => {
    const updatedMilestones = [...goal.milestones];
    const item = updatedMilestones[milestoneIndex];
    item.completed = !item.completed;
    item.completedAt = item.completed ? new Date().toISOString() : undefined;

    try {
      await api.put(`/goals/${goal._id}`, {
        milestones: updatedMilestones,
      });
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInlineMilestone = async (goal: Goal) => {
    const text = newMilestoneInputs[goal._id]?.trim();
    if (!text) return;

    const updatedMilestones = [...goal.milestones, { title: text, completed: false }];
    try {
      await api.put(`/goals/${goal._id}`, {
        milestones: updatedMilestones,
      });
      setNewMilestoneInputs((prev) => ({ ...prev, [goal._id]: '' }));
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMilestone = async (goal: Goal, milestoneIndex: number) => {
    const updatedMilestones = goal.milestones.filter((_, idx) => idx !== milestoneIndex);
    try {
      await api.put(`/goals/${goal._id}`, {
        milestones: updatedMilestones,
      });
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.delete(`/goals/${goalId}`);
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleGoalStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'completed' ? 'active' : 'completed';
    try {
      await api.put(`/goals/${goal._id}`, { status: newStatus });
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-100">Goals & Vision</h2>
          <p className="text-xs text-slate-400">
            Define long-term strategic goals, track incremental milestone completions, and watch your progress unfold
          </p>
        </div>

        <GlassButton
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          New Goal
        </GlassButton>
      </div>

      {goals.length === 0 ? (
        <GlassCard className="p-12 text-center text-xs text-slate-400 space-y-3">
          <Target className="w-10 h-10 text-slate-500 mx-auto" />
          <div>
            <p className="font-semibold text-slate-200 text-sm">No long-term goals set yet</p>
            <p className="text-slate-400 mt-1 max-w-md mx-auto">
              Create a goal (e.g. "Learn Machine Learning" or "Master Cloud Architecture") with 3-5 milestones to start tracking your cumulative growth.
            </p>
          </div>
          <GlassButton
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create First Goal
          </GlassButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const completedCount = goal.milestones.filter((m) => m.completed).length;
            const totalCount = goal.milestones.length;
            const isCompleted = goal.status === 'completed' || (totalCount > 0 && completedCount === totalCount);

            return (
              <GlassCard key={goal._id} className="p-6 space-y-5 flex flex-col justify-between" glow={isCompleted ? 'cyan' : 'violet'}>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <GlassBadge variant={isCompleted ? 'emerald' : 'violet'}>{goal.category}</GlassBadge>
                        {isCompleted && (
                          <span className="text-[11px] text-accent-emerald font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base text-slate-100 font-display pt-1">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-accent-violet">{goal.progress}%</span>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-1 text-slate-500 hover:text-accent-rose transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>{totalCount === 0 ? 'No milestones yet' : `${completedCount} of ${totalCount} milestones completed`}</span>
                      {goal.targetDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-accent-amber" />
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-accent-emerald to-accent-cyan'
                            : 'bg-gradient-to-r from-accent-violet via-accent-purple to-accent-emerald'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Milestones Checklist
                    </span>

                    <div className="space-y-1.5">
                      {goal.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          className="group flex items-center justify-between gap-2 p-2 rounded-xl bg-nexus-900/40 hover:bg-white/[0.08] transition-colors text-xs"
                        >
                          <div
                            onClick={() => handleToggleMilestone(goal, idx)}
                            className="flex items-center gap-2.5 flex-1 cursor-pointer"
                          >
                            {m.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                            <span
                              className={`${
                                m.completed ? 'line-through text-slate-500' : 'text-slate-200'
                              }`}
                            >
                              {m.title}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDeleteMilestone(goal, idx)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-accent-rose transition-opacity"
                            title="Remove milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Milestone Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newMilestoneInputs[goal._id] || ''}
                        onChange={(e) =>
                          setNewMilestoneInputs((prev) => ({
                            ...prev,
                            [goal._id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddInlineMilestone(goal);
                          }
                        }}
                        placeholder="+ Add next milestone..."
                        className="flex-1 rounded-xl bg-nexus-900/60 border border-white/10 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                      />
                      <button
                        onClick={() => handleAddInlineMilestone(goal)}
                        className="px-3 py-1.5 rounded-xl bg-accent-violet/20 hover:bg-accent-violet/30 text-accent-violet font-semibold text-xs transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                  <GlassButton
                    size="sm"
                    variant={isCompleted ? 'secondary' : 'primary'}
                    onClick={() => handleToggleGoalStatus(goal)}
                    icon={isCompleted ? <RotateCcw className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                  >
                    {isCompleted ? 'Reopen Goal' : 'Mark Goal Complete'}
                  </GlassButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Long-Term Strategic Goal"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <GlassInput
            label="Goal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Machine Learning & Neural Systems"
            required
            autoFocus
          />

          <GlassTextArea
            label="Description & Significance"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why does this goal matter? What is the tangible milestone target?"
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-nexus-900/60 border border-white/10 px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
              >
                <option value="Career & Learning">Career & Learning</option>
                <option value="Engineering & Product">Engineering & Product</option>
                <option value="Personal Growth">Personal Growth</option>
                <option value="Health & Routine">Health & Routine</option>
              </select>
            </div>

            <GlassInput
              label="Target Completion Date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <GlassTextArea
            label="Milestones (One per line)"
            value={milestonesText}
            onChange={(e) => setMilestonesText(e.target.value)}
            placeholder="Milestone 1&#10;Milestone 2&#10;Milestone 3"
            rows={4}
          />

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">Create Goal</GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
