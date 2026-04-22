/**
 * Map internal Mongoose docs into the exact shape the frontend `types/index.ts`
 * expects. If you change a document, change its presenter — not call sites.
 */

const AVATAR_COLORS = ['#F43F5E', '#FB7185', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
function avatarColor(seed) {
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function presentUser(u) {
  if (!u) return null;
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    avatarColor: u.avatarColor || avatarColor(u.name),
    initials: u.initials || initialsOf(u.name),
    title: u.title,
    team: u.team,
    status: u.status || 'offline',
    createdAt: u.createdAt?.toISOString?.() || new Date().toISOString(),
  };
}

export function presentIncident(i) {
  return {
    id: i._id.toString(),
    key: i.key,
    title: i.title,
    description: i.description,
    priority: i.priority,
    status: i.status,
    ownerId: i.owner?._id?.toString?.() || i.owner?.toString?.(),
    ownerName: i.ownerName || i.owner?.name,
    service: i.service,
    reporterId: i.reporter?.toString?.(),
    createdAt: i.createdAt?.toISOString?.(),
    updatedAt: i.updatedAt?.toISOString?.(),
    resolvedAt: i.resolvedAt?.toISOString?.(),
    tags: i.tags || [],
    comments: (i.comments || []).map((c) => ({
      id: c._id.toString(),
      authorId: c.authorId?.toString?.(),
      authorName: c.authorName,
      message: c.message,
      createdAt: c.createdAt?.toISOString?.() || new Date().toISOString(),
      type: c.type || 'comment',
    })),
  };
}

export function presentDeployment(d) {
  return {
    id: d._id.toString(),
    version: d.version,
    service: d.service,
    environment: d.environment,
    status: d.status,
    triggeredBy: d.triggeredBy,
    commitSha: d.commitSha,
    commitMessage: d.commitMessage,
    durationSec: d.durationSec,
    createdAt: d.createdAt?.toISOString?.(),
    releaseNotes: d.releaseNotes,
    logs: d.logs || [],
  };
}

export function presentAlert(a) {
  return {
    id: a._id.toString(),
    title: a.title,
    source: a.source,
    severity: a.severity,
    status: a.status,
    message: a.message,
    createdAt: a.createdAt?.toISOString?.(),
    resource: a.resource,
    metricValue: a.metricValue,
  };
}

export function presentTask(t) {
  return {
    id: t._id.toString(),
    title: t.title,
    description: t.description,
    assigneeId: t.assignee?.toString?.(),
    assigneeName: t.assigneeName,
    status: t.status,
    priority: t.priority,
    dueAt: t.dueAt?.toISOString?.(),
    createdAt: t.createdAt?.toISOString?.(),
  };
}

export function presentRunbook(r) {
  return {
    id: r._id.toString(),
    title: r.title,
    category: r.category,
    content: r.content,
    authorId: r.author?.toString?.(),
    authorName: r.authorName,
    updatedAt: r.updatedAt?.toISOString?.(),
    version: r.version,
    tags: r.tags || [],
  };
}

export function presentTeam(t) {
  return {
    id: t._id.toString(),
    name: t.name,
    description: t.description,
    memberCount: t.memberCount,
    lead: t.lead,
    color: t.color,
  };
}

export function presentNotification(n) {
  return {
    id: n._id.toString(),
    type: n.type,
    title: n.title,
    body: n.body,
    read: n.read,
    createdAt: n.createdAt?.toISOString?.(),
    link: n.link,
  };
}

export function presentAuditLog(a) {
  return {
    id: a._id.toString(),
    actorId: a.actor?.toString?.(),
    actorName: a.actorName,
    action: a.action,
    target: a.target,
    createdAt: a.createdAt?.toISOString?.(),
    ip: a.ip,
  };
}
