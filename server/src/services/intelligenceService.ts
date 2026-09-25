import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { Goal } from '../models/Goal.js';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { NotificationService } from './notificationService.js';

export interface InsightResult {
  id: string;
  type: 'conflict' | 'deadline_risk' | 'inactivity' | 'goal_stagnation' | 'workload_spike' | 'overdue';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reasons: Array<{ label: string; detail: string }>;
  suggestedAction: string;
  entityType?: 'project' | 'task' | 'goal' | 'event';
  entityId?: string;
}

export class IntelligenceService {
  /**
   * Run all detection rules for a specific user or all users
   */
  static async evaluateUserContext(userId: string): Promise<InsightResult[]> {
    const insights: InsightResult[] = [];
    const now = new Date();

    // 1. Fetch active projects, incomplete tasks, upcoming events, and goals
    const [projects, tasks, events, goals] = await Promise.all([
      Project.find({ userId, status: { $in: ['in_progress', 'planning'] } }),
      Task.find({ userId, status: { $in: ['todo', 'in_progress'] } }),
      CalendarEvent.find({
        userId,
        startTime: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }, // next 7 days
      }),
      Goal.find({ userId, status: 'active' }),
    ]);

    // RULE 1: FLAGSHIP WORKLOAD CONFLICT DETECTION (Project Deadline + Exam / Calendar Event proximity)
    for (const project of projects) {
      if (project.deadline) {
        const projectDeadline = new Date(project.deadline);
        const hoursUntilDeadline = (projectDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);

        // If project deadline is within next 72 hours
        if (hoursUntilDeadline > 0 && hoursUntilDeadline <= 72) {
          const projectTasks = tasks.filter(
            (t) => t.projectId && t.projectId.toString() === project._id.toString()
          );
          const pendingTasks = projectTasks.filter((t) => t.status !== 'completed');
          const totalEstimatedMinutes = pendingTasks.reduce((sum, t) => sum + (t.estimatedDuration || 60), 0);
          const estimatedHours = Math.round(totalEstimatedMinutes / 60 * 10) / 10;

          // Check if there is an exam or important event within 36 hours of project deadline
          const conflictingEvents = events.filter((e) => {
            const eventStart = new Date(e.startTime);
            const diffHours = Math.abs(eventStart.getTime() - projectDeadline.getTime()) / (1000 * 60 * 60);
            return diffHours <= 36 || (e.type === 'exam' && diffHours <= 48);
          });

          if (conflictingEvents.length > 0 && pendingTasks.length > 0) {
            const primaryEvent = conflictingEvents[0];
            const eventName = primaryEvent.title;
            const eventTypeStr = primaryEvent.type === 'exam' ? 'Examination' : 'Event';

            const insight: InsightResult = {
              id: `conflict_${project._id}_${primaryEvent._id}`,
              type: 'conflict',
              title: `Potential Workload Conflict: ${project.title} & ${eventName}`,
              description: `Project "${project.title}" is due ${projectDeadline.toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}, while ${eventTypeStr} "${eventName}" is scheduled closely after. You have ${pendingTasks.length} pending tasks (${estimatedHours} hrs estimated work).`,
              priority: 'critical',
              reasons: [
                { label: 'Project deadline', detail: `${projectDeadline.toLocaleDateString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}` },
                { label: `${eventTypeStr} schedule`, detail: `${new Date(primaryEvent.startTime).toLocaleDateString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })}` },
                { label: 'Project progress', detail: `${project.progress}% completed` },
                { label: 'Pending tasks', detail: `${pendingTasks.length} tasks remaining` },
                { label: 'Estimated remaining work', detail: `${estimatedHours} hours` },
              ],
              suggestedAction: `Complete ${pendingTasks[0]?.title || 'pending tasks'} today to reserve time for ${eventName}.`,
              entityType: 'project',
              entityId: project._id.toString(),
            };

            insights.push(insight);

            // Automatically dispatch notification
            await NotificationService.dispatch({
              userId,
              type: 'conflict',
              title: `Workload Conflict: ${project.title}`,
              message: `Your project is due soon with ${pendingTasks.length} tasks remaining, and "${eventName}" is right around the corner. Suggested: Complete critical tasks today.`,
              priority: 'critical',
              reasons: insight.reasons,
              actions: [
                { label: 'View AI Plan', actionKey: 'view_plan', url: '/ai' },
                { label: 'Snooze (4h)', actionKey: 'snooze', data: { hours: 4 } },
                { label: 'Dismiss', actionKey: 'dismiss' },
              ],
              linkedEntityType: 'project',
              linkedEntityId: project._id,
              dedupKey: `conflict_${project._id}_${primaryEvent._id}`,
              cooldownHours: 6,
            });
          }
        }
      }
    }

    // RULE 2: PROJECT DEADLINE RISK (< 24 hours with pending tasks)
    for (const project of projects) {
      if (project.deadline) {
        const projectDeadline = new Date(project.deadline);
        const hoursUntilDeadline = (projectDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilDeadline > 0 && hoursUntilDeadline <= 24) {
          const projectTasks = tasks.filter(
            (t) => t.projectId && t.projectId.toString() === project._id.toString()
          );
          const pendingTasks = projectTasks.filter((t) => t.status !== 'completed');
          const totalEstimatedMinutes = pendingTasks.reduce((sum, t) => sum + (t.estimatedDuration || 60), 0);
          const estimatedHours = Math.round(totalEstimatedMinutes / 60 * 10) / 10;

          if (pendingTasks.length > 0) {
            const insight: InsightResult = {
              id: `deadline_${project._id}`,
              type: 'deadline_risk',
              title: `Urgent Project Deadline: ${project.title}`,
              description: `Project "${project.title}" is due in ${Math.round(hoursUntilDeadline)} hours and has ${pendingTasks.length} incomplete tasks.`,
              priority: 'high',
              reasons: [
                { label: 'Deadline', detail: projectDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                { label: 'Incomplete tasks', detail: `${pendingTasks.length} tasks` },
                { label: 'Estimated time needed', detail: `${estimatedHours} hours` },
              ],
              suggestedAction: `Focus on completing high-priority items: ${pendingTasks.map(t => t.title).slice(0, 2).join(', ')}.`,
              entityType: 'project',
              entityId: project._id.toString(),
            };

            insights.push(insight);

            await NotificationService.dispatch({
              userId,
              type: 'deadline',
              title: `Project Deadline: ${project.title}`,
              message: `Due in ${Math.round(hoursUntilDeadline)}h with ${pendingTasks.length} pending tasks (${estimatedHours}h estimated work).`,
              priority: 'high',
              reasons: insight.reasons,
              actions: [
                { label: 'Open Project', actionKey: 'open_project', url: `/projects/${project._id}` },
                { label: 'View Plan', actionKey: 'view_plan', url: '/ai' },
              ],
              linkedEntityType: 'project',
              linkedEntityId: project._id,
              dedupKey: `deadline_${project._id}`,
              cooldownHours: 4,
            });
          }
        }
      }
    }

    // RULE 2B: INDIVIDUAL TASK DEADLINES (< 24 hours / Due Today)
    const upcomingTasks = tasks.filter((t) => {
      if (!t.deadline || t.status === 'completed') return false;
      const diffHours = (new Date(t.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24;
    });

    for (const task of upcomingTasks) {
      const taskDeadline = new Date(task.deadline!);
      const hoursLeft = Math.max(1, Math.round((taskDeadline.getTime() - now.getTime()) / (1000 * 60 * 60)));

      const insight: InsightResult = {
        id: `task_deadline_${task._id}`,
        type: 'deadline_risk',
        title: `Task Deadline: ${task.title}`,
        description: `Deliverable "${task.title}" is due ${hoursLeft <= 12 ? 'today' : 'in ' + hoursLeft + ' hours'} (~${task.estimatedDuration}m estimated).`,
        priority: task.priority === 'urgent' ? 'critical' : 'high',
        reasons: [
          { label: 'Due time', detail: taskDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          { label: 'Priority', detail: task.priority },
          { label: 'Estimated duration', detail: `${task.estimatedDuration} minutes` },
        ],
        suggestedAction: `Allocate time block to complete "${task.title}".`,
        entityType: 'task',
        entityId: task._id.toString(),
      };

      insights.push(insight);

      await NotificationService.dispatch({
        userId,
        type: 'deadline',
        title: `Task Deadline: ${task.title}`,
        message: `Deadline is ${hoursLeft <= 12 ? 'today' : 'in ' + hoursLeft + ' hours'} at ${taskDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (~${task.estimatedDuration}m work).`,
        priority: task.priority === 'urgent' ? 'critical' : 'high',
        reasons: insight.reasons,
        actions: [
          { label: 'Open Tasks', actionKey: 'open_task', url: '/tasks' },
          { label: 'Snooze (2h)', actionKey: 'snooze', data: { hours: 2 } },
          { label: 'Dismiss', actionKey: 'dismiss' },
        ],
        linkedEntityType: 'task',
        linkedEntityId: task._id,
        dedupKey: `task_deadline_${task._id}`,
        cooldownHours: 4,
      });
    }

    // RULE 3: OVERDUE TASKS
    const overdueTasks = tasks.filter((t) => t.deadline && new Date(t.deadline) < now && t.status !== 'completed');
    if (overdueTasks.length > 0) {
      insights.push({
        id: `overdue_tasks_summary`,
        type: 'overdue',
        title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? 's' : ''}`,
        description: `You have ${overdueTasks.length} task(s) past their deadline that need attention or rescheduling.`,
        priority: 'high',
        reasons: [
          { label: 'Oldest overdue', detail: overdueTasks[0].title },
          { label: 'Total overdue', detail: `${overdueTasks.length} tasks` },
        ],
        suggestedAction: 'Review overdue tasks to either complete, snooze, or reschedule.',
      });

      // Dispatch notification for top overdue task
      await NotificationService.dispatch({
        userId,
        type: 'deadline',
        title: `Overdue Task: ${overdueTasks[0].title}`,
        message: `Task is past its deadline. Suggested: Complete or reschedule today.`,
        priority: 'high',
        reasons: [
          { label: 'Task', detail: overdueTasks[0].title },
          { label: 'Original deadline', detail: new Date(overdueTasks[0].deadline!).toLocaleDateString() },
        ],
        actions: [
          { label: 'Open Tasks', actionKey: 'open_task', url: '/tasks' },
          { label: 'Snooze', actionKey: 'snooze', data: { hours: 4 } },
        ],
        linkedEntityType: 'task',
        linkedEntityId: overdueTasks[0]._id,
        dedupKey: `overdue_${overdueTasks[0]._id}`,
        cooldownHours: 6,
      });
    }

    // RULE 4: INACTIVITY DETECTION (Project with no activity for 5+ days)
    for (const project of projects) {
      const daysSinceActivity = (now.getTime() - new Date(project.lastActivityAt || project.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceActivity >= 5 && project.status === 'in_progress') {
        insights.push({
          id: `inactivity_${project._id}`,
          type: 'inactivity',
          title: `Inactive Project: ${project.title}`,
          description: `No recorded activity on "${project.title}" for ${Math.floor(daysSinceActivity)} days.`,
          priority: 'medium',
          reasons: [
            { label: 'Days inactive', detail: `${Math.floor(daysSinceActivity)} days` },
            { label: 'Current status', detail: project.status },
          ],
          suggestedAction: 'Resume work or update the project status if blocked.',
          entityType: 'project',
          entityId: project._id.toString(),
        });
      }
    }

    // RULE 5: GOAL STAGNATION
    for (const goal of goals) {
      const daysSinceUpdate = (now.getTime() - new Date(goal.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate >= 7 && goal.progress < 100) {
        insights.push({
          id: `goal_stagnation_${goal._id}`,
          type: 'goal_stagnation',
          title: `Goal Stagnant: ${goal.title}`,
          description: `No milestone updates on goal "${goal.title}" in over a week.`,
          priority: 'medium',
          reasons: [
            { label: 'Current progress', detail: `${goal.progress}%` },
            { label: 'Last updated', detail: `${Math.floor(daysSinceUpdate)} days ago` },
          ],
          suggestedAction: 'Break down the next milestone into smaller, actionable daily tasks.',
          entityType: 'goal',
          entityId: goal._id.toString(),
        });
      }
    }

    return insights;
  }

  /**
   * Evaluate all registered users across the system (invoked by worker)
   */
  static async evaluateAllUsers(): Promise<number> {
    const users = await User.find({}, '_id');
    let evaluatedCount = 0;
    for (const user of users) {
      try {
        await this.evaluateUserContext(user._id.toString());
        evaluatedCount++;
      } catch (err: any) {
        console.error(`[Intelligence] Error evaluating user ${user._id}:`, err.message);
      }
    }
    return evaluatedCount;
  }
}
