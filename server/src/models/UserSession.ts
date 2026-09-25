import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  deviceInfo: {
    browser?: string;
    os?: string;
    ip?: string;
    platform?: string;
  };
  expiresAt: Date;
  createdAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshToken: { type: String, required: true, unique: true },
    deviceInfo: {
      browser: String,
      os: String,
      ip: String,
      platform: String,
    },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);
