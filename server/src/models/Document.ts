import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentChunk {
  _id?: mongoose.Types.ObjectId;
  chunkIndex: number;
  text: string;
  embedding?: number[];
  tokenCount?: number;
}

export interface IDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  content: string; // extracted text
  summary?: string;
  chunks: IDocumentChunk[];
  tags: string[];
  projectId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>(
  {
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], default: [] },
    tokenCount: { type: Number, default: 0 },
  },
  { _id: true }
);

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    originalFileName: { type: String, default: 'memory.txt' },
    fileType: { type: String, default: 'text/markdown' },
    fileSize: { type: Number, default: 0 },
    content: { type: String, required: true },
    summary: { type: String },
    chunks: { type: [DocumentChunkSchema], default: [] },
    tags: { type: [String], default: [] },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  },
  { timestamps: true }
);

DocumentSchema.index({ userId: 1, title: 'text', content: 'text' });
DocumentSchema.index({ userId: 1, createdAt: -1 });

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
