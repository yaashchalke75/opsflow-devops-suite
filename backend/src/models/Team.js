import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: String,
    memberCount: { type: Number, default: 0 },
    lead: String,
    color: { type: String, default: '#F43F5E' },
  },
  { timestamps: true },
);

export const Team = mongoose.model('Team', teamSchema);
