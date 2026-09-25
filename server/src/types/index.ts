import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthUser {
  userId: string;
  email: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export type ProfileType = 
  | 'student'
  | 'developer'
  | 'employee'
  | 'researcher'
  | 'freelancer'
  | 'entrepreneur'
  | 'teacher'
  | 'manager'
  | 'professional'
  | 'general';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'snoozed' | 'cancelled';

export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'archived';

export type GoalStatus = 'not_started' | 'active' | 'completed' | 'paused';

export type NotificationType = 
  | 'deadline'
  | 'conflict'
  | 'inactivity'
  | 'goal_stagnation'
  | 'overdue'
  | 'workload'
  | 'document'
  | 'ai_insight'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Milestone {
  _id?: Types.ObjectId;
  title: string;
  completed: boolean;
  dueDate?: Date;
  completedAt?: Date;
}
