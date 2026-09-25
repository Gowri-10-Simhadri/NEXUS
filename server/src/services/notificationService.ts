import mongoose from 'mongoose';
import { Notification, INotification } from '../models/Notification.js';
import { NotificationDevice } from '../models/NotificationDevice.js';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { emitToUser } from './socketService.js';
import { NotificationPriority, NotificationType } from '../types/index.js';
import webpush from 'web-push';
import { config } from '../config/env.js';

if (config.vapid.publicKey && config.vapid.privateKey) {
  webpush.setVapidDetails(
    config.vapid.email,
    config.vapid.publicKey,
    config.vapid.privateKey
  );
}

export interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  reasons: Array<{ label: string; detail: string }>;
  actions?: Array<{
    label: string;
    actionKey: 'view_plan' | 'snooze' | 'dismiss' | 'open_task' | 'open_project';
    url?: string;
    data?: Record<string, any>;
  }>;
  linkedEntityType?: 'task' | 'project' | 'goal' | 'event' | 'document';
  linkedEntityId?: string | mongoose.Types.ObjectId;
  dedupKey: string;
  cooldownHours?: number;
}

export class NotificationService {
  /**
   * Dispatch a notification with anti-spam deduplication and multi-channel delivery
   */
  static async dispatch(params: CreateNotificationParams): Promise<INotification | null> {
    const userId = params.userId.toString();
    const cooldownHours = params.cooldownHours ?? 6;

    // 1. Anti-spam / Deduplication check
    const cooldownDate = new Date(Date.now() - cooldownHours * 60 * 60 * 1000);
    const existingRecent = await Notification.findOne({
      userId,
      dedupKey: params.dedupKey,
      createdAt: { $gte: cooldownDate },
      status: { $ne: 'dismissed' },
    });

    if (existingRecent) {
      // Notification already sent recently within cooldown period
      return null;
    }

    // 2. User settings / Quiet hours check
    const user = await User.findById(userId);
    if (user?.preferences?.quietHours?.enabled) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

      const { start, end } = user.preferences.quietHours;
      const inQuietHours = start > end 
        ? currentTimeStr >= start || currentTimeStr <= end 
        : currentTimeStr >= start && currentTimeStr <= end;

      // In quiet hours, only critical notifications pass immediately
      if (inQuietHours && params.priority !== 'critical') {
        console.log(`[Notification] Suppressed due to quiet hours for user ${userId}`);
        return null;
      }
    }

    // 3. Create Notification in MongoDB
    const notification = await Notification.create({
      userId,
      type: params.type,
      title: params.title,
      message: params.message,
      priority: params.priority || 'medium',
      status: 'unread',
      reasons: params.reasons,
      actions: params.actions || [
        { label: 'View Plan', actionKey: 'view_plan', url: '/ai' },
        { label: 'Snooze (2h)', actionKey: 'snooze', data: { hours: 2 } },
        { label: 'Dismiss', actionKey: 'dismiss' },
      ],
      linkedEntityType: params.linkedEntityType,
      linkedEntityId: params.linkedEntityId,
      dedupKey: params.dedupKey,
    });

    // 4. Record Activity
    await Activity.create({
      userId,
      type: 'notification_action',
      description: `Notification received: ${params.title}`,
      metadata: { notificationId: notification._id, type: params.type },
    }).catch(() => {});

    // 5. Broadcast in real-time via Socket.IO (received by Web App and Desktop Agent)
    emitToUser(userId, 'notification:new', notification);

    // 6. Push via Web Push if configured
    if (config.vapid.publicKey && config.vapid.privateKey) {
      const pushDevices = await NotificationDevice.find({
        userId,
        type: 'web_push',
        pushSubscription: { $exists: true },
      });

      for (const device of pushDevices) {
        if (device.pushSubscription) {
          try {
            await webpush.sendNotification(
              device.pushSubscription as any,
              JSON.stringify({
                title: params.title,
                body: params.message,
                data: {
                  url: config.frontendUrl,
                  notificationId: notification._id,
                },
              })
            );
          } catch (err: any) {
            if (err.statusCode === 410 || err.statusCode === 404) {
              // Expired subscription, clean up
              await NotificationDevice.findByIdAndDelete(device._id);
            }
          }
        }
      }
    }

    return notification;
  }
}
