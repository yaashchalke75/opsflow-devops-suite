import mongoose from 'mongoose';

const deploymentSchema = new mongoose.Schema(
  {
    version: { type: String, required: true },
    service: { type: String, required: true, index: true },
    environment: { type: String, enum: ['dev', 'staging', 'production'], required: true, index: true },
    status: {
      type: String,
      enum: ['success', 'failed', 'in_progress', 'rolled_back'],
      default: 'in_progress',
      index: true,
    },
    triggeredBy: String,
    commitSha: String,
    commitMessage: String,
    durationSec: { type: Number, default: 0 },
    releaseNotes: String,
    logs: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Deployment = mongoose.model('Deployment', deploymentSchema);
