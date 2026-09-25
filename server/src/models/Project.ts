import mongoose, { Schema, Document } from 'mongoose';
import { Priority, ProjectStatus } from '../types/index.js';

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  goalId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: Priority;
  deadline?: Date;
  startDate?: Date;
  progress: number; // 0 - 100
  tags: string[];
  color?: string;
  githubRepo?: {
    owner: string;
    repo: string;
    lastSyncedAt?: Date;
  };
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'on_hold', 'completed', 'archived'],
      default: 'in_progress',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    deadline: { type: Date, index: true },
    startDate: { type: Date, default: Date.now },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    tags: { type: [String], default: [] },
    color: { type: String, default: '#06b6d4' },
    githubRepo: {
      owner: String,
      repo: String,
      lastSyncedAt: Date,
    },
    lastActivityAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ userId: 1, status: 1 });
ProjectSchema.index({ userId: 1, deadline: 1 });
ProjectSchema.index({ userId: 1, lastActivityAt: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
