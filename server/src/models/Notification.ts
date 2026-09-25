import mongoose, { Schema, Document } from 'mongoose';
import { NotificationPriority, NotificationType } from '../types/index.js';

export interface INotificationAction {
  label: string;
  actionKey: 'view_plan' | 'snooze' | 'dismiss' | 'open_task' | 'open_project';
  url?: string;
  data?: Record<string, any>;
}

export interface INotificationReason {
  label: string;
  detail: string;
}

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: 'unread' | 'read' | 'dismissed' | 'snoozed' | 'resolved';
  reasons: INotificationReason[]; // "Why did I get this notification?"
  actions: INotificationAction[];
  linkedEntityType?: 'task' | 'project' | 'goal' | 'event' | 'document';
  linkedEntityId?: mongoose.Types.ObjectId;
  dedupKey: string; // e.g. "deadline_project_60f89a..."
  snoozedUntil?: Date;
  readAt?: Date;
  deliveredToDesktop: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationReasonSchema = new Schema<INotificationReason>(
  {
    label: { type: String, required: true },
    detail: { type: String, required: true },
  },
  { _id: false }
);

const NotificationActionSchema = new Schema<INotificationAction>(
  {
    label: { type: String, required: true },
    actionKey: { type: String, required: true },
    url: { type: String },
    data: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['deadline', 'conflict', 'inactivity', 'goal_stagnation', 'overdue', 'workload', 'document', 'ai_insight', 'system'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'dismissed', 'snoozed', 'resolved'],
      default: 'unread',
      index: true,
    },
    reasons: { type: [NotificationReasonSchema], default: [] },
    actions: { type: [NotificationActionSchema], default: [] },
    linkedEntityType: { type: String },
    linkedEntityId: { type: Schema.Types.ObjectId },
    dedupKey: { type: String, required: true, index: true },
    snoozedUntil: { type: Date },
    readAt: { type: Date },
    deliveredToDesktop: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, dedupKey: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
