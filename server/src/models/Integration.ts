import mongoose, { Schema, Document } from 'mongoose';

export type IntegrationProvider = 'github' | 'google_calendar' | 'google_drive' | 'slack' | 'custom';

export interface IIntegration extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  provider: IntegrationProvider;
  accountName?: string;
  accountEmail?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  scopes: string[];
  status: 'connected' | 'error' | 'disconnected';
  lastSyncedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: {
      type: String,
      enum: ['github', 'google_calendar', 'google_drive', 'slack', 'custom'],
      required: true,
      index: true,
    },
    accountName: { type: String },
    accountEmail: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenExpiresAt: { type: Date },
    scopes: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['connected', 'error', 'disconnected'],
      default: 'connected',
    },
    lastSyncedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

IntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

export const Integration = mongoose.model<IIntegration>('Integration', IntegrationSchema);
