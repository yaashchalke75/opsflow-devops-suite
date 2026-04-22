import { http, USE_MOCK } from './client';
import { delay, uid } from '@/lib/utils';
import * as mock from '@/mock/data';
import type {
  AuthPayload, User, Incident, IncidentComment, Deployment, Alert,
  Task, Runbook, Notification, DashboardStats, AnalyticsPayload, AuditLog, Team,
} from '@/types';

/**
 * API facade. Every module exposes the same surface whether running against
 * the in-memory mock (demo mode) or the real backend. Flip VITE_USE_MOCK=false
 * in .env and point VITE_API_URL at your server — no call sites need to change.
 */

// ------------- AUTH -------------
export const authApi = {
  async login(email: string, password: string): Promise<AuthPayload> {
    if (!USE_MOCK) return (await http.post('/auth/login', { email, password })).data;
    await delay();
    const user = mock.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? mock.users[0];
    if (password.length < 4) throw new Error('Invalid credentials');
    return { user, token: 'mock.' + uid('tok') };
  },
  async signup(input: { name: string; email: string; password: string }): Promise<AuthPayload> {
    if (!USE_MOCK) return (await http.post('/auth/signup', input)).data;
    await delay();
    const user: User = {
      id: uid('usr'),
      name: input.name,
      email: input.email,
      role: 'developer',
      avatarColor: '#F43F5E',
      initials: input.name.slice(0, 2).toUpperCase(),
      title: 'Developer',
      team: 'Platform',
      status: 'online',
      createdAt: new Date().toISOString(),
    };
    mock.users.push(user);
    return { user, token: 'mock.' + uid('tok') };
  },
  async forgot(email: string): Promise<{ ok: true }> {
    if (!USE_MOCK) return (await http.post('/auth/forgot', { email })).data;
    await delay(); return { ok: true };
  },
  async reset(token: string, password: string): Promise<{ ok: true }> {
    if (!USE_MOCK) return (await http.post('/auth/reset', { token, password })).data;
    await delay(); return { ok: true };
  },
  async me(): Promise<User> {
    if (!USE_MOCK) return (await http.get('/auth/me')).data;
    await delay(120);
    const cached = localStorage.getItem('opsflow_user');
    if (cached) return JSON.parse(cached);
    return mock.users[0];
  },
  async demo(role: string = 'super_admin'): Promise<AuthPayload & { demo?: boolean }> {
    if (!USE_MOCK) return (await http.post(`/auth/demo?role=${role}`)).data;
    await delay();
    const user = mock.users.find((u) => u.role === role) ?? mock.users[0];
    return { user, token: 'demo.' + uid('tok'), demo: true };
  },
};

// ------------- DASHBOARD -------------
export const dashboardApi = {
  async stats(): Promise<DashboardStats> {
    if (!USE_MOCK) return (await http.get('/dashboard')).data;
    await delay(200); return mock.dashboard;
  },
};

// ------------- INCIDENTS -------------
export const incidentApi = {
  async list(params?: { q?: string; status?: string; priority?: string }): Promise<Incident[]> {
    if (!USE_MOCK) return (await http.get('/incidents', { params })).data;
    await delay();
    let rows = [...mock.incidents];
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(q) || r.key.toLowerCase().includes(q));
    }
    if (params?.status && params.status !== 'all') rows = rows.filter((r) => r.status === params.status);
    if (params?.priority && params.priority !== 'all') rows = rows.filter((r) => r.priority === params.priority);
    return rows.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  },
  async get(id: string): Promise<Incident> {
    if (!USE_MOCK) return (await http.get(`/incidents/${id}`)).data;
    await delay();
    const row = mock.incidents.find((r) => r.id === id);
    if (!row) throw new Error('Not found');
    return row;
  },
  async create(input: Partial<Incident>): Promise<Incident> {
    if (!USE_MOCK) return (await http.post('/incidents', input)).data;
    await delay();
    const owner = mock.users.find((u) => u.id === input.ownerId) ?? mock.users[1];
    const incident: Incident = {
      id: uid('inc'),
      key: `INC-${1100 + mock.incidents.length}`,
      title: input.title || 'Untitled incident',
      description: input.description || '',
      priority: input.priority || 'medium',
      status: 'open',
      ownerId: owner.id, ownerName: owner.name,
      service: input.service || 'api-gateway',
      reporterId: mock.users[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [], tags: input.tags || [],
    };
    mock.incidents.unshift(incident);
    return incident;
  },
  async update(id: string, patch: Partial<Incident>): Promise<Incident> {
    if (!USE_MOCK) return (await http.patch(`/incidents/${id}`, patch)).data;
    await delay();
    const idx = mock.incidents.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Not found');
    mock.incidents[idx] = { ...mock.incidents[idx], ...patch, updatedAt: new Date().toISOString() };
    if (patch.status === 'resolved') mock.incidents[idx].resolvedAt = new Date().toISOString();
    return mock.incidents[idx];
  },
  async remove(id: string): Promise<{ ok: true }> {
    if (!USE_MOCK) return (await http.delete(`/incidents/${id}`)).data;
    await delay();
    const idx = mock.incidents.findIndex((r) => r.id === id);
    if (idx >= 0) mock.incidents.splice(idx, 1);
    return { ok: true };
  },
  async comment(id: string, message: string, author: User): Promise<IncidentComment> {
    if (!USE_MOCK) return (await http.post(`/incidents/${id}/comments`, { message })).data;
    await delay();
    const row = mock.incidents.find((r) => r.id === id)!;
    const c: IncidentComment = {
      id: uid('cmt'), authorId: author.id, authorName: author.name,
      message, createdAt: new Date().toISOString(), type: 'comment',
    };
    row.comments.push(c);
    row.updatedAt = c.createdAt;
    return c;
  },
};

// ------------- DEPLOYMENTS -------------
export const deploymentApi = {
  async list(params?: { env?: string; status?: string; q?: string }): Promise<Deployment[]> {
    if (!USE_MOCK) return (await http.get('/deployments', { params })).data;
    await delay();
    let rows = [...mock.deployments];
    if (params?.env && params.env !== 'all') rows = rows.filter((r) => r.environment === params.env);
    if (params?.status && params.status !== 'all') rows = rows.filter((r) => r.status === params.status);
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter((r) => r.service.includes(q) || r.version.includes(q));
    }
    return rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },
  async create(input: Partial<Deployment>): Promise<Deployment> {
    if (!USE_MOCK) return (await http.post('/deployments', input)).data;
    await delay();
    const d: Deployment = {
      id: uid('dep'),
      version: input.version || 'v0.0.1',
      service: input.service || 'api-gateway',
      environment: input.environment || 'staging',
      status: 'in_progress',
      triggeredBy: mock.users[0].name,
      commitSha: Math.random().toString(16).slice(2, 10),
      commitMessage: input.commitMessage || 'chore: release',
      durationSec: 0,
      createdAt: new Date().toISOString(),
      releaseNotes: input.releaseNotes,
      logs: ['[00:00] Build queued'],
    };
    mock.deployments.unshift(d);
    return d;
  },
  async updateStatus(id: string, status: Deployment['status']): Promise<Deployment> {
    if (!USE_MOCK) return (await http.patch(`/deployments/${id}`, { status })).data;
    await delay();
    const d = mock.deployments.find((r) => r.id === id)!;
    d.status = status;
    return d;
  },
  async rollback(id: string): Promise<Deployment> {
    if (!USE_MOCK) return (await http.post(`/deployments/${id}/rollback`)).data;
    await delay();
    const d = mock.deployments.find((r) => r.id === id)!;
    d.status = 'rolled_back';
    return d;
  },
};

// ------------- ALERTS -------------
export const alertApi = {
  async list(params?: { severity?: string; status?: string; q?: string }): Promise<Alert[]> {
    if (!USE_MOCK) return (await http.get('/alerts', { params })).data;
    await delay();
    let rows = [...mock.alerts];
    if (params?.severity && params.severity !== 'all') rows = rows.filter((r) => r.severity === params.severity);
    if (params?.status && params.status !== 'all') rows = rows.filter((r) => r.status === params.status);
    if (params?.q) {
      const q = params.q.toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(q));
    }
    return rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  },
  async setStatus(id: string, status: Alert['status']): Promise<Alert> {
    if (!USE_MOCK) return (await http.patch(`/alerts/${id}`, { status })).data;
    await delay();
    const a = mock.alerts.find((r) => r.id === id)!;
    a.status = status;
    return a;
  },
};

// ------------- TEAMS / USERS / TASKS -------------
export const teamApi = {
  async listUsers(): Promise<User[]> {
    if (!USE_MOCK) return (await http.get('/users')).data;
    await delay(); return mock.users;
  },
  async listTeams(): Promise<Team[]> {
    if (!USE_MOCK) return (await http.get('/teams')).data;
    await delay(); return mock.teams;
  },
  async updateUser(id: string, patch: Partial<User>): Promise<User> {
    if (!USE_MOCK) return (await http.patch(`/users/${id}`, patch)).data;
    await delay();
    const u = mock.users.find((x) => x.id === id)!;
    Object.assign(u, patch);
    return u;
  },
  async listTasks(): Promise<Task[]> {
    if (!USE_MOCK) return (await http.get('/tasks')).data;
    await delay(); return mock.tasks;
  },
  async createTask(input: Partial<Task>): Promise<Task> {
    if (!USE_MOCK) return (await http.post('/tasks', input)).data;
    await delay();
    const assignee = mock.users.find((u) => u.id === input.assigneeId) ?? mock.users[1];
    const t: Task = {
      id: uid('tsk'),
      title: input.title || 'Untitled',
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      status: 'todo', priority: input.priority || 'medium',
      dueAt: input.dueAt, createdAt: new Date().toISOString(),
    };
    mock.tasks.unshift(t);
    return t;
  },
  async updateTask(id: string, patch: Partial<Task>): Promise<Task> {
    if (!USE_MOCK) return (await http.patch(`/tasks/${id}`, patch)).data;
    await delay();
    const t = mock.tasks.find((x) => x.id === id)!;
    Object.assign(t, patch);
    return t;
  },
};

// ------------- RUNBOOKS -------------
export const runbookApi = {
  async list(q?: string): Promise<Runbook[]> {
    if (!USE_MOCK) return (await http.get('/runbooks', { params: { q } })).data;
    await delay();
    let rows = [...mock.runbooks];
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter((r) => r.title.toLowerCase().includes(s) || r.content.toLowerCase().includes(s));
    }
    return rows;
  },
  async get(id: string): Promise<Runbook> {
    if (!USE_MOCK) return (await http.get(`/runbooks/${id}`)).data;
    await delay();
    const r = mock.runbooks.find((x) => x.id === id);
    if (!r) throw new Error('Not found');
    return r;
  },
  async create(input: Partial<Runbook>): Promise<Runbook> {
    if (!USE_MOCK) return (await http.post('/runbooks', input)).data;
    await delay();
    const r: Runbook = {
      id: uid('rb'),
      title: input.title || 'Untitled runbook',
      category: input.category || 'General',
      content: input.content || '',
      authorId: mock.users[0].id, authorName: mock.users[0].name,
      updatedAt: new Date().toISOString(), version: 1, tags: input.tags || [],
    };
    mock.runbooks.unshift(r);
    return r;
  },
  async update(id: string, patch: Partial<Runbook>): Promise<Runbook> {
    if (!USE_MOCK) return (await http.patch(`/runbooks/${id}`, patch)).data;
    await delay();
    const r = mock.runbooks.find((x) => x.id === id)!;
    Object.assign(r, patch, { version: r.version + 1, updatedAt: new Date().toISOString() });
    return r;
  },
  async remove(id: string): Promise<{ ok: true }> {
    if (!USE_MOCK) return (await http.delete(`/runbooks/${id}`)).data;
    await delay();
    const idx = mock.runbooks.findIndex((x) => x.id === id);
    if (idx >= 0) mock.runbooks.splice(idx, 1);
    return { ok: true };
  },
};

// ------------- NOTIFICATIONS / AUDIT / ANALYTICS -------------
export const notificationApi = {
  async list(): Promise<Notification[]> {
    if (!USE_MOCK) return (await http.get('/notifications')).data;
    await delay(); return mock.notifications;
  },
  async markRead(id: string): Promise<Notification> {
    if (!USE_MOCK) return (await http.patch(`/notifications/${id}/read`)).data;
    await delay();
    const n = mock.notifications.find((x) => x.id === id)!;
    n.read = true;
    return n;
  },
  async markAllRead(): Promise<{ ok: true }> {
    if (!USE_MOCK) return (await http.post('/notifications/read-all')).data;
    await delay();
    mock.notifications.forEach((n) => (n.read = true));
    return { ok: true };
  },
};

export const auditApi = {
  async list(): Promise<AuditLog[]> {
    if (!USE_MOCK) return (await http.get('/audit-logs')).data;
    await delay(); return mock.auditLogs;
  },
};

export const analyticsApi = {
  async overview(): Promise<AnalyticsPayload> {
    if (!USE_MOCK) return (await http.get('/analytics')).data;
    await delay(); return mock.analytics;
  },
};
