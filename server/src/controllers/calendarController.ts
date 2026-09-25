import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Activity } from '../models/Activity.js';
import { IntelligenceService } from '../services/intelligenceService.js';

export async function getCalendarEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { start, end, type } = req.query;

    const filter: any = { userId };
    if (start && end) {
      filter.startTime = { $gte: new Date(start as string), $lte: new Date(end as string) };
    }
    if (type && type !== 'all') {
      filter.type = type;
    }

    const events = await CalendarEvent.find(filter)
      .populate('linkedProjectId', 'title color')
      .populate('linkedTaskId', 'title priority')
      .sort({ startTime: 1 });

    // Also fetch deadlines from Projects and Tasks to display as calendar items
    const projectDeadlines = await Project.find({
      userId,
      deadline: { $exists: true, $ne: null },
      ...(start && end && { deadline: { $gte: new Date(start as string), $lte: new Date(end as string) } }),
    });

    const taskDeadlines = await Task.find({
      userId,
      deadline: { $exists: true, $ne: null },
      status: { $ne: 'completed' },
      ...(start && end && { deadline: { $gte: new Date(start as string), $lte: new Date(end as string) } }),
    });

    res.json({
      success: true,
      data: {
        events,
        projectDeadlines: projectDeadlines.map(p => ({
          id: `p_deadline_${p._id}`,
          title: `[Project Deadline] ${p.title}`,
          startTime: p.deadline,
          endTime: p.deadline,
          type: 'deadline',
          color: p.color || '#06b6d4',
          projectId: p._id,
        })),
        taskDeadlines: taskDeadlines.map(t => ({
          id: `t_deadline_${t._id}`,
          title: `[Task Due] ${t.title}`,
          startTime: t.deadline,
          endTime: t.deadline,
          type: 'deadline',
          color: '#f59e0b',
          taskId: t._id,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function createCalendarEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, description, type, startTime, endTime, allDay, location, color, linkedProjectId, linkedTaskId } = req.body;

    if (!title || !startTime || !endTime) {
      res.status(400).json({ success: false, error: { message: 'Title, start time, and end time are required.' } });
      return;
    }

    const event = await CalendarEvent.create({
      userId,
      title,
      description,
      type: type || 'event',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      allDay: allDay || false,
      location,
      color: color || '#8b5cf6',
      linkedProjectId: linkedProjectId || undefined,
      linkedTaskId: linkedTaskId || undefined,
    });

    await Activity.create({
      userId,
      type: 'task_created',
      entityType: 'event',
      entityId: event._id,
      description: `Scheduled ${event.type} "${event.title}"`,
    }).catch(() => {});

    // Evaluate workload conflicts immediately when a new event or exam is added
    IntelligenceService.evaluateUserContext(userId).catch(() => {});

    res.status(201).json({ success: true, data: { event } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function updateCalendarEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const updates = req.body;

    const event = await CalendarEvent.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );

    if (!event) {
      res.status(404).json({ success: false, error: { message: 'Event not found.' } });
      return;
    }

    IntelligenceService.evaluateUserContext(userId).catch(() => {});

    res.json({ success: true, data: { event } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function deleteCalendarEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const event = await CalendarEvent.findOneAndDelete({ _id: id, userId });
    if (!event) {
      res.status(404).json({ success: false, error: { message: 'Event not found.' } });
      return;
    }

    res.json({ success: true, message: 'Event deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
