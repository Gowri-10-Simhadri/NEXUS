import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../types/index.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Goal } from '../models/Goal.js';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { DocumentModel } from '../models/Document.js';
import { Note } from '../models/Note.js';
import { Decision } from '../models/Decision.js';
import { Activity } from '../models/Activity.js';
import { Notification } from '../models/Notification.js';
import { UserSession } from '../models/UserSession.js';

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, profileType, timezone, workingHours, preferences, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(name && { name }),
          ...(profileType && { profileType }),
          ...(timezone && { timezone }),
          ...(workingHours && { workingHours }),
          ...(preferences && { preferences }),
          ...(avatar && { avatar }),
        },
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ success: false, error: { message: 'User not found.' } });
      return;
    }

    res.json({ success: true, data: { user } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function completeOnboarding(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { profileType, timezone, workingHours, preferences, initialGoals } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...(profileType && { profileType }),
          ...(timezone && { timezone }),
          ...(workingHours && { workingHours }),
          ...(preferences && { preferences }),
          onboardingComplete: true,
        },
      },
      { new: true }
    ).select('-passwordHash');

    // If user provided initial goals in onboarding, create them
    if (initialGoals && Array.isArray(initialGoals) && initialGoals.length > 0) {
      for (const g of initialGoals) {
        if (g.title) {
          await Goal.create({
            userId,
            title: g.title,
            category: g.category || 'General',
            status: 'active',
          });
        }
      }
    }

    res.json({ success: true, data: { user } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: { message: 'Current and new password are required.' } });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: { message: 'User not found.' } });
      return;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ success: false, error: { message: 'Incorrect current password.' } });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function exportData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    const [user, tasks, projects, goals, events, documents, notes, decisions, activities] = await Promise.all([
      User.findById(userId).select('-passwordHash'),
      Task.find({ userId }),
      Project.find({ userId }),
      Goal.find({ userId }),
      CalendarEvent.find({ userId }),
      DocumentModel.find({ userId }),
      Note.find({ userId }),
      Decision.find({ userId }),
      Activity.find({ userId }),
    ]);

    res.json({
      success: true,
      data: {
        exportedAt: new Date().toISOString(),
        user,
        tasks,
        projects,
        goals,
        calendarEvents: events,
        documents,
        notes,
        decisions,
        activities,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;

    await Promise.all([
      User.findByIdAndDelete(userId),
      Task.deleteMany({ userId }),
      Project.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      CalendarEvent.deleteMany({ userId }),
      DocumentModel.deleteMany({ userId }),
      Note.deleteMany({ userId }),
      Decision.deleteMany({ userId }),
      Activity.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      UserSession.deleteMany({ userId }),
    ]);

    res.json({ success: true, message: 'Account and all associated personal data permanently deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
