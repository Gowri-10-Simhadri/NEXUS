import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { Goal } from '../models/Goal.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';
import { IntelligenceService } from '../services/intelligenceService.js';

export async function getGoals(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const goals = await Goal.find({ userId }).sort({ targetDate: 1, createdAt: -1 });

    // Attach linked projects and tasks to each goal
    const enhancedGoals = await Promise.all(
      goals.map(async (g) => {
        const projects = await Project.find({ goalId: g._id, userId });
        const tasks = await Task.find({ goalId: g._id, userId });
        return {
          ...g.toObject(),
          linkedProjectsCount: projects.length,
          linkedTasksCount: tasks.length,
        };
      })
    );

    res.json({ success: true, data: { goals: enhancedGoals } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function createGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, description, category, targetDate, milestones, color } = req.body;

    if (!title) {
      res.status(400).json({ success: false, error: { message: 'Goal title is required.' } });
      return;
    }

    const goal = await Goal.create({
      userId,
      title,
      description,
      category: category || 'General',
      targetDate: targetDate ? new Date(targetDate) : undefined,
      milestones: milestones || [],
      progress: 0,
      status: 'active',
      color: color || '#8b5cf6',
    });

    await Activity.create({
      userId,
      type: 'goal_created',
      entityType: 'goal',
      entityId: goal._id,
      description: `Created goal "${goal.title}"`,
    }).catch(() => {});

    IntelligenceService.evaluateUserContext(userId).catch(() => {});

    res.status(201).json({ success: true, data: { goal } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function updateGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updates = req.body;

    if (updates.milestones && Array.isArray(updates.milestones)) {
      const completedMilestones = updates.milestones.filter((m: any) => m.completed).length;
      updates.progress = updates.milestones.length > 0 
        ? Math.round((completedMilestones / updates.milestones.length) * 100) 
        : updates.progress || 0;
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );

    if (!goal) {
      res.status(404).json({ success: false, error: { message: 'Goal not found.' } });
      return;
    }

    await Activity.create({
      userId,
      type: 'goal_progress',
      entityType: 'goal',
      entityId: goal._id,
      description: `Updated progress on goal "${goal.title}" to ${goal.progress}%`,
    }).catch(() => {});

    IntelligenceService.evaluateUserContext(userId).catch(() => {});

    res.json({ success: true, data: { goal } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function deleteGoal(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, userId });
    if (!goal) {
      res.status(404).json({ success: false, error: { message: 'Goal not found.' } });
      return;
    }

    res.json({ success: true, message: 'Goal deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
