import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  projectId?: mongoose.Types.ObjectId;
  goalId?: mongoose.Types.ObjectId;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    goalId: { type: Schema.Types.ObjectId, ref: 'Goal' },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NoteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });
NoteSchema.index({ userId: 1, title: 'text', content: 'text' });

export const Note = mongoose.model<INote>('Note', NoteSchema);
