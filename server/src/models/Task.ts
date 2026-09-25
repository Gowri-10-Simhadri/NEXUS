import mongoose, { Schema, Document } from 'mongoose';
import { Priority, TaskStatus } from '../types/index.js';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  goalId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  deadline?: Date;
  estimatedDuration: number; // in minutes
  actualDuration: number;    // in minutes
  tags: string[];
  dependencies: mongoose.Types.ObjectId[];
  postponedCount: number;
  completedAt?: Date;
  snoozedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed', 'snoozed', 'cancelled'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    deadline: { type: Date, index: true },
    estimatedDuration: { type: Number, default: 60 }, // default 1 hour
    actualDuration: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    postponedCount: { type: Number, default: 0 },
    completedAt: { type: Date },
    snoozedUntil: { type: Date },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, deadline: 1 });
TaskSchema.index({ userId: 1, projectId: 1, status: 1 });
TaskSchema.index({ userId: 1, priority: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
