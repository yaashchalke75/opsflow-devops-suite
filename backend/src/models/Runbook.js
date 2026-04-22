import mongoose from 'mongoose';

const runbookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, text: true },
    category: { type: String, required: true, index: true },
    content: { type: String, required: true, text: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    version: { type: Number, default: 1 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

runbookSchema.index({ title: 'text', content: 'text' });

export const Runbook = mongoose.model('Runbook', runbookSchema);
