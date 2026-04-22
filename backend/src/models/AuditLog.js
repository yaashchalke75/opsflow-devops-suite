import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: String,
    action: { type: String, required: true },
    target: { type: String, default: 'system' },
    ip: String,
  },
  { timestamps: true },
);

export const AuditLog = mongoose.model('AuditLog', auditSchema);
