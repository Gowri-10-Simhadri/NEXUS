export interface User {
  id: string;
  name: string;
  email: string;
  profileType: string;
  avatar?: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  preferences: {
    theme: 'dark' | 'light' | 'system';
    desktopNotifications: boolean;
    browserNotifications: boolean;
    emailNotifications: boolean;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    dailyNotificationLimit: number;
    aiProvider: 'gemini' | 'openai';
    startOnBoot: boolean;
  };
  onboardingComplete: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  projectId?: { _id: string; title: string; color?: string };
  goalId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'snoozed' | 'cancelled';
  deadline?: string;
  estimatedDuration: number;
  actualDuration: number;
  tags: string[];
  dependencies: string[];
  postponedCount: number;
  completedAt?: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  goalId?: { _id: string; title: string };
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: string;
  progress: number;
  tags: string[];
  color: string;
  totalTasks?: number;
  completedTasks?: number;
  pendingTasks?: number;
  lastActivityAt: string;
  createdAt: string;
}

export interface Milestone {
  _id?: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  completedAt?: string;
}

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  category: string;
  targetDate?: string;
  milestones: Milestone[];
  progress: number;
  status: 'not_started' | 'active' | 'completed' | 'paused';
  color: string;
  linkedProjectsCount?: number;
  linkedTasksCount?: number;
  createdAt: string;
}

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  type: 'event' | 'meeting' | 'exam' | 'deadline' | 'reminder' | 'focus';
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string;
  color: string;
  linkedProjectId?: { _id: string; title: string; color?: string };
  linkedTaskId?: { _id: string; title: string; priority?: string };
}

export interface NotificationReason {
  label: string;
  detail: string;
}

export interface NotificationAction {
  label: string;
  actionKey: 'view_plan' | 'snooze' | 'dismiss' | 'open_task' | 'open_project';
  url?: string;
  data?: Record<string, any>;
}

export interface Notification {
  _id: string;
  type: 'deadline' | 'conflict' | 'inactivity' | 'goal_stagnation' | 'overdue' | 'workload' | 'document' | 'ai_insight' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'dismissed' | 'snoozed' | 'resolved';
  reasons: NotificationReason[];
  actions: NotificationAction[];
  linkedEntityType?: string;
  linkedEntityId?: string;
  snoozedUntil?: string;
  createdAt: string;
}

export interface InsightResult {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reasons: NotificationReason[];
  suggestedAction: string;
  entityType?: string;
  entityId?: string;
}

export interface DocumentItem {
  _id: string;
  title: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  content?: string;
  tags: string[];
  createdAt: string;
}

export interface NoteItem {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DecisionOption {
  title: string;
  pros?: string[];
  cons?: string[];
}

export interface DecisionItem {
  _id: string;
  title: string;
  context: string;
  options: DecisionOption[];
  chosenOption: string;
  reasoning: string;
  outcome?: string;
  tags: string[];
  createdAt: string;
}

export interface ActivityItem {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
}
