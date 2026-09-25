import mongoose, { Schema, Document } from 'mongoose';

export type CalendarEventType = 'event' | 'meeting' | 'exam' | 'deadline' | 'reminder' | 'focus';

export interface ICalendarEvent extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: CalendarEventType;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  location?: string;
  color?: string;
  linkedProjectId?: mongoose.Types.ObjectId;
  linkedTaskId?: mongoose.Types.ObjectId;
  isRecurring: boolean;
  recurrenceRule?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ['event', 'meeting', 'exam', 'deadline', 'reminder', 'focus'],
      default: 'event',
      index: true,
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    allDay: { type: Boolean, default: false },
    location: { type: String, trim: true },
    color: { type: String, default: '#8b5cf6' },
    linkedProjectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    linkedTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
    isRecurring: { type: Boolean, default: false },
    recurrenceRule: { type: String },
  },
  { timestamps: true }
);

CalendarEventSchema.index({ userId: 1, startTime: 1, endTime: 1 });
CalendarEventSchema.index({ userId: 1, type: 1 });

export const CalendarEvent = mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
