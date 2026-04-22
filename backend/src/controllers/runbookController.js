import { Runbook } from '../models/Runbook.js';
import { AuditLog } from '../models/AuditLog.js';
import { ApiError } from '../utils/ApiError.js';
import { presentRunbook } from '../utils/presenters.js';

export async function list(req, res) {
  const { q } = req.query;
  const filter = q ? { $or: [{ title: new RegExp(q, 'i') }, { content: new RegExp(q, 'i') }] } : {};
  const rows = await Runbook.find(filter).sort({ updatedAt: -1 }).lean();
  res.json(rows.map(presentRunbook));
}

export async function get(req, res) {
  const row = await Runbook.findById(req.params.id).lean();
  if (!row) throw ApiError.notFound();
  res.json(presentRunbook(row));
}

export async function create(req, res) {
  const row = await Runbook.create({
    title: req.body.title,
    category: req.body.category,
    content: req.body.content,
    tags: req.body.tags || [],
    author: req.user._id,
    authorName: req.user.name,
    version: 1,
  });
  await AuditLog.create({
    actor: req.user._id, actorName: req.user.name,
    action: `Published runbook "${row.title}"`, ip: req.ip,
  });
  res.status(201).json(presentRunbook(row.toObject()));
}

export async function update(req, res) {
  const row = await Runbook.findById(req.params.id);
  if (!row) throw ApiError.notFound();
  Object.assign(row, req.body);
  row.version += 1;
  await row.save();
  res.json(presentRunbook(row.toObject()));
}

export async function remove(req, res) {
  await Runbook.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}
