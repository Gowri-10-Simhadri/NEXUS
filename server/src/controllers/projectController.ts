import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';
import { IntelligenceService } from '../services/intelligenceService.js';

export async function getProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const projects = await Project.find({ userId }).sort({ deadline: 1, updatedAt: -1 });

    // Attach task count statistics to each project
    const enhancedProjects = await Promise.all(
      projects.map(async (p) => {
        const tasks = await Task.find({ projectId: p._id, userId });
        const completed = tasks.filter(t => t.status === 'completed').length;
        const total = tasks.length;
        return {
          ...p.toObject(),
          totalTasks: total,
          completedTasks: completed,
          pendingTasks: total - completed,
        };
      })
    );

    res.json({ success: true, data: { projects: enhancedProjects } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function getProjectById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, userId }).populate('goalId', 'title');
    if (!project) {
      res.status(404).json({ success: false, error: { message: 'Project not found.' } });
      return;
    }

    const tasks = await Task.find({ projectId: project._id, userId }).sort({ deadline: 1, priority: -1 });

    res.json({
      success: true,
      data: {
        project,
        tasks,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, description, goalId, status, priority, deadline, tags, color } = req.body;

    if (!title) {
      res.status(400).json({ success: false, error: { message: 'Project title is required.' } });
      return;
    }

    const project = await Project.create({
      userId,
      title,
      description,
      goalId: goalId || undefined,
      status: status || 'in_progress',
      priority: priority || 'medium',
      deadline: deadline ? new Date(deadline) : undefined,
      tags: tags || [],
      color: color || '#06b6d4',
      lastActivityAt: new Date(),
    });

    await Activity.create({
      userId,
      type: 'project_created',
      entityType: 'project',
      entityId: project._id,
      description: `Created project "${project.title}"`,
    }).catch(() => {});

    IntelligenceService.evaluateUserContext(userId).catch(() => {});

    res.status(201).json({ success: true, data: { project } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updates = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: id, userId },
      { $set: { ...updates, lastActivityAt: new Date() } },
      { new: true }
    );

    if (!project) {
      res.status(404).json({ success: false, error: { message: 'Project not found.' } });
      return;
    }

    await Activity.create({
      userId,
      type: 'project_updated',
      entityType: 'project',
      entityId: project._id,
      description: `Updated project "${project.title}"`,
    }).catch(() => {});

    IntelligenceService.evaluateUserContext(userId).catch(() => {});

    res.json({ success: true, data: { project } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const project = await Project.findOneAndDelete({ _id: id, userId });
    if (!project) {
      res.status(404).json({ success: false, error: { message: 'Project not found.' } });
      return;
    }

    // Also unassign tasks linked to this project
    await Task.updateMany({ projectId: id, userId }, { $unset: { projectId: 1 } });

    res.json({ success: true, message: 'Project deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
