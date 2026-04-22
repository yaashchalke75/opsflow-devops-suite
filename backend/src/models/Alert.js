import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, text: true },
    source: { type: String, required: true },
    severity: { type: String, enum: ['warning', 'major', 'critical'], required: true, index: true },
    status: { type: String, enum: ['firing', 'acknowledged', 'muted', 'resolved'], default: 'firing', index: true },
    message: String,
    resource: String,
    metricValue: String,
  },
  { timestamps: true },
);

export const Alert = mongoose.model('Alert', alertSchema);
