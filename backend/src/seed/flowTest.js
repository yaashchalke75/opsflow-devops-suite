/**
 * End-to-end flow test. Exercises every role through realistic actions
 * and verifies both success paths and permission rejections.
 *
 * Run: node src/seed/flowTest.js
 */
import 'dotenv/config';

const API = process.env.API_URL || 'http://localhost:4000/api';

const ROLES = [
  ['yash.rao@opsflow.io', 'super_admin'],
  ['elena.marquez@opsflow.io', 'admin'],
  ['daniel.chen@opsflow.io', 'manager'],
  ['priya.shah@opsflow.io', 'devops'],
  ['lina.park@opsflow.io', 'developer'],
  ['tom.becker@opsflow.io', 'viewer'],
];

const tokens = {};
const ids = {};

// ---------- helpers ----------
function color(code, s) { return `\x1b[${code}m${s}\x1b[0m`; }
const green = (s) => color(32, s);
const red = (s) => color(31, s);
const cyan = (s) => color(36, s);
const dim = (s) => color(90, s);
const yellow = (s) => color(33, s);

async function call(method, path, { token, body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  return { status: res.status, body: json, raw: text };
}

function ok(label, res, expectedStatus = [200, 201]) {
  const pass = (Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus]).includes(res.status);
  const tick = pass ? green('✓') : red('✗');
  console.log(`  ${tick} ${label} ${dim(`(${res.status})`)}`);
  if (!pass) console.log(dim('     body: ' + JSON.stringify(res.body).slice(0, 200)));
  return pass;
}

function expectForbidden(label, res) {
  const pass = res.status === 403;
  const tick = pass ? green('✓') : red('✗');
  console.log(`  ${tick} ${label} ${dim(`(${res.status} — expected 403)`)}`);
  return pass;
}

function section(title) {
  console.log('\n' + cyan('━━━ ' + title + ' ━━━'));
}

// ---------- flows ----------
async function loginAll() {
  section('Phase 1 · Authenticate all 6 roles');
  for (const [email, expectedRole] of ROLES) {
    const res = await call('POST', '/auth/login', { body: { email, password: 'demo1234' } });
    if (res.status !== 200) {
      console.log(`  ${red('✗')} ${email} — login failed`);
      process.exit(1);
    }
    tokens[expectedRole] = res.body.token;
    ids[expectedRole] = res.body.user.id;
    const roleMatch = res.body.user.role === expectedRole ? green(expectedRole) : red(res.body.user.role);
    console.log(`  ${green('✓')} ${email.padEnd(32)} → ${roleMatch}`);
  }
}

async function dashboardForAll() {
  section('Phase 2 · Every role loads the dashboard');
  for (const role of Object.keys(tokens)) {
    const res = await call('GET', '/dashboard', { token: tokens[role] });
    ok(`${role.padEnd(12)} reads /dashboard`, res);
  }
}

async function devopsCreatesIncident() {
  section('Phase 3 · DevOps creates a critical incident');
  const owner = ids.devops;
  const res = await call('POST', '/incidents', {
    token: tokens.devops,
    body: {
      title: 'Flow test · payments API returning 500s',
      description: 'Elevated 500 error rate on /checkout. Stripe webhooks delayed.',
      priority: 'critical',
      service: 'billing-service',
      ownerId: owner,
      tags: ['flow-test', 'payments'],
    },
  });
  if (!ok('DevOps creates incident', res)) process.exit(1);
  ids.incident = res.body.id;
  ids.incidentKey = res.body.key;
  console.log(dim(`     → ${res.body.key}: "${res.body.title}"`));
}

async function teamCollaboratesOnIncident() {
  section('Phase 4 · Team collaborates on the incident');

  // Developer posts a comment
  const r1 = await call('POST', `/incidents/${ids.incident}/comments`, {
    token: tokens.developer,
    body: { message: 'Looking at logs now — seeing timeouts calling Stripe.' },
  });
  ok('Developer posts comment', r1);

  // Manager posts a comment
  const r2 = await call('POST', `/incidents/${ids.incident}/comments`, {
    token: tokens.manager,
    body: { message: 'Posting customer-facing status update.' },
  });
  ok('Manager posts comment', r2);

  // DevOps updates status → investigating
  const r3 = await call('PATCH', `/incidents/${ids.incident}`, {
    token: tokens.devops,
    body: { status: 'investigating' },
  });
  ok('DevOps moves status → investigating', r3);

  // Viewer TRIES to update — should be rejected
  const r4 = await call('PATCH', `/incidents/${ids.incident}`, {
    token: tokens.viewer,
    body: { status: 'resolved' },
  });
  expectForbidden('Viewer blocked from updating incident', r4);
}

async function devopsDeploys() {
  section('Phase 5 · DevOps deploys a hotfix');
  const create = await call('POST', '/deployments', {
    token: tokens.devops,
    body: {
      service: 'billing-service',
      version: 'v1.8.4-hotfix',
      environment: 'production',
      commitMessage: 'fix: retry Stripe webhook on 5xx',
      releaseNotes: '• Adds exponential backoff for Stripe calls\n• Increases timeout to 15s',
    },
  });
  if (!ok('DevOps triggers deploy', create)) return;
  ids.deployment = create.body.id;

  const complete = await call('PATCH', `/deployments/${ids.deployment}`, {
    token: tokens.devops,
    body: { status: 'success', durationSec: 142 },
  });
  ok('DevOps marks deploy success', complete);

  // Developer TRIES to deploy — should be rejected
  const rej = await call('POST', '/deployments', {
    token: tokens.developer,
    body: { service: 'x', version: 'v0.0.1', environment: 'production' },
  });
  expectForbidden('Developer blocked from deploying', rej);
}

async function alertsWorkflow() {
  section('Phase 6 · Alerts workflow');
  const list = await call('GET', '/alerts', { token: tokens.devops });
  ok('DevOps lists alerts', list);
  const firing = list.body.find((a) => a.status === 'firing');
  if (firing) {
    const ack = await call('PATCH', `/alerts/${firing.id}`, {
      token: tokens.devops, body: { status: 'acknowledged' },
    });
    ok(`DevOps acknowledges "${firing.title.slice(0, 40)}..."`, ack);

    const res = await call('PATCH', `/alerts/${firing.id}`, {
      token: tokens.devops, body: { status: 'resolved' },
    });
    ok('DevOps resolves alert', res);

    const rej = await call('PATCH', `/alerts/${firing.id}`, {
      token: tokens.viewer, body: { status: 'firing' },
    });
    expectForbidden('Viewer blocked from changing alerts', rej);
  }
}

async function managerViewsAnalytics() {
  section('Phase 7 · Manager views analytics');
  const res = await call('GET', '/analytics', { token: tokens.manager });
  ok('Manager reads /analytics', res);
  if (res.body?.mttrMinutes !== undefined) {
    console.log(dim(`     → MTTR: ${res.body.mttrMinutes}m · Top service: ${res.body.topServices?.[0]?.service}`));
  }

  const rej = await call('GET', '/analytics', { token: tokens.developer });
  expectForbidden('Developer blocked from /analytics', rej);
}

async function runbookLifecycle() {
  section('Phase 8 · Runbook lifecycle');

  const create = await call('POST', '/runbooks', {
    token: tokens.devops,
    body: {
      title: 'Flow test · Handle Stripe webhook retries',
      category: 'Incident Response',
      content: '# Stripe webhook retries\n\n## Symptoms\n- /checkout 500s\n\n## Fix\n1. Check Stripe dashboard\n2. Verify signing secret\n3. Increase timeout',
      tags: ['stripe', 'webhooks'],
    },
  });
  if (!ok('DevOps publishes runbook', create)) return;
  ids.runbook = create.body.id;

  const update = await call('PATCH', `/runbooks/${ids.runbook}`, {
    token: tokens.manager,
    body: { content: create.body.content + '\n\n## Escalation\nPage @payments-team.' },
  });
  ok('Manager updates runbook (version bumps)', update);
  console.log(dim(`     → version now v${update.body?.version}`));

  const rej = await call('DELETE', `/runbooks/${ids.runbook}`, { token: tokens.viewer });
  expectForbidden('Viewer blocked from deleting runbook', rej);
}

async function adminManagesUsers() {
  section('Phase 9 · Admin manages users');

  const list = await call('GET', '/users', { token: tokens.admin });
  ok('Admin lists users', list);

  const jordan = list.body.find((u) => u.email === 'jordan.reed@opsflow.io');
  if (jordan) {
    const promote = await call('PATCH', `/users/${jordan.id}`, {
      token: tokens.admin,
      body: { title: 'Senior Frontend Engineer' },
    });
    ok('Admin updates user title', promote);
  }

  // Developer tries to change someone else's role
  const target = list.body.find((u) => u.role === 'viewer');
  if (target) {
    const rej = await call('PATCH', `/users/${target.id}`, {
      token: tokens.developer,
      body: { role: 'admin' },
    });
    expectForbidden('Developer blocked from changing roles', rej);
  }
}

async function resolveTheIncident() {
  section('Phase 10 · Resolve the incident');
  const res = await call('PATCH', `/incidents/${ids.incident}`, {
    token: tokens.devops,
    body: { status: 'resolved' },
  });
  ok('DevOps resolves incident', res);

  const get = await call('GET', `/incidents/${ids.incident}`, { token: tokens.admin });
  ok('Admin reads resolved incident', get);
  console.log(dim(`     → resolvedAt: ${get.body.resolvedAt}`));
  console.log(dim(`     → timeline: ${get.body.comments.length} comments`));
}

async function auditTrail() {
  section('Phase 11 · Audit trail');
  const res = await call('GET', '/audit-logs', { token: tokens.admin });
  ok('Admin reads audit log', res);
  if (Array.isArray(res.body)) {
    console.log(dim(`     → ${res.body.length} entries in log`));
    const recent = res.body.slice(0, 5);
    recent.forEach((e) => console.log(dim(`       · ${e.actorName.padEnd(18)} ${e.action.slice(0, 70)}`)));
  }

  const rej = await call('GET', '/audit-logs', { token: tokens.developer });
  expectForbidden('Developer blocked from audit log', rej);
}

async function finalSummary() {
  section('Final state snapshot');
  const token = tokens.admin;
  const [d, inc, dep, alr, usr] = await Promise.all([
    call('GET', '/dashboard', { token }),
    call('GET', '/incidents', { token }),
    call('GET', '/deployments', { token }),
    call('GET', '/alerts', { token }),
    call('GET', '/users', { token }),
  ]);
  console.log(`  ${yellow('Open incidents   :')} ${d.body.openIncidents}`);
  console.log(`  ${yellow('Active alerts    :')} ${d.body.activeAlerts}`);
  console.log(`  ${yellow('Deploys today    :')} ${d.body.deploymentsToday}`);
  console.log(`  ${yellow('Uptime           :')} ${d.body.uptimePct}%`);
  console.log(`  ${yellow('MTTR             :')} ${d.body.mttrMinutes}m`);
  console.log(`  ${yellow('Incidents total  :')} ${inc.body.length}`);
  console.log(`  ${yellow('Deployments total:')} ${dep.body.length}`);
  console.log(`  ${yellow('Alerts total     :')} ${alr.body.length}`);
  console.log(`  ${yellow('Users            :')} ${usr.body.length}`);
}

// ---------- run ----------
(async () => {
  console.log(cyan('\n╔════════════════════════════════════════════════════╗'));
  console.log(cyan('║      OpsFlow · End-to-end flow test (all roles)    ║'));
  console.log(cyan('╚════════════════════════════════════════════════════╝'));
  try {
    await loginAll();
    await dashboardForAll();
    await devopsCreatesIncident();
    await teamCollaboratesOnIncident();
    await devopsDeploys();
    await alertsWorkflow();
    await managerViewsAnalytics();
    await runbookLifecycle();
    await adminManagesUsers();
    await resolveTheIncident();
    await auditTrail();
    await finalSummary();
    console.log('\n' + green('✓ Flow test complete. All phases executed.\n'));
    process.exit(0);
  } catch (err) {
    console.error(red('\nFlow test crashed:'), err);
    process.exit(1);
  }
})();
