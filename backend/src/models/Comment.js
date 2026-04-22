import mongoose from 'mongoose';

/**
 * Standalone comments collection (optional). Incidents embed comments for
 * locality, but generic collaboration surfaces use this.
 */
const commentSchema = new mongoose.Schema(
  {
    target: { type: String, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: String,
    message: { type: String, required: true },
  },
  { timestamps: true },
);

export const Comment = mongoose.model('Comment', commentSchema);
