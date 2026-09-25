import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { NotificationDevice } from '../models/NotificationDevice.js';

export async function registerDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { deviceId, platform, type, deviceName, pushSubscription } = req.body;

    if (!deviceId || !type) {
      res.status(400).json({ success: false, error: { message: 'deviceId and type are required.' } });
      return;
    }

    const device = await NotificationDevice.findOneAndUpdate(
      { userId, deviceId },
      {
        userId,
        deviceId,
        platform: platform || 'windows',
        type,
        deviceName: deviceName || (type === 'desktop_agent' ? 'Desktop Companion' : 'Web Browser'),
        pushSubscription: pushSubscription || undefined,
        connectionStatus: 'online',
        lastSeen: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: { device } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function getDevices(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const devices = await NotificationDevice.find({ userId }).sort({ lastSeen: -1 });
    res.json({ success: true, data: { devices } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}

export async function unregisterDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { deviceId } = req.params;

    await NotificationDevice.findOneAndDelete({ userId, deviceId });
    res.json({ success: true, message: 'Device disconnected and unregistered.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
}
