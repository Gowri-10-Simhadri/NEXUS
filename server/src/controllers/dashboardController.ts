import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Goal } from '../models/Goal.js';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { Notification } from '../models/Notification.js';
import { IntelligenceService } from '../services/intelligenceService.js';
import { User } from '../models/User.js';

export async function getDashboardData(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const now = new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      user,
      todayTasks,
      activeProjects,
      activeGoals,
      todayEvents,
      unreadNotifications,
      insights,
    ] = await Promise.all([
      User.findById(userId).select('-passwordHash'),
      Task.find({ userId, status: { $ne: 'completed' } })
        .sort({ deadline: 1, priority: -1 })
        .limit(6),
      Project.find({ userId, status: 'in_progress' })
        .sort({ deadline: 1 })
        .limit(4),
      Goal.find({ userId, status: 'active' }).limit(3),
      CalendarEvent.find({
        userId,
        startTime: { $gte: todayStart, $lte: new Date(todayStart.getTime() + 48 * 60 * 60 * 1000) },
      }).sort({ startTime: 1 }).limit(5),
      Notification.countDocuments({ userId, status: 'unread' }),
      IntelligenceService.evaluateUserContext(userId),
    ]);

    // Calculate metrics
    const totalTasksCount = await Task.countDocuments({ userId });
    const completedTasksCount = await Task.countDocuments({ userId, status: 'completed' });
    const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalTasks: totalTasksCount,
          completedTasks: completedTasksCount,
          taskCompletionRate,
          activeProjectsCount: activeProjects.length,
          activeGoalsCount: activeGoals.length,
          unreadNotificationsCount: unreadNotifications,
        },
        todayTasks,
        activeProjects,
        activeGoals,
        upcomingEvents: todayEvents,
        insights,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function getDailyBriefing(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const now = new Date();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [tasksDueToday, eventsToday, activeProjects, insights] = await Promise.all([
      Task.find({ userId, deadline: { $gte: todayStart, $lte: todayEnd }, status: { $ne: 'completed' } }),
      CalendarEvent.find({ userId, startTime: { $gte: todayStart, $lte: todayEnd } }),
      Project.find({ userId, status: 'in_progress', deadline: { $exists: true } }),
      IntelligenceService.evaluateUserContext(userId),
    ]);

    const criticalInsights = insights.filter(i => i.priority === 'critical' || i.priority === 'high');

    res.json({
      success: true,
      data: {
        date: now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
        tasksDueTodayCount: tasksDueToday.length,
        eventsTodayCount: eventsToday.length,
        tasks: tasksDueToday,
        events: eventsToday,
        criticalAlerts: criticalInsights,
        focusRecommendation: criticalInsights.length > 0 
          ? criticalInsights[0].suggestedAction 
          : tasksDueToday.length > 0 
            ? `Complete top task: "${tasksDueToday[0].title}"`
            : 'Review ongoing goals and plan the upcoming week.',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
