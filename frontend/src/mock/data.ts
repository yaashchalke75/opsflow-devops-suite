import type {
  User, Team, Incident, Deployment, Alert, Task, Runbook,
  Notification, AuditLog, DashboardStats, AnalyticsPayload,
} from '@/types';
import { avatarColor, initialsOf, uid } from '@/lib/utils';

const now = Date.now();
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

const mk = (name: string, role: User['role'], title: string, team: string): User => ({
  id: uid('usr'),
  name,
  email: name.toLowerCase().replace(/\s+/g, '.') + '@opsflow.io',
  role,
  avatarColor: avatarColor(name),
  initials: initialsOf(name),
  title,
  team,
  status: (['online', 'away', 'offline'] as const)[Math.floor(Math.random() * 3)],
  createdAt: iso(1000 * 60 * 60 * 24 * 90),
});

export const users: User[] = [
  { ...mk('Yash Chalke', 'super_admin', 'Founder / Platform Lead', 'Platform'), status: 'online' },
  mk('Elena Marquez', 'admin', 'Head of Engineering', 'Platform'),
  mk('Daniel Chen', 'manager', 'SRE Manager', 'Infrastructure'),
  mk('Priya Shah', 'devops', 'Senior DevOps Engineer', 'Infrastructure'),
  mk('Marcus Okafor', 'devops', 'DevOps Engineer', 'Platform'),
  mk('Lina Park', 'developer', 'Backend Engineer', 'API'),
  mk('Jordan Reed', 'developer', 'Frontend Engineer', 'Web'),
  mk('Sana Qureshi', 'developer', 'Backend Engineer', 'Payments'),
  mk('Tom Becker', 'viewer', 'Product Manager', 'Product'),
  mk('Aisha Rahman', 'manager', 'Engineering Manager', 'API'),
];

export const teams: Team[] = [
  { id: uid('team'), name: 'Platform', description: 'Core platform & tooling', memberCount: 4, lead: users[1].name, color: '#F43F5E' },
  { id: uid('team'), name: 'Infrastructure', description: 'Cloud, Kubernetes, networking', memberCount: 3, lead: users[2].name, color: '#3B82F6' },
  { id: uid('team'), name: 'API', description: 'Public & internal APIs', memberCount: 3, lead: users[9].name, color: '#10B981' },
  { id: uid('team'), name: 'Web', description: 'Customer-facing web apps', memberCount: 2, lead: users[6].name, color: '#8B5CF6' },
  { id: uid('team'), name: 'Payments', description: 'Billing & checkout', memberCount: 2, lead: users[7].name, color: '#F59E0B' },
];

const services = ['api-gateway', 'auth-service', 'billing-service', 'web-app', 'ingest-worker', 'notifications-svc', 'search-index'];

const incidentSeeds = [
  { title: 'API latency spike on /checkout endpoint', priority: 'critical' as const, status: 'investigating' as const, tags: ['latency', 'checkout'] },
  { title: 'Intermittent 502 from auth-service behind load balancer', priority: 'high' as const, status: 'monitoring' as const, tags: ['auth', 'lb'] },
  { title: 'Stripe webhook retries failing for EU customers', priority: 'high' as const, status: 'open' as const, tags: ['stripe', 'eu'] },
  { title: 'Search index rebuild stuck at 78%', priority: 'medium' as const, status: 'investigating' as const, tags: ['search'] },
  { title: 'Datadog agent disconnected from ingest-03 node', priority: 'low' as const, status: 'resolved' as const, tags: ['monitoring'] },
  { title: 'Postgres replica lag exceeded 30s', priority: 'high' as const, status: 'resolved' as const, tags: ['postgres', 'replication'] },
  { title: 'CDN cache purge failing for marketing assets', priority: 'low' as const, status: 'monitoring' as const, tags: ['cdn'] },
  { title: 'Redis memory nearing 90% on prod-cache-2', priority: 'medium' as const, status: 'open' as const, tags: ['redis', 'memory'] },
  { title: 'SSL cert for api.opsflow.io expiring in 7 days', priority: 'medium' as const, status: 'open' as const, tags: ['ssl'] },
  { title: 'Login success rate dropped 4% in last hour', priority: 'critical' as const, status: 'investigating' as const, tags: ['auth', 'metrics'] },
  { title: 'Background job queue backlog > 10k tasks', priority: 'high' as const, status: 'resolved' as const, tags: ['queue'] },
  { title: 'Canary deployment of v2.14.0 showing elevated 5xx', priority: 'high' as const, status: 'resolved' as const, tags: ['release'] },
];

export const incidents: Incident[] = incidentSeeds.map((s, i) => {
  const owner = users[(i % (users.length - 1)) + 1];
  const createdAt = iso(1000 * 60 * (30 + i * 120));
  const resolved = s.status === 'resolved';
  return {
    id: uid('inc'),
    key: `INC-${1042 + i}`,
    title: s.title,
    description:
      'Our monitoring detected abnormal behavior. Engineers have been paged. Investigation ongoing — see timeline for updates.',
    priority: s.priority,
    status: s.status,
    ownerId: owner.id,
    ownerName: owner.name,
    service: services[i % services.length],
    reporterId: users[0].id,
    createdAt,
    updatedAt: iso(1000 * 60 * (10 + i * 20)),
    resolvedAt: resolved ? iso(1000 * 60 * (5 + i * 10)) : undefined,
    tags: s.tags,
    comments: [
      {
        id: uid('cmt'), authorId: owner.id, authorName: owner.name,
        message: 'Picked this up — checking dashboards.', createdAt: iso(1000 * 60 * (25 + i * 120)),
        type: 'comment',
      },
      {
        id: uid('cmt'), authorId: users[3].id, authorName: users[3].name,
        message: 'Rolled traffic to healthy replicas. Monitoring error rate.',
        createdAt: iso(1000 * 60 * (15 + i * 90)),
        type: 'comment',
      },
    ],
  };
});

const deploymentSeeds = [
  { v: 'v2.14.1', svc: 'api-gateway', env: 'production', status: 'success' },
  { v: 'v2.14.0', svc: 'api-gateway', env: 'production', status: 'rolled_back' },
  { v: 'v1.8.3', svc: 'billing-service', env: 'staging', status: 'in_progress' },
  { v: 'v3.2.0', svc: 'web-app', env: 'production', status: 'success' },
  { v: 'v3.1.9', svc: 'web-app', env: 'production', status: 'failed' },
  { v: 'v0.9.2', svc: 'ingest-worker', env: 'dev', status: 'success' },
  { v: 'v4.0.1', svc: 'auth-service', env: 'production', status: 'success' },
  { v: 'v4.0.0', svc: 'auth-service', env: 'staging', status: 'success' },
  { v: 'v1.3.0', svc: 'notifications-svc', env: 'production', status: 'success' },
  { v: 'v1.2.8', svc: 'notifications-svc', env: 'production', status: 'failed' },
  { v: 'v2.0.0', svc: 'search-index', env: 'staging', status: 'in_progress' },
  { v: 'v1.1.0', svc: 'search-index', env: 'production', status: 'success' },
];

export const deployments: Deployment[] = deploymentSeeds.map((s, i) => ({
  id: uid('dep'),
  version: s.v,
  service: s.svc,
  environment: s.env as Deployment['environment'],
  status: s.status as Deployment['status'],
  triggeredBy: users[(i % 6) + 1].name,
  commitSha: Math.random().toString(16).slice(2, 10),
  commitMessage: ['fix: retry logic for webhook delivery', 'feat: rate limit per org', 'chore: bump deps', 'perf: reduce JSON payload size', 'fix: null user agent crash'][i % 5],
  durationSec: 60 + Math.floor(Math.random() * 300),
  createdAt: iso(1000 * 60 * (20 + i * 180)),
  releaseNotes: '• Performance improvements\n• Bug fixes\n• Updated observability hooks',
  logs: [
    '[00:00] Build started',
    '[00:12] Dependencies resolved',
    '[00:45] Tests passed (1,204 suites)',
    '[01:20] Docker image pushed',
    '[01:55] Rolling update on prod cluster',
    s.status === 'success' ? '[02:30] Deployment complete — healthy' :
    s.status === 'failed' ? '[02:15] Health check failed — aborting' :
    '[02:10] Rolling 30% of pods...',
  ],
}));

const alertSeeds = [
  { title: 'CPU usage > 92% on prod-api-07', source: 'Datadog', severity: 'critical', status: 'firing', resource: 'prod-api-07', metric: '94%' },
  { title: 'Memory usage > 85% on cache-2', source: 'Prometheus', severity: 'major', status: 'acknowledged', resource: 'cache-2', metric: '87%' },
  { title: 'PostgreSQL connections exhausted', source: 'Datadog', severity: 'critical', status: 'firing', resource: 'db-primary', metric: '500/500' },
  { title: 'Disk usage > 80% on ingest-03', source: 'Grafana', severity: 'warning', status: 'firing', resource: 'ingest-03', metric: '82%' },
  { title: '5xx error rate > 2% on /api/v1/orders', source: 'Sentry', severity: 'major', status: 'resolved', resource: 'api-gateway', metric: '2.4%' },
  { title: 'Redis evictions spike', source: 'Prometheus', severity: 'warning', status: 'muted', resource: 'cache-1', metric: '1.2k/s' },
  { title: 'SSL certificate expiring in 7 days', source: 'Cert-manager', severity: 'warning', status: 'acknowledged', resource: 'api.opsflow.io', metric: '7d' },
  { title: 'Kafka consumer lag > 50k', source: 'Kafka Exporter', severity: 'major', status: 'firing', resource: 'events-topic', metric: '62k' },
  { title: 'Failed login attempts spike', source: 'SIEM', severity: 'critical', status: 'firing', resource: 'auth-service', metric: '12k/min' },
  { title: 'S3 bucket replication lag', source: 'CloudWatch', severity: 'warning', status: 'resolved', resource: 'assets-bucket', metric: '4min' },
];

export const alerts: Alert[] = alertSeeds.map((a, i) => ({
  id: uid('alr'),
  title: a.title,
  source: a.source,
  severity: a.severity as Alert['severity'],
  status: a.status as Alert['status'],
  message: 'Threshold exceeded. Review the linked dashboard for context.',
  createdAt: iso(1000 * 60 * (5 + i * 45)),
  resource: a.resource,
  metricValue: a.metric,
}));

export const tasks: Task[] = [
  { id: uid('tsk'), title: 'Rotate production database credentials', assigneeId: users[3].id, assigneeName: users[3].name, status: 'in_progress', priority: 'high', dueAt: iso(-1000 * 60 * 60 * 24), createdAt: iso(1000 * 60 * 60 * 24 * 2) },
  { id: uid('tsk'), title: 'Upgrade Kubernetes cluster to 1.30', assigneeId: users[4].id, assigneeName: users[4].name, status: 'todo', priority: 'high', dueAt: iso(-1000 * 60 * 60 * 24 * 7), createdAt: iso(1000 * 60 * 60 * 24 * 3) },
  { id: uid('tsk'), title: 'Document on-call escalation policy', assigneeId: users[2].id, assigneeName: users[2].name, status: 'review', priority: 'medium', dueAt: iso(-1000 * 60 * 60 * 48), createdAt: iso(1000 * 60 * 60 * 24 * 4) },
  { id: uid('tsk'), title: 'Add tracing to billing-service', assigneeId: users[7].id, assigneeName: users[7].name, status: 'todo', priority: 'medium', createdAt: iso(1000 * 60 * 60 * 24 * 5) },
  { id: uid('tsk'), title: 'Fix flaky integration tests', assigneeId: users[5].id, assigneeName: users[5].name, status: 'done', priority: 'low', createdAt: iso(1000 * 60 * 60 * 24 * 6) },
  { id: uid('tsk'), title: 'Migrate alerts to new notifier', assigneeId: users[3].id, assigneeName: users[3].name, status: 'in_progress', priority: 'medium', createdAt: iso(1000 * 60 * 60 * 24 * 7) },
];

export const runbooks: Runbook[] = [
  {
    id: uid('rb'), title: 'Restart a Kubernetes node safely', category: 'Kubernetes',
    content: `# Restart a Kubernetes node safely\n\n> Use this when a node shows degraded health or needs a kernel reboot.\n\n## Prerequisites\n- kubectl context set to the target cluster\n- PagerDuty acknowledgement\n\n## Steps\n1. **Cordon** the node so no new pods schedule: \`kubectl cordon <node>\`\n2. **Drain** workloads gracefully: \`kubectl drain <node> --ignore-daemonsets --delete-emptydir-data\`\n3. SSH and reboot: \`sudo systemctl reboot\`\n4. After node returns: \`kubectl uncordon <node>\`\n5. Verify: \`kubectl get nodes\` — status should be Ready\n\n## Rollback\nIf the node does not return within 10 minutes, escalate to Infra on-call.`,
    authorId: users[2].id, authorName: users[2].name,
    updatedAt: iso(1000 * 60 * 60 * 48), version: 4, tags: ['k8s', 'ops'],
  },
  {
    id: uid('rb'), title: 'Rollback a production release', category: 'Deployments',
    content: `# Rollback a production release\n\n## When to rollback\n- Error rate > 2% sustained for 5+ minutes\n- Customer-impacting regression confirmed\n\n## Steps\n1. Open the Deployment Center and locate the release.\n2. Click **Rollback** — this targets the last known healthy version.\n3. Confirm dashboards return to baseline within 10 minutes.\n4. Open an incident and link the rollback.`,
    authorId: users[3].id, authorName: users[3].name,
    updatedAt: iso(1000 * 60 * 60 * 24 * 5), version: 2, tags: ['release'],
  },
  {
    id: uid('rb'), title: 'Postgres replica lag troubleshooting', category: 'Databases',
    content: `# Postgres replica lag\n\n## Symptoms\n- \`pg_stat_replication\` shows lag > 30s\n- Read replica returning stale data\n\n## Investigate\n1. Check WAL sender / receiver processes.\n2. Inspect network throughput between primary and replica.\n3. Look for long-running queries on primary.\n\n## Common causes\n- Network saturation\n- Disk I/O contention\n- Schema migration holding locks`,
    authorId: users[5].id, authorName: users[5].name,
    updatedAt: iso(1000 * 60 * 60 * 24 * 9), version: 1, tags: ['postgres'],
  },
  {
    id: uid('rb'), title: 'Incident commander checklist', category: 'Incident Response',
    content: `# Incident commander checklist\n\n## First 5 minutes\n- Confirm impact scope\n- Page additional responders if user-facing\n- Start a #inc-<id> channel\n\n## First 15 minutes\n- Assign roles: IC, comms, scribe\n- Post customer-facing status if SLA triggered\n\n## Resolution\n- Post a public postmortem within 5 business days\n- File action items in the Team Workspace`,
    authorId: users[1].id, authorName: users[1].name,
    updatedAt: iso(1000 * 60 * 60 * 24 * 2), version: 6, tags: ['ir', 'process'],
  },
];

export const notifications: Notification[] = [
  { id: uid('ntf'), type: 'incident_assigned', title: 'New incident assigned', body: 'INC-1044 assigned to you', read: false, createdAt: iso(1000 * 60 * 3), link: '/incidents' },
  { id: uid('ntf'), type: 'alert_fired', title: 'Critical alert firing', body: 'PostgreSQL connections exhausted', read: false, createdAt: iso(1000 * 60 * 12), link: '/alerts' },
  { id: uid('ntf'), type: 'deployment_done', title: 'Deployment completed', body: 'web-app v3.2.0 deployed to production', read: true, createdAt: iso(1000 * 60 * 45), link: '/deployments' },
  { id: uid('ntf'), type: 'task_due', title: 'Task due tomorrow', body: 'Rotate production database credentials', read: true, createdAt: iso(1000 * 60 * 60 * 5), link: '/team' },
  { id: uid('ntf'), type: 'mention', title: 'You were mentioned', body: 'Priya mentioned you in INC-1045', read: true, createdAt: iso(1000 * 60 * 60 * 22), link: '/incidents' },
];

export const auditLogs: AuditLog[] = Array.from({ length: 14 }).map((_, i) => {
  const u = users[(i % (users.length - 1)) + 1];
  const actions = [
    'Updated incident INC-1042 status to investigating',
    'Created deployment web-app v3.2.0',
    'Acknowledged alert "CPU usage > 92%"',
    'Changed role of Lina Park to developer',
    'Published runbook "Rollback a production release"',
    'Resolved incident INC-1046',
  ];
  return {
    id: uid('aud'),
    actorId: u.id, actorName: u.name,
    action: actions[i % actions.length],
    target: 'system',
    createdAt: iso(1000 * 60 * (10 + i * 20)),
    ip: `10.0.${i}.${42 + i}`,
  };
});

export const dashboard: DashboardStats = {
  openIncidents: incidents.filter((i) => i.status !== 'resolved').length,
  openIncidentsDelta: -12,
  activeAlerts: alerts.filter((a) => a.status === 'firing').length,
  activeAlertsDelta: 24,
  deploymentsToday: 7,
  deploymentsDelta: 16,
  activeEngineers: users.filter((u) => u.status === 'online').length + 3,
  uptimePct: 99.982,
  mttrMinutes: 42,
  trend: Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(now - (13 - i) * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    incidents: Math.floor(2 + Math.random() * 6),
    deployments: Math.floor(3 + Math.random() * 9),
    alerts: Math.floor(4 + Math.random() * 12),
  })),
  severityMix: [
    { name: 'Critical', value: 3 },
    { name: 'High', value: 7 },
    { name: 'Medium', value: 11 },
    { name: 'Low', value: 6 },
  ],
  activity: [
    { id: uid('a'), type: 'incident', message: 'Priya Shah updated INC-1042 to investigating', timestamp: iso(1000 * 60 * 2) },
    { id: uid('a'), type: 'deploy', message: 'Marcus Okafor deployed api-gateway v2.14.1 to production', timestamp: iso(1000 * 60 * 9) },
    { id: uid('a'), type: 'alert', message: 'Datadog fired "CPU usage > 92%" on prod-api-07', timestamp: iso(1000 * 60 * 14) },
    { id: uid('a'), type: 'runbook', message: 'Elena Marquez updated runbook "Incident commander checklist"', timestamp: iso(1000 * 60 * 27) },
    { id: uid('a'), type: 'incident', message: 'Daniel Chen resolved INC-1041', timestamp: iso(1000 * 60 * 48) },
    { id: uid('a'), type: 'deploy', message: 'Rollback executed on api-gateway v2.14.0', timestamp: iso(1000 * 60 * 75) },
    { id: uid('a'), type: 'alert', message: 'Alert "S3 replication lag" auto-resolved', timestamp: iso(1000 * 60 * 118) },
  ],
};

export const analytics: AnalyticsPayload = {
  mttrMinutes: 42,
  incidentFrequency: Array.from({ length: 8 }).map((_, i) => ({
    week: `W${i + 1}`, count: Math.floor(6 + Math.random() * 14),
  })),
  deploymentSuccess: Array.from({ length: 8 }).map((_, i) => ({
    week: `W${i + 1}`,
    success: Math.floor(14 + Math.random() * 18),
    failed: Math.floor(1 + Math.random() * 4),
  })),
  teamWorkload: teams.slice(0, 5).map((t) => ({
    name: t.name,
    open: Math.floor(2 + Math.random() * 8),
    resolved: Math.floor(10 + Math.random() * 20),
  })),
  topServices: services.slice(0, 6).map((s) => ({
    service: s, incidents: Math.floor(3 + Math.random() * 14),
  })),
};
