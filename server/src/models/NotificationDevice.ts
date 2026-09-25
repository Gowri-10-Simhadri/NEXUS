import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDevice extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  platform: 'windows' | 'macos' | 'linux' | 'web';
  type: 'desktop_agent' | 'web_push';
  pushSubscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  socketId?: string;
  connectionStatus: 'online' | 'offline';
  lastSeen: Date;
  deviceName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationDeviceSchema = new Schema<INotificationDevice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    platform: { type: String, enum: ['windows', 'macos', 'linux', 'web'], default: 'windows' },
    type: { type: String, enum: ['desktop_agent', 'web_push'], required: true },
    pushSubscription: {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    },
    socketId: { type: String },
    connectionStatus: { type: String, enum: ['online', 'offline'], default: 'offline' },
    lastSeen: { type: Date, default: Date.now },
    deviceName: { type: String, default: 'Desktop Client' },
  },
  { timestamps: true }
);

NotificationDeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
NotificationDeviceSchema.index({ socketId: 1 });

export const NotificationDevice = mongoose.model<INotificationDevice>('NotificationDevice', NotificationDeviceSchema);
