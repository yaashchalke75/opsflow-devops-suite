import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth, requirePermission } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  signupSchema, loginSchema, forgotSchema, resetSchema,
  incidentCreateSchema, incidentUpdateSchema, commentSchema,
  deploymentCreateSchema, deploymentPatchSchema,
  alertPatchSchema, taskCreateSchema, taskPatchSchema,
  runbookCreateSchema, userPatchSchema,
} from '../validators/schemas.js';

import * as auth from '../controllers/authController.js';
import { guardDemoUserEdit } from '../middleware/demoGuard.js';
import * as dashboard from '../controllers/dashboardController.js';
import * as incidents from '../controllers/incidentController.js';
import * as deployments from '../controllers/deploymentController.js';
import * as alerts from '../controllers/alertController.js';
import * as team from '../controllers/teamController.js';
import * as runbooks from '../controllers/runbookController.js';
import * as notifications from '../controllers/notificationController.js';
import * as audit from '../controllers/auditController.js';
import * as analytics from '../controllers/analyticsController.js';

const r = Router();

r.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Auth
r.post('/auth/signup', validate(signupSchema), asyncHandler(auth.signup));
r.post('/auth/login', validate(loginSchema), asyncHandler(auth.login));
r.post('/auth/demo', asyncHandler(auth.demoLogin));
r.post('/auth/forgot', validate(forgotSchema), asyncHandler(auth.forgot));
r.post('/auth/reset', validate(resetSchema), asyncHandler(auth.reset));
r.get('/auth/me', requireAuth, asyncHandler(auth.me));

// Everything below requires auth
r.use(requireAuth);

// Dashboard
r.get('/dashboard', asyncHandler(dashboard.stats));

// Incidents
r.get('/incidents', asyncHandler(incidents.list));
r.get('/incidents/:id', asyncHandler(incidents.get));
r.post('/incidents', requirePermission('incidents:manage'), validate(incidentCreateSchema), asyncHandler(incidents.create));
r.patch('/incidents/:id', requirePermission('incidents:manage'), validate(incidentUpdateSchema), asyncHandler(incidents.update));
r.delete('/incidents/:id', requirePermission('incidents:manage'), asyncHandler(incidents.remove));
r.post('/incidents/:id/comments', validate(commentSchema), asyncHandler(incidents.comment));

// Deployments
r.get('/deployments', asyncHandler(deployments.list));
r.post('/deployments', requirePermission('deployments:manage'), validate(deploymentCreateSchema), asyncHandler(deployments.create));
r.patch('/deployments/:id', requirePermission('deployments:manage'), validate(deploymentPatchSchema), asyncHandler(deployments.update));
r.post('/deployments/:id/rollback', requirePermission('deployments:manage'), asyncHandler(deployments.rollback));

// Alerts
r.get('/alerts', asyncHandler(alerts.list));
r.post('/alerts', requirePermission('alerts:manage'), asyncHandler(alerts.create));
r.patch('/alerts/:id', requirePermission('alerts:manage'), validate(alertPatchSchema), asyncHandler(alerts.updateStatus));

// Team / Users / Tasks
r.get('/users', asyncHandler(team.listUsers));
r.patch('/users/:id', requirePermission('users:manage'), validate(userPatchSchema), asyncHandler(guardDemoUserEdit), asyncHandler(team.updateUser));
r.get('/teams', asyncHandler(team.listTeams));
r.get('/tasks', asyncHandler(team.listTasks));
r.post('/tasks', validate(taskCreateSchema), asyncHandler(team.createTask));
r.patch('/tasks/:id', validate(taskPatchSchema), asyncHandler(team.updateTask));

// Runbooks
r.get('/runbooks', asyncHandler(runbooks.list));
r.get('/runbooks/:id', asyncHandler(runbooks.get));
r.post('/runbooks', requirePermission('runbooks:manage'), validate(runbookCreateSchema), asyncHandler(runbooks.create));
r.patch('/runbooks/:id', requirePermission('runbooks:manage'), asyncHandler(runbooks.update));
r.delete('/runbooks/:id', requirePermission('runbooks:manage'), asyncHandler(runbooks.remove));

// Notifications
r.get('/notifications', asyncHandler(notifications.list));
r.patch('/notifications/:id/read', asyncHandler(notifications.markRead));
r.post('/notifications/read-all', asyncHandler(notifications.markAllRead));

// Audit & analytics
r.get('/audit-logs', requirePermission('users:manage'), asyncHandler(audit.list));
r.get('/analytics', requirePermission('analytics:view'), asyncHandler(analytics.overview));

export default r;
