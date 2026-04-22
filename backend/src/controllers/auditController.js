import { AuditLog } from '../models/AuditLog.js';
import { presentAuditLog } from '../utils/presenters.js';

export async function list(_req, res) {
  const rows = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
  res.json(rows.map(presentAuditLog));
}
