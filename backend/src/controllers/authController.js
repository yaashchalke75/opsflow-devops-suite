import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { presentUser } from '../utils/presenters.js';
import { AuditLog } from '../models/AuditLog.js';

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpires });
}

export async function signup(req, res) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email }).lean();
  if (existing) throw ApiError.badRequest('Email already registered');
  const passwordHash = await bcrypt.hash(password, 10);
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const user = await User.create({
    name, email, passwordHash,
    role: 'developer',
    team: 'Platform',
    title: 'Developer',
    status: 'online',
    initials,
  });
  await AuditLog.create({ actor: user._id, actorName: name, action: 'Signed up', ip: req.ip });
  res.status(201).json({ user: presentUser(user), token: signToken(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');
  user.status = 'online';
  await user.save();
  await AuditLog.create({ actor: user._id, actorName: user.name, action: 'Logged in', ip: req.ip });
  res.json({ user: presentUser(user), token: signToken(user) });
}

export async function forgot(_req, res) {
  // In a real system we'd email a signed reset link. For now we just acknowledge.
  res.json({ ok: true });
}

export async function reset(req, res) {
  const { token, password } = req.body;
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) throw ApiError.badRequest('Invalid token');
    if (user.isDemo) {
      // Seeded demo accounts are shared — changing the password would lock everyone else out.
      throw ApiError.forbidden(
        'Demo account password is protected. Sign up for your own account to test password reset.',
      );
    }
    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ ok: true });
  } catch (e) {
    if (e?.status) throw e;
    // Invalid JWT / demo token → fail quietly so the UI flow still works.
    res.json({ ok: true });
  }
}

export async function me(req, res) {
  const user = await User.findById(req.user._id);
  res.json(presentUser(user));
}

/**
 * Demo login — one-click access for portfolio visitors.
 * `role` query param selects which seeded demo user to log in as.
 * Falls back to the super_admin account for a full-feature tour.
 */
export async function demoLogin(req, res) {
  const role = String(req.query.role || 'super_admin');
  const allowedRoles = ['super_admin', 'admin', 'manager', 'devops', 'developer', 'viewer'];
  const target = allowedRoles.includes(role) ? role : 'super_admin';

  const user = await User.findOne({ role: target, isDemo: true });
  if (!user) {
    throw ApiError.badRequest(
      'Demo user not available. Run `npm run seed` on the backend to create demo accounts.',
    );
  }

  user.status = 'online';
  await user.save();

  await AuditLog.create({
    actor: user._id, actorName: user.name,
    action: `Demo login as ${target}`, ip: req.ip,
  });

  res.json({
    user: presentUser(user),
    token: signToken(user),
    demo: true,
  });
}
