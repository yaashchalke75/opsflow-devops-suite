import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { Incident } from '../models/Incident.js';
import { Deployment } from '../models/Deployment.js';
import { Alert } from '../models/Alert.js';
import { Task } from '../models/Task.js';
import { Runbook } from '../models/Runbook.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';

const AVATAR_COLORS = ['#F43F5E', '#FB7185', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];
const iniOf = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const hash = (pw) => bcrypt.hashSync(pw, 10);
const now = Date.now();
const iso = (msAgo) => new Date(now - msAgo);

(async () => {
  try {
    await connectDB();
    console.log('[seed] wiping collections…');
    await Promise.all([
      User.deleteMany({}), Team.deleteMany({}), Incident.deleteMany({}),
      Deployment.deleteMany({}), Alert.deleteMany({}), Task.deleteMany({}),
      Runbook.deleteMany({}), Notification.deleteMany({}), AuditLog.deleteMany({}),
    ]);

    console.log('[seed] creating users…');
    const userDefs = [
      ['Yash Chalke', 'super_admin', 'Founder / Platform Lead', 'Platform', 'online'],
      ['Elena Marquez', 'admin', 'Head of Engineering', 'Platform', 'online'],
      ['Daniel Chen', 'manager', 'SRE Manager', 'Infrastructure', 'online'],
      ['Priya Shah', 'devops', 'Senior DevOps Engineer', 'Infrastructure', 'online'],
      ['Marcus Okafor', 'devops', 'DevOps Engineer', 'Platform', 'away'],
      ['Lina Park', 'developer', 'Backend Engineer', 'API', 'online'],
      ['Jordan Reed', 'developer', 'Frontend Engineer', 'Web', 'offline'],
      ['Sana Qureshi', 'developer', 'Backend Engineer', 'Payments', 'online'],
      ['Tom Becker', 'viewer', 'Product Manager', 'Product', 'away'],
      ['Aisha Rahman', 'manager', 'Engineering Manager', 'API', 'online'],
    ];
    const users = await User.insertMany(userDefs.map(([name, role, title, team, status], i) => ({
      name,
      email: name.toLowerCase().replace(/\s+/g, '.') + '@opsflow.io',
      passwordHash: hash('demo1234'),
      role, title, team, status,
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      initials: iniOf(name),
      isDemo: true,
    })));

    console.log('[seed] creating teams…');
    await Team.insertMany([
      { name: 'Platform', description: 'Core platform & tooling', memberCount: 4, lead: 'Elena Marquez', color: '#F43F5E' },
      { name: 'Infrastructure', description: 'Cloud, Kubernetes, networking', memberCount: 3, lead: 'Daniel Chen', color: '#3B82F6' },
      { name: 'API', description: 'Public & internal APIs', memberCount: 3, lead: 'Aisha Rahman', color: '#10B981' },
      { name: 'Web', description: 'Customer-facing web apps', memberCount: 2, lead: 'Jordan Reed', color: '#8B5CF6' },
      { name: 'Payments', description: 'Billing & checkout', memberCount: 2, lead: 'Sana Qureshi', color: '#F59E0B' },
    ]);

    console.log('[seed] creating incidents…');
    const services = ['api-gateway', 'auth-service', 'billing-service', 'web-app', 'ingest-worker', 'notifications-svc', 'search-index'];
    const incSeeds = [
      ['API latency spike on /checkout endpoint', 'critical', 'investigating', ['latency', 'checkout']],
      ['Intermittent 502 from auth-service', 'high', 'monitoring', ['auth', 'lb']],
      ['Stripe webhook retries failing for EU customers', 'high', 'open', ['stripe', 'eu']],
      ['Search index rebuild stuck at 78%', 'medium', 'investigating', ['search']],
      ['Datadog agent disconnected from ingest-03 node', 'low', 'resolved', ['monitoring']],
      ['Postgres replica lag exceeded 30s', 'high', 'resolved', ['postgres', 'replication']],
      ['CDN cache purge failing for marketing assets', 'low', 'monitoring', ['cdn']],
      ['Redis memory nearing 90% on prod-cache-2', 'medium', 'open', ['redis', 'memory']],
      ['SSL cert for api.opsflow.io expiring in 7 days', 'medium', 'open', ['ssl']],
      ['Login success rate dropped 4%', 'critical', 'investigating', ['auth']],
      ['Background job queue backlog > 10k tasks', 'high', 'resolved', ['queue']],
      ['Canary of v2.14.0 showing elevated 5xx', 'high', 'resolved', ['release']],
    ];
    for (let i = 0; i < incSeeds.length; i++) {
      const [title, priority, status, tags] = incSeeds[i];
      const owner = users[(i % (users.length - 1)) + 1];
      const createdAt = iso(1000 * 60 * (30 + i * 120));
      const resolvedAt = status === 'resolved'
        ? new Date(createdAt.getTime() + (20 + (i * 3)) * 60 * 1000)
        : undefined;
      const doc = await Incident.create({
        key: `INC-${1042 + i}`,
        title,
        description: 'Monitoring detected abnormal behavior. Engineers paged — see timeline.',
        priority, status, service: services[i % services.length],
        owner: owner._id, ownerName: owner.name,
        reporter: users[0]._id,
        tags,
        comments: [
          { authorId: owner._id, authorName: owner.name, message: 'Picked this up — checking dashboards.', type: 'comment' },
          { authorId: users[3]._id, authorName: users[3].name, message: 'Rolled traffic to healthy replicas.', type: 'comment' },
        ],
        resolvedAt,
      });
      // Backdate timestamps via the raw collection (bypasses Mongoose auto-stamping).
      await Incident.collection.updateOne(
        { _id: doc._id },
        { $set: { createdAt, updatedAt: createdAt } },
      );
    }

    console.log('[seed] creating deployments…');
    const depSeeds = [
      ['v2.14.1', 'api-gateway', 'production', 'success'],
      ['v2.14.0', 'api-gateway', 'production', 'rolled_back'],
      ['v1.8.3', 'billing-service', 'staging', 'in_progress'],
      ['v3.2.0', 'web-app', 'production', 'success'],
      ['v3.1.9', 'web-app', 'production', 'failed'],
      ['v0.9.2', 'ingest-worker', 'dev', 'success'],
      ['v4.0.1', 'auth-service', 'production', 'success'],
      ['v4.0.0', 'auth-service', 'staging', 'success'],
      ['v1.3.0', 'notifications-svc', 'production', 'success'],
      ['v1.2.8', 'notifications-svc', 'production', 'failed'],
      ['v2.0.0', 'search-index', 'staging', 'in_progress'],
      ['v1.1.0', 'search-index', 'production', 'success'],
    ];
    for (let i = 0; i < depSeeds.length; i++) {
      const [version, service, environment, status] = depSeeds[i];
      await Deployment.create({
        version, service, environment, status,
        triggeredBy: users[(i % 6) + 1].name,
        commitSha: Math.random().toString(16).slice(2, 10),
        commitMessage: ['fix: retry logic', 'feat: rate limit per org', 'chore: bump deps', 'perf: smaller payload'][i % 4],
        durationSec: 60 + Math.floor(Math.random() * 300),
        releaseNotes: '• Performance improvements\n• Bug fixes\n• Observability',
        logs: [
          '[00:00] Build started', '[00:12] Dependencies resolved',
          '[00:45] Tests passed', '[01:20] Image pushed',
          status === 'success' ? '[02:30] Deploy complete' :
          status === 'failed' ? '[02:15] Health check failed' : '[02:10] Rolling 30% of pods',
        ],
      });
    }

    console.log('[seed] creating alerts…');
    const alrSeeds = [
      ['CPU usage > 92% on prod-api-07', 'Datadog', 'critical', 'firing', 'prod-api-07', '94%'],
      ['Memory usage > 85% on cache-2', 'Prometheus', 'major', 'acknowledged', 'cache-2', '87%'],
      ['PostgreSQL connections exhausted', 'Datadog', 'critical', 'firing', 'db-primary', '500/500'],
      ['Disk usage > 80% on ingest-03', 'Grafana', 'warning', 'firing', 'ingest-03', '82%'],
      ['5xx error rate > 2% on /api/v1/orders', 'Sentry', 'major', 'resolved', 'api-gateway', '2.4%'],
      ['Redis evictions spike', 'Prometheus', 'warning', 'muted', 'cache-1', '1.2k/s'],
      ['SSL certificate expiring in 7 days', 'Cert-manager', 'warning', 'acknowledged', 'api.opsflow.io', '7d'],
      ['Kafka consumer lag > 50k', 'Kafka Exporter', 'major', 'firing', 'events-topic', '62k'],
      ['Failed login attempts spike', 'SIEM', 'critical', 'firing', 'auth-service', '12k/min'],
      ['S3 bucket replication lag', 'CloudWatch', 'warning', 'resolved', 'assets-bucket', '4min'],
    ];
    await Alert.insertMany(alrSeeds.map(([title, source, severity, status, resource, metricValue]) => ({
      title, source, severity, status, resource, metricValue,
      message: 'Threshold exceeded. Review the linked dashboard for context.',
    })));

    console.log('[seed] creating tasks…');
    await Task.insertMany([
      { title: 'Rotate production database credentials', assignee: users[3]._id, assigneeName: users[3].name, status: 'in_progress', priority: 'high', dueAt: iso(-1000 * 60 * 60 * 24) },
      { title: 'Upgrade Kubernetes cluster to 1.30', assignee: users[4]._id, assigneeName: users[4].name, status: 'todo', priority: 'high' },
      { title: 'Document on-call escalation policy', assignee: users[2]._id, assigneeName: users[2].name, status: 'review', priority: 'medium' },
      { title: 'Add tracing to billing-service', assignee: users[7]._id, assigneeName: users[7].name, status: 'todo', priority: 'medium' },
      { title: 'Fix flaky integration tests', assignee: users[5]._id, assigneeName: users[5].name, status: 'done', priority: 'low' },
      { title: 'Migrate alerts to new notifier', assignee: users[3]._id, assigneeName: users[3].name, status: 'in_progress', priority: 'medium' },
    ]);

    console.log('[seed] creating runbooks…');
    await Runbook.insertMany([
      {
        title: 'Restart a Kubernetes node safely',
        category: 'Kubernetes',
        content: `# Restart a Kubernetes node safely\n\n## Steps\n1. Cordon: \`kubectl cordon <node>\`\n2. Drain: \`kubectl drain <node> --ignore-daemonsets\`\n3. Reboot the node\n4. Uncordon: \`kubectl uncordon <node>\``,
        author: users[2]._id, authorName: users[2].name, tags: ['k8s'], version: 4,
      },
      {
        title: 'Rollback a production release',
        category: 'Deployments',
        content: `# Rollback a production release\n\n## When\n- Error rate > 2% for 5+ minutes\n\n## How\n1. Open Deployment Center\n2. Click Rollback`,
        author: users[3]._id, authorName: users[3].name, tags: ['release'], version: 2,
      },
      {
        title: 'Postgres replica lag troubleshooting',
        category: 'Databases',
        content: `# Postgres replica lag\n\nCheck \`pg_stat_replication\`, inspect network & I/O.`,
        author: users[5]._id, authorName: users[5].name, tags: ['postgres'], version: 1,
      },
      {
        title: 'Incident commander checklist',
        category: 'Incident Response',
        content: `# Incident commander checklist\n\n## First 5 minutes\n- Confirm impact\n- Page responders\n- Open #inc-<id>`,
        author: users[1]._id, authorName: users[1].name, tags: ['ir'], version: 6,
      },
    ]);

    console.log('[seed] creating notifications…');
    await Notification.insertMany([
      { user: users[0]._id, type: 'incident_assigned', title: 'New incident assigned', body: 'INC-1044 assigned to you', link: '/incidents' },
      { user: users[0]._id, type: 'alert_fired', title: 'Critical alert firing', body: 'PostgreSQL connections exhausted', link: '/alerts' },
      { user: users[0]._id, type: 'deployment_done', title: 'Deployment completed', body: 'web-app v3.2.0 deployed to production', read: true, link: '/deployments' },
      { user: users[1]._id, type: 'task_due', title: 'Task due tomorrow', body: 'Rotate production database credentials', read: true, link: '/team' },
    ]);

    console.log('[seed] creating audit logs…');
    const actionBank = [
      'Updated incident INC-1042', 'Created deployment web-app v3.2.0',
      'Acknowledged alert CPU high', 'Changed role of Lina Park to developer',
      'Published runbook Rollback a production release', 'Resolved incident INC-1046',
    ];
    for (let i = 0; i < 14; i++) {
      const u = users[(i % (users.length - 1)) + 1];
      await AuditLog.create({
        actor: u._id, actorName: u.name,
        action: actionBank[i % actionBank.length],
        ip: `10.0.${i}.${42 + i}`,
      });
    }

    console.log('\n[seed] done.');
    console.log('\nDemo accounts (password: demo1234):');
    for (const u of userDefs) console.log(`  · ${u[1].padEnd(12)} ${u[0].padEnd(18)} ${u[0].toLowerCase().replace(/\s+/g, '.')}@opsflow.io`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[seed] failed:', err);
    process.exit(1);
  }
})();
