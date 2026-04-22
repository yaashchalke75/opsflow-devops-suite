import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Missing auth token');
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).lean();
    if (!user) throw ApiError.unauthorized('User no longer exists');
    req.user = user;
    next();
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid token'));
    }
    next(e);
  }
}

const ROLE_PERMS = {
  super_admin: ['*'],
  admin: ['users:manage', 'incidents:manage', 'deployments:manage', 'alerts:manage', 'runbooks:manage', 'settings:manage', 'analytics:view'],
  manager: ['incidents:manage', 'runbooks:manage', 'analytics:view'],
  devops: ['incidents:manage', 'deployments:manage', 'alerts:manage', 'runbooks:manage'],
  developer: ['incidents:manage', 'runbooks:manage'],
  viewer: [],
};

export function requirePermission(...perms) {
  return (req, _res, next) => {
    const role = req.user?.role;
    const allowed = ROLE_PERMS[role] || [];
    if (allowed.includes('*')) return next();
    if (perms.some((p) => allowed.includes(p))) return next();
    next(ApiError.forbidden('Insufficient role permissions'));
  };
}
