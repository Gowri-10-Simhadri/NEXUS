import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage {
  _id?: Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IAIConversation extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const AIConversationSchema = new Schema<IAIConversation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New Chat', trim: true },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export const AIConversation = mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);
