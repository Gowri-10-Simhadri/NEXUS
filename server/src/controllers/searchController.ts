import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Goal } from '../models/Goal.js';
import { Note } from '../models/Note.js';
import { Decision } from '../models/Decision.js';
import { DocumentModel } from '../models/Document.js';

export async function globalSearch(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      res.json({
        success: true,
        data: { tasks: [], projects: [], goals: [], notes: [], decisions: [], documents: [] },
      });
      return;
    }

    const regex = { $regex: query, $options: 'i' };

    const [tasks, projects, goals, notes, decisions, documents] = await Promise.all([
      Task.find({ userId, $or: [{ title: regex }, { description: regex }, { tags: regex }] }).limit(5),
      Project.find({ userId, $or: [{ title: regex }, { description: regex }, { tags: regex }] }).limit(5),
      Goal.find({ userId, $or: [{ title: regex }, { description: regex }] }).limit(5),
      Note.find({ userId, $or: [{ title: regex }, { content: regex }] }).limit(5),
      Decision.find({ userId, $or: [{ title: regex }, { chosenOption: regex }, { reasoning: regex }] }).limit(5),
      DocumentModel.find({ userId, $or: [{ title: regex }, { content: regex }] }).select('title fileType fileSize tags createdAt').limit(5),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        projects,
        goals,
        notes,
        decisions,
        documents,
        totalMatches: tasks.length + projects.length + goals.length + notes.length + decisions.length + documents.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
