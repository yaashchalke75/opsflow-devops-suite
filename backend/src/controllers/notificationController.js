import { Notification } from '../models/Notification.js';
import { presentNotification } from '../utils/presenters.js';

export async function list(req, res) {
  const rows = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json(rows.map(presentNotification));
}

export async function markRead(req, res) {
  const row = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true },
  );
  res.json(presentNotification(row));
}

export async function markAllRead(req, res) {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ ok: true });
}
