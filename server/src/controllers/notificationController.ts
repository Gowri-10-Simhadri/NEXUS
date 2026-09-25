import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { Notification } from '../models/Notification.js';

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { status, limit = 50 } = req.query;

    const filter: any = { userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ userId, status: 'unread' });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { status: 'read', readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, error: { message: 'Notification not found.' } });
      return;
    }

    res.json({ success: true, data: { notification } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    await Notification.updateMany({ userId, status: 'unread' }, { status: 'read', readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function snoozeNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { hours = 2 } = req.body;

    const snoozedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { status: 'snoozed', snoozedUntil },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, error: { message: 'Notification not found.' } });
      return;
    }

    res.json({ success: true, data: { notification } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function dismissNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { status: 'dismissed' },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, error: { message: 'Notification not found.' } });
      return;
    }

    res.json({ success: true, data: { notification } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
