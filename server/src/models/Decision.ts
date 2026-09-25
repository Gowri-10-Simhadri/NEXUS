import mongoose, { Schema, Document } from 'mongoose';

export interface IDecisionOption {
  title: string;
  pros?: string[];
  cons?: string[];
}

export interface IDecision extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  context: string;
  options: IDecisionOption[];
  chosenOption: string;
  reasoning: string;
  outcome?: string;
  tags: string[];
  projectId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DecisionOptionSchema = new Schema<IDecisionOption>(
  {
    title: { type: String, required: true },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
  },
  { _id: false }
);

const DecisionSchema = new Schema<IDecision>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    context: { type: String, required: true },
    options: { type: [DecisionOptionSchema], default: [] },
    chosenOption: { type: String, required: true },
    reasoning: { type: String, required: true },
    outcome: { type: String },
    tags: { type: [String], default: [] },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  },
  { timestamps: true }
);

DecisionSchema.index({ userId: 1, createdAt: -1 });
DecisionSchema.index({ userId: 1, title: 'text', reasoning: 'text', context: 'text' });

export const Decision = mongoose.model<IDecision>('Decision', DecisionSchema);
