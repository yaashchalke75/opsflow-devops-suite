import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    type: {
      type: String,
      enum: ['incident_assigned', 'alert_fired', 'deployment_done', 'task_due', 'mention'],
      required: true,
    },
    title: { type: String, required: true },
    body: String,
    link: String,
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export const Notification = mongoose.model('Notification', notificationSchema);
