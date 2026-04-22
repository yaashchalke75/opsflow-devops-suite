import { Deployment } from '../models/Deployment.js';
import { AuditLog } from '../models/AuditLog.js';
import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { presentDeployment } from '../utils/presenters.js';

export async function list(req, res) {
  const { q, env, status } = req.query;
  const filter = {};
  if (env && env !== 'all') filter.environment = env;
  if (status && status !== 'all') filter.status = status;
  if (q) filter.$or = [{ service: new RegExp(q, 'i') }, { version: new RegExp(q, 'i') }];
  const rows = await Deployment.find(filter).sort({ createdAt: -1 }).lean();
  res.json(rows.map(presentDeployment));
}

export async function create(req, res) {
  const row = await Deployment.create({
    version: req.body.version,
    service: req.body.service,
    environment: req.body.environment,
    commitMessage: req.body.commitMessage,
    releaseNotes: req.body.releaseNotes,
    commitSha: Math.random().toString(16).slice(2, 10),
    triggeredBy: req.user.name,
    status: 'in_progress',
    logs: ['[00:00] Deployment queued'],
  });
  await AuditLog.create({
    actor: req.user._id, actorName: req.user.name,
    action: `Triggered deployment ${row.service} ${row.version} → ${row.environment}`,
    ip: req.ip,
  });
  res.status(201).json(presentDeployment(row.toObject()));
}

export async function update(req, res) {
  const row = await Deployment.findById(req.params.id);
  if (!row) throw ApiError.notFound();
  Object.assign(row, req.body);
  await row.save();
  res.json(presentDeployment(row.toObject()));
}

export async function rollback(req, res) {
  const row = await Deployment.findById(req.params.id);
  if (!row) throw ApiError.notFound();
  row.status = 'rolled_back';
  row.logs.push('[ROLLBACK] Rolling back to previous healthy version');
  await row.save();
  await AuditLog.create({
    actor: req.user._id, actorName: req.user.name,
    action: `Rolled back ${row.service} ${row.version}`, ip: req.ip,
  });
  await Notification.create({
    user: req.user._id, type: 'deployment_done',
    title: 'Rollback executed', body: `${row.service} · ${row.version}`, link: '/deployments',
  });
  res.json(presentDeployment(row.toObject()));
}
