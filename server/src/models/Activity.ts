import mongoose, { Schema, Document } from 'mongoose';

export type ActivityType = 
  | 'task_created'
  | 'task_completed'
  | 'task_updated'
  | 'project_created'
  | 'project_updated'
  | 'goal_created'
  | 'goal_progress'
  | 'document_uploaded'
  | 'decision_created'
  | 'ai_plan_generated'
  | 'notification_action'
  | 'github_sync';

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: ActivityType;
  entityType?: 'task' | 'project' | 'goal' | 'document' | 'decision' | 'event';
  entityId?: mongoose.Types.ObjectId;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, index: true },
    entityType: { type: String },
    entityId: { type: Schema.Types.ObjectId },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
