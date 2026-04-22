import { Incident } from '../models/Incident.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { presentIncident } from '../utils/presenters.js';

export async function list(req, res) {
  const { q, status, priority } = req.query;
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (priority && priority !== 'all') filter.priority = priority;
  if (q) {
    filter.$or = [
      { key: new RegExp(q, 'i') },
      { title: new RegExp(q, 'i') },
    ];
  }
  const rows = await Incident.find(filter).sort({ updatedAt: -1 }).lean();
  res.json(rows.map(presentIncident));
}

export async function get(req, res) {
  const row = await Incident.findById(req.params.id).lean();
  if (!row) throw ApiError.notFound();
  res.json(presentIncident(row));
}

export async function create(req, res) {
  const { title, description, priority, service, ownerId, tags } = req.body;
  const owner = ownerId ? await User.findById(ownerId).lean() : null;
  const key = await Incident.generateKey();
  const row = await Incident.create({
    key, title, description, priority: priority || 'medium',
    service, tags: tags || [],
    owner: owner?._id, ownerName: owner?.name,
    reporter: req.user._id,
  });
  await AuditLog.create({
    actor: req.user._id, actorName: req.user.name,
    action: `Created incident ${key}`, ip: req.ip,
  });
  if (owner) {
    await Notification.create({
      user: owner._id, type: 'incident_assigned',
      title: 'New incident assigned', body: `${key} · ${title}`, link: '/incidents',
    });
  }
  res.status(201).json(presentIncident(row));
}

export async function update(req, res) {
  const row = await Incident.findById(req.params.id);
  if (!row) throw ApiError.notFound();
  const prevStatus = row.status;
  Object.assign(row, req.body);
  if (req.body.status === 'resolved' && prevStatus !== 'resolved') row.resolvedAt = new Date();
  await row.save();
  await AuditLog.create({
    actor: req.user._id, actorName: req.user.name,
    action: `Updated incident ${row.key}`, ip: req.ip,
  });
  res.json(presentIncident(row.toObject()));
}

export async function remove(req, res) {
  await Incident.findByIdAndDelete(req.params.id);
  await AuditLog.create({
    actor: req.user._id, actorName: req.user.name,
    action: `Deleted incident ${req.params.id}`, ip: req.ip,
  });
  res.json({ ok: true });
}

export async function comment(req, res) {
  const row = await Incident.findById(req.params.id);
  if (!row) throw ApiError.notFound();
  const c = {
    authorId: req.user._id, authorName: req.user.name,
    message: req.body.message, type: 'comment',
  };
  row.comments.push(c);
  await row.save();
  const saved = row.comments[row.comments.length - 1];
  res.status(201).json({
    id: saved._id.toString(),
    authorId: req.user._id.toString(),
    authorName: req.user.name,
    message: saved.message,
    createdAt: saved.createdAt?.toISOString?.() || new Date().toISOString(),
    type: 'comment',
  });
}
