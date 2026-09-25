import mongoose, { Schema, Document } from 'mongoose';
import { GoalStatus, Milestone } from '../types/index.js';

export interface IGoal extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category?: string;
  targetDate?: Date;
  milestones: Milestone[];
  progress: number; // 0 - 100
  status: GoalStatus;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<Milestone>(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    completedAt: { type: Date },
  },
  { _id: true }
);

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, default: 'General' },
    targetDate: { type: Date },
    milestones: { type: [MilestoneSchema], default: [] },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['not_started', 'active', 'completed', 'paused'],
      default: 'active',
      index: true,
    },
    color: { type: String, default: '#8b5cf6' },
  },
  { timestamps: true }
);

GoalSchema.index({ userId: 1, status: 1 });
GoalSchema.index({ userId: 1, targetDate: 1 });

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
