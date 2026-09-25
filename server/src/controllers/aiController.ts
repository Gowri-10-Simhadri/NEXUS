import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { AIConversation, IMessage } from '../models/AIConversation.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Goal } from '../models/Goal.js';
import { Decision } from '../models/Decision.js';
import { Note } from '../models/Note.js';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { GeminiProvider } from '../ai/GeminiProvider.js';

/**
 * Intelligent helper to determine if query requires personal workspace context
 */
async function getSelectiveWorkspaceContext(userId: string, prompt: string): Promise<string | undefined> {
  const lower = prompt.toLowerCase();

  // Pattern detection for workspace/personal queries
  const isTaskQuery = lower.includes('task') || lower.includes('todo') || lower.includes('pending') || lower.includes('overdue');
  const isProjectQuery = lower.includes('project') || lower.includes('incomplete') || lower.includes('milestone');
  const isGoalQuery = lower.includes('goal') || lower.includes('target') || lower.includes('objective');
  const isDecisionQuery = lower.includes('decision') || lower.includes('architecture choice') || lower.includes('why did i choose');
  const isCalendarQuery = lower.includes('calendar') || lower.includes('schedule') || lower.includes('exam') || lower.includes('event') || lower.includes('meeting');
  const isGeneralWorkspace = lower.includes('nexus') || lower.includes('my work') || lower.includes('my day') || lower.includes('workload');

  if (!isTaskQuery && !isProjectQuery && !isGoalQuery && !isDecisionQuery && !isCalendarQuery && !isGeneralWorkspace) {
    return undefined; // General question (e.g. math, coding, philosophy, general knowledge) -> no workspace context
  }

  const contextParts: string[] = [];

  if (isTaskQuery || isGeneralWorkspace) {
    const tasks = await Task.find({ userId, status: { $in: ['todo', 'in_progress'] } })
      .limit(10)
      .select('title priority deadline status estimatedDuration')
      .populate('projectId', 'title');
    if (tasks.length > 0) {
      contextParts.push(
        `User's Active Tasks:\n` +
          tasks
            .map(
              (t: any) =>
                `- [${t.status.toUpperCase()}] ${t.title} (Priority: ${t.priority}, Due: ${
                  t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No deadline'
                }, Project: ${t.projectId?.title || 'None'})`
            )
            .join('\n')
      );
    }
  }

  if (isProjectQuery || isGeneralWorkspace) {
    const projects = await Project.find({ userId, status: { $in: ['in_progress', 'planning'] } })
      .limit(5)
      .select('title status progress deadline');
    if (projects.length > 0) {
      contextParts.push(
        `User's Active Projects:\n` +
          projects
            .map(
              (p) =>
                `- ${p.title} (${p.progress}% complete, Status: ${p.status}, Deadline: ${
                  p.deadline ? new Date(p.deadline).toLocaleDateString() : 'None'
                })`
            )
            .join('\n')
      );
    }
  }

  if (isGoalQuery) {
    const goals = await Goal.find({ userId, status: 'active' }).limit(5).select('title progress milestones category');
    if (goals.length > 0) {
      contextParts.push(
        `User's Active Goals:\n` +
          goals.map((g) => `- ${g.title} (${g.category}, ${g.progress}% progress)`).join('\n')
      );
    }
  }

  if (isDecisionQuery) {
    const decisions = await Decision.find({ userId }).limit(5).select('title chosenOption reasoning');
    if (decisions.length > 0) {
      contextParts.push(
        `User's Recorded Architectural Decisions:\n` +
          decisions.map((d) => `- ${d.title}: Chose "${d.chosenOption}" because: ${d.reasoning}`).join('\n')
      );
    }
  }

  if (isCalendarQuery) {
    const now = new Date();
    const events = await CalendarEvent.find({
      userId,
      startTime: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
    })
      .limit(5)
      .select('title type startTime endTime');
    if (events.length > 0) {
      contextParts.push(
        `User's Upcoming Calendar Events (Next 7 Days):\n` +
          events
            .map(
              (e) =>
                `- ${e.title} (${e.type}, ${new Date(e.startTime).toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })})`
            )
            .join('\n')
      );
    }
  }

  return contextParts.length > 0 ? contextParts.join('\n\n') : undefined;
}

/**
 * Derives a clean conversation title from the first prompt
 */
function deriveTitle(prompt: string): string {
  const cleaned = prompt.replace(/[^\w\s]/gi, '').trim();
  const words = cleaned.split(/\s+/).slice(0, 6);
  if (words.length === 0 || !words[0]) return 'New Chat';
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const userPrompt = req.body.message || req.body.prompt;
    const conversationId = req.body.conversationId;

    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
      res.status(400).json({ success: false, error: { message: 'Message cannot be empty.' } });
      return;
    }

    const trimmedPrompt = userPrompt.trim();

    // Find or create conversation
    let conversation = null;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId });
    }

    if (!conversation) {
      conversation = await AIConversation.create({
        userId,
        title: deriveTitle(trimmedPrompt),
        messages: [],
      });
    }

    // Append user message
    const userMessage: IMessage = {
      role: 'user',
      content: trimmedPrompt,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    // Fetch selective workspace context if applicable
    const workspaceContext = await getSelectiveWorkspaceContext(userId, trimmedPrompt);

    // Prepare message sequence for Gemini
    const chatHistory = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Call Gemini API
    const aiResponseText = await GeminiProvider.generateChatResponse(chatHistory, workspaceContext);

    // Append assistant response
    const assistantMessage: IMessage = {
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date(),
    };
    conversation.messages.push(assistantMessage);

    // Update conversation title if still default
    if (conversation.title === 'New Chat' || conversation.title === 'New Conversation') {
      conversation.title = deriveTitle(trimmedPrompt);
    }

    await conversation.save();

    res.json({
      success: true,
      data: {
        message: assistantMessage,
        conversationId: conversation._id,
        title: conversation.title,
      },
    });
  } catch (error: any) {
    console.error('[AIController] Chat processing error:', error.message);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to process AI chat request.',
      },
    });
  }
}

export async function getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const conversations = await AIConversation.find({ userId })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: { conversations } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function getConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const conversation = await AIConversation.findOne({ _id: id, userId });
    if (!conversation) {
      res.status(404).json({ success: false, error: { message: 'Conversation not found.' } });
      return;
    }

    res.json({ success: true, data: { conversation } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function createConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title } = req.body;

    const conversation = await AIConversation.create({
      userId,
      title: title || 'New Chat',
      messages: [],
    });

    res.status(201).json({ success: true, data: { conversation } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function updateConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title } = req.body;

    const conversation = await AIConversation.findOneAndUpdate(
      { _id: id, userId },
      { $set: { ...(title && { title }) } },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({ success: false, error: { message: 'Conversation not found.' } });
      return;
    }

    res.json({ success: true, data: { conversation } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const result = await AIConversation.findOneAndDelete({ _id: id, userId });
    if (!result) {
      res.status(404).json({ success: false, error: { message: 'Conversation not found.' } });
      return;
    }

    res.json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
