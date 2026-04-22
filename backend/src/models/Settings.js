import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    scope: { type: String, enum: ['org', 'user'], required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, index: true },
    key: { type: String, required: true },
    value: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

settingsSchema.index({ scope: 1, ownerId: 1, key: 1 }, { unique: true });

export const Settings = mongoose.model('Settings', settingsSchema);
