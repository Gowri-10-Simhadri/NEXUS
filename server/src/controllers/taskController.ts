import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Activity } from '../models/Activity.js';
import { IntelligenceService } from '../services/intelligenceService.js';

export async function getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { status, projectId, priority, search, view } = req.query;

    const filter: any = { userId };

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (projectId) {
      filter.projectId = projectId;
    }
    if (priority) {
      filter.priority = priority;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (view === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      filter.deadline = { $gte: todayStart, $lte: todayEnd };
    } else if (view === 'overdue') {
      filter.deadline = { $lt: new Date() };
      filter.status = { $ne: 'completed' };
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'title color')
      .sort({ deadline: 1, priority: -1, createdAt: -1 });

    res.json({ success: true, data: { tasks } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, description, projectId, goalId, priority, deadline, estimatedDuration, tags, dependencies } = req.body;

    if (!title) {
      res.status(400).json({ success: false, error: { message: 'Task title is required.' } });
      return;
    }

    const task = await Task.create({
      userId,
      title,
      description,
      projectId: projectId || undefined,
      goalId: goalId || undefined,
      priority: priority || 'medium',
      deadline: deadline ? new Date(deadline) : undefined,
      estimatedDuration: estimatedDuration || 60,
      tags: tags || [],
      dependencies: dependencies || [],
      status: 'todo',
    });

    // Update project last activity and recalculate progress if linked
    if (projectId) {
      await updateProjectProgress(projectId, userId);
    }

    await Activity.create({
      userId,
      type: 'task_created',
      entityType: 'task',
      entityId: task._id,
      description: `Created task "${task.title}"`,
    }).catch(() => {});

    // Trigger proactive intelligence evaluation asynchronously
    IntelligenceService.evaluateUserContext(userId).catch(() => {});

    res.status(201).json({ success: true, data: { task } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updates = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );

    if (!task) {
      res.status(404).json({ success: false, error: { message: 'Task not found.' } });
      return;
    }

    if (task.projectId) {
      await updateProjectProgress(task.projectId.toString(), userId);
    }

    await Activity.create({
      userId,
      type: 'task_updated',
      entityType: 'task',
      entityId: task._id,
      description: `Updated task "${task.title}"`,
    }).catch(() => {});

    IntelligenceService.evaluateUserContext(userId).catch(() => {});

    res.json({ success: true, data: { task } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function toggleTaskComplete(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      res.status(404).json({ success: false, error: { message: 'Task not found.' } });
      return;
    }

    const isCompleting = task.status !== 'completed';
    task.status = isCompleting ? 'completed' : 'todo';
    task.completedAt = isCompleting ? new Date() : undefined;
    await task.save();

    if (task.projectId) {
      await updateProjectProgress(task.projectId.toString(), userId);
    }

    await Activity.create({
      userId,
      type: isCompleting ? 'task_completed' : 'task_updated',
      entityType: 'task',
      entityId: task._id,
      description: isCompleting ? `Completed task "${task.title}"` : `Reopened task "${task.title}"`,
    }).catch(() => {});

    IntelligenceService.evaluateUserContext(userId).catch(() => {});

    res.json({ success: true, data: { task } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) {
      res.status(404).json({ success: false, error: { message: 'Task not found.' } });
      return;
    }

    if (task.projectId) {
      await updateProjectProgress(task.projectId.toString(), userId);
    }

    res.json({ success: true, message: 'Task deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

async function updateProjectProgress(projectId: string, userId: string) {
  try {
    const allProjectTasks = await Task.find({ projectId, userId });
    if (allProjectTasks.length === 0) {
      await Project.findOneAndUpdate(
        { _id: projectId, userId },
        { progress: 0, lastActivityAt: new Date() }
      );
      return;
    }

    const completed = allProjectTasks.filter(t => t.status === 'completed').length;
    const progress = Math.round((completed / allProjectTasks.length) * 100);

    await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { progress, lastActivityAt: new Date() }
    );
  } catch (err) {
    console.error('Error updating project progress:', err);
  }
}
