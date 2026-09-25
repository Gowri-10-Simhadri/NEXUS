import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { DocumentModel } from '../models/Document.js';
import { Note } from '../models/Note.js';
import { Decision } from '../models/Decision.js';
import { Activity } from '../models/Activity.js';
import { Project } from '../models/Project.js';
import { Goal } from '../models/Goal.js';
import { Task } from '../models/Task.js';

/* ─── DOCUMENTS ────────────────────────────── */

export async function getDocuments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const documents = await DocumentModel.find({ userId }).select('-content -chunks.embedding').sort({ createdAt: -1 });
    res.json({ success: true, data: { documents } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function createDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, originalFileName, fileType, fileSize, content, tags, projectId } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, error: { message: 'Title and content are required.' } });
      return;
    }

    // Chunk text for RAG (e.g. 500 chars per chunk)
    const chunkSize = 500;
    const chunks: Array<{ chunkIndex: number; text: string }> = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push({
        chunkIndex: Math.floor(i / chunkSize),
        text: content.slice(i, i + chunkSize),
      });
    }

    const doc = await DocumentModel.create({
      userId,
      title,
      originalFileName: originalFileName || `${title}.txt`,
      fileType: fileType || 'text/plain',
      fileSize: fileSize || content.length,
      content,
      chunks,
      tags: tags || [],
      projectId: projectId || undefined,
    });

    await Activity.create({
      userId,
      type: 'document_uploaded',
      entityType: 'document',
      entityId: doc._id,
      description: `Uploaded and indexed document "${doc.title}" into Personal Memory.`,
    }).catch(() => {});

    res.status(201).json({ success: true, data: { document: doc } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await DocumentModel.findOneAndDelete({ _id: id, userId });
    res.json({ success: true, message: 'Document removed from memory.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

/* ─── NOTES ────────────────────────────────── */

export async function getNotes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const notes = await Note.find({ userId }).sort({ isPinned: -1, updatedAt: -1 });
    res.json({ success: true, data: { notes } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function createNote(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, content, tags, projectId, goalId, isPinned } = req.body;

    const note = await Note.create({
      userId,
      title: title || 'Untitled Note',
      content: content || '',
      tags: tags || [],
      projectId: projectId || undefined,
      goalId: goalId || undefined,
      isPinned: isPinned || false,
    });

    res.status(201).json({ success: true, data: { note } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function updateNote(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const note = await Note.findOneAndUpdate({ _id: id, userId }, { $set: req.body }, { new: true });
    res.json({ success: true, data: { note } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function deleteNote(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await Note.findOneAndDelete({ _id: id, userId });
    res.json({ success: true, message: 'Note deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

/* ─── DECISIONS (Decision Memory) ──────────── */

export async function getDecisions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const decisions = await Decision.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: { decisions } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function createDecision(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, context, options, chosenOption, reasoning, outcome, tags, projectId } = req.body;

    if (!title || !chosenOption || !reasoning) {
      res.status(400).json({ success: false, error: { message: 'Title, chosen option, and reasoning are required.' } });
      return;
    }

    const decision = await Decision.create({
      userId,
      title,
      context: context || '',
      options: options || [],
      chosenOption,
      reasoning,
      outcome,
      tags: tags || [],
      projectId: projectId || undefined,
    });

    await Activity.create({
      userId,
      type: 'decision_created',
      entityType: 'decision',
      entityId: decision._id,
      description: `Logged key decision: "${decision.title}" -> "${decision.chosenOption}"`,
    }).catch(() => {});

    res.status(201).json({ success: true, data: { decision } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function deleteDecision(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await Decision.findOneAndDelete({ _id: id, userId });
    res.json({ success: true, message: 'Decision deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

/* ─── KNOWLEDGE GRAPH ──────────────────────── */

export async function getKnowledgeGraph(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const [goals, projects, tasks, documents, decisions] = await Promise.all([
      Goal.find({ userId }),
      Project.find({ userId }),
      Task.find({ userId }),
      DocumentModel.find({ userId }).select('title projectId'),
      Decision.find({ userId }).select('title chosenOption projectId'),
    ]);

    const nodes: any[] = [];
    const edges: any[] = [];

    // Goal nodes
    goals.forEach((g) => {
      nodes.push({
        id: `goal_${g._id}`,
        type: 'goalNode',
        data: { label: g.title, type: 'goal', progress: g.progress },
        position: { x: 100, y: nodes.length * 120 },
      });
    });

    // Project nodes
    projects.forEach((p, idx) => {
      nodes.push({
        id: `project_${p._id}`,
        type: 'projectNode',
        data: { label: p.title, type: 'project', progress: p.progress, deadline: p.deadline },
        position: { x: 400, y: idx * 100 },
      });

      if (p.goalId) {
        edges.push({
          id: `e_goal_proj_${p.goalId}_${p._id}`,
          source: `goal_${p.goalId}`,
          target: `project_${p._id}`,
          animated: true,
        });
      }
    });

    // Task nodes
    tasks.forEach((t, idx) => {
      if (t.projectId) {
        nodes.push({
          id: `task_${t._id}`,
          type: 'taskNode',
          data: { label: t.title, type: 'task', status: t.status, priority: t.priority },
          position: { x: 700, y: idx * 60 },
        });

        edges.push({
          id: `e_proj_task_${t.projectId}_${t._id}`,
          source: `project_${t.projectId}`,
          target: `task_${t._id}`,
        });
      }
    });

    // Decision nodes
    decisions.forEach((d, idx) => {
      nodes.push({
        id: `decision_${d._id}`,
        type: 'decisionNode',
        data: { label: d.title, type: 'decision', choice: d.chosenOption },
        position: { x: 400, y: 500 + idx * 80 },
      });

      if (d.projectId) {
        edges.push({
          id: `e_proj_dec_${d.projectId}_${d._id}`,
          source: `project_${d.projectId}`,
          target: `decision_${d._id}`,
        });
      }
    });

    // Document nodes
    documents.forEach((doc, idx) => {
      nodes.push({
        id: `doc_${doc._id}`,
        type: 'docNode',
        data: { label: doc.title, type: 'document' },
        position: { x: 700, y: 500 + idx * 80 },
      });

      if (doc.projectId) {
        edges.push({
          id: `e_proj_doc_${doc.projectId}_${doc._id}`,
          source: `project_${doc.projectId}`,
          target: `doc_${doc._id}`,
        });
      }
    });

    res.json({
      success: true,
      data: { nodes, edges },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
