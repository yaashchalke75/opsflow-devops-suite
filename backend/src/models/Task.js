import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assigneeName: String,
    status: { type: String, enum: ['todo', 'in_progress', 'review', 'done'], default: 'todo', index: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueAt: Date,
  },
  { timestamps: true },
);

export const Task = mongoose.model('Task', taskSchema);
