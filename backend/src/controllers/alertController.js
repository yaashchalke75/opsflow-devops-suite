import { Alert } from '../models/Alert.js';
import { AuditLog } from '../models/AuditLog.js';
import { ApiError } from '../utils/ApiError.js';
import { presentAlert } from '../utils/presenters.js';

export async function list(req, res) {
  const { q, severity, status } = req.query;
  const filter = {};
  if (severity && severity !== 'all') filter.severity = severity;
  if (status && status !== 'all') filter.status = status;
  if (q) filter.title = new RegExp(q, 'i');
  const rows = await Alert.find(filter).sort({ createdAt: -1 }).lean();
  res.json(rows.map(presentAlert));
}

export async function create(req, res) {
  const row = await Alert.create(req.body);
  res.status(201).json(presentAlert(row.toObject()));
}

export async function updateStatus(req, res) {
  const row = await Alert.findById(req.params.id);
  if (!row) throw ApiError.notFound();
  row.status = req.body.status;
  await row.save();
  await AuditLog.create({
    actor: req.user._id, actorName: req.user.name,
    action: `Alert "${row.title}" → ${row.status}`, ip: req.ip,
  });
  res.json(presentAlert(row.toObject()));
}
