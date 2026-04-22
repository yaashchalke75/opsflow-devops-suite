import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    message: { type: String, required: true },
    type: { type: String, enum: ['comment', 'status_change', 'assigned'], default: 'comment' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const incidentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, text: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium', index: true },
    status: { type: String, enum: ['open', 'investigating', 'monitoring', 'resolved'], default: 'open', index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ownerName: String,
    service: { type: String, required: true, index: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    resolvedAt: Date,
  },
  { timestamps: true },
);

incidentSchema.index({ title: 'text', description: 'text' });

incidentSchema.statics.generateKey = async function () {
  // Scan all keys and pick (max + 1). Ordering by createdAt isn't reliable —
  // seeded incidents backdate createdAt, so the "newest" row is the lowest key.
  const rows = await this.find({}, { key: 1 }).lean();
  const max = rows.reduce((acc, r) => {
    const n = Number(String(r.key).replace(/^INC-/, ''));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 1041);
  return `INC-${max + 1}`;
};

export const Incident = mongoose.model('Incident', incidentSchema);
