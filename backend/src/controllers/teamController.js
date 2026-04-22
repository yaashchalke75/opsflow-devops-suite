import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { Task } from '../models/Task.js';
import { AuditLog } from '../models/AuditLog.js';
import { ApiError } from '../utils/ApiError.js';
import { presentUser, presentTeam, presentTask } from '../utils/presenters.js';

export async function listUsers(_req, res) {
  const rows = await User.find({}).sort({ createdAt: 1 }).lean();
  res.json(rows.map(presentUser));
}

export async function updateUser(req, res) {
  const row = await User.findById(req.params.id);
  if (!row) throw ApiError.notFound();
  const patch = {};
  for (const k of ['role', 'title', 'team', 'name', 'status']) if (req.body[k] !== undefined) patch[k] = req.body[k];
  Object.assign(row, patch);
  await row.save();
  if (patch.role) {
    await AuditLog.create({
      actor: req.user._id, actorName: req.user.name,
      action: `Changed role of ${row.name} → ${patch.role}`, ip: req.ip,
    });
  }
  res.json(presentUser(row));
}

export async function listTeams(_req, res) {
  const rows = await Team.find({}).sort({ name: 1 }).lean();
  res.json(rows.map(presentTeam));
}

export async function listTasks(_req, res) {
  const rows = await Task.find({}).sort({ createdAt: -1 }).lean();
  res.json(rows.map(presentTask));
}

export async function createTask(req, res) {
  const assignee = await User.findById(req.body.assigneeId).lean();
  if (!assignee) throw ApiError.badRequest('Unknown assignee');
  const row = await Task.create({
    title: req.body.title,
    description: req.body.description,
    assignee: assignee._id,
    assigneeName: assignee.name,
    priority: req.body.priority || 'medium',
    dueAt: req.body.dueAt,
  });
  res.status(201).json(presentTask(row.toObject()));
}

export async function updateTask(req, res) {
  const row = await Task.findById(req.params.id);
  if (!row) throw ApiError.notFound();
  Object.assign(row, req.body);
  await row.save();
  res.json(presentTask(row.toObject()));
}
