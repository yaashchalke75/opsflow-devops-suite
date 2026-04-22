import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertOctagon, CheckCircle2, GitCommit, Rocket, Server, Zap, Bell, TrendingUp,
} from 'lucide-react';

/**
 * Ambient animated showcase for the auth page. All data is fake and
 * cycles on timers — purely decorative.
 */
export function LiveShowcase() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Ambient grid + glow */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full bg-brand-500/15 blur-[120px]" />
      <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-brand-700/10 blur-[100px]" />

      {/* Floating orbs */}
      <FloatingOrbs />

      {/* Main stacked cards */}
      <div className="relative h-full flex flex-col justify-center px-10 py-12 gap-4">
        <LiveHeader />
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3"><ServiceHealthCard /></div>
          <div className="col-span-2"><MetricSparklineCard /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AlertsTicker />
          <DeploymentStream />
        </div>
        <StatsRow />
      </div>
    </div>
  );
}

/* ───────── header ───────── */
function LiveHeader() {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/30 rounded-full px-2.5 py-1 mb-4"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse-dot" />
        Live · 240+ engineering orgs
      </motion.div>
      <h2 className="text-2xl font-semibold leading-tight">
        Ship fast. Respond faster.{' '}
        <span className="text-brand-400">One platform for your DevOps loop.</span>
      </h2>
    </div>
  );
}

/* ───────── service health with rotating status ───────── */
const SERVICES = [
  { name: 'api-gateway', status: 'healthy' as const },
  { name: 'auth-service', status: 'healthy' as const },
  { name: 'billing-service', status: 'degraded' as const },
  { name: 'web-app', status: 'healthy' as const },
  { name: 'search-index', status: 'healthy' as const },
];

function ServiceHealthCard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="card p-4 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-fg">
          <Server className="h-3.5 w-3.5 text-brand-400" />
          Service health
        </div>
        <span className="text-[10px] text-fg-subtle font-mono">realtime</span>
      </div>
      <div className="space-y-2">
        {SERVICES.map((svc, i) => (
          <div key={svc.name} className="flex items-center gap-2 text-xs">
            <motion.span
              animate={svc.status === 'degraded'
                ? { backgroundColor: ['#F59E0B', '#FB7185', '#F59E0B'] }
                : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={
                'h-1.5 w-1.5 rounded-full ' +
                (svc.status === 'healthy' ? 'bg-state-success' : 'bg-state-warning')
              }
            />
            <span className="font-mono text-fg-muted flex-1">{svc.name}</span>
            <div className="flex gap-[2px]">
              {Array.from({ length: 20 }).map((_, j) => {
                const isBad = svc.status === 'degraded' && [7, 12, 13].includes(j);
                const isPending = j === 19 - (tick % 3);
                return (
                  <motion.span
                    key={j}
                    initial={{ scaleY: 0.5 }}
                    animate={{ scaleY: isPending ? [0.4, 1, 0.7] : 1 }}
                    transition={{ duration: 1 }}
                    className={
                      'h-4 w-[3px] rounded-sm origin-bottom ' +
                      (isBad ? 'bg-state-warning/80' : 'bg-state-success/70')
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ───────── animated sparkline ───────── */
function MetricSparklineCard() {
  const [points, setPoints] = useState<number[]>(() =>
    Array.from({ length: 24 }).map(() => 30 + Math.random() * 40),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setPoints((p) => [...p.slice(1), 30 + Math.random() * 40]);
    }, 900);
    return () => clearInterval(id);
  }, []);

  const max = 80;
  const step = 100 / (points.length - 1);
  const path =
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${100 - (p / max) * 100}`).join(' ');
  const area = `${path} L 100 100 L 0 100 Z`;
  const latest = points[points.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="card p-4 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Activity className="h-3.5 w-3.5 text-state-info" />
          Req / sec
        </div>
        <TrendingUp className="h-3 w-3 text-state-success" />
      </div>
      <div className="text-xl font-semibold tabular-nums mb-2">
        {Math.round(latest * 42).toLocaleString()}
      </div>
      <div className="h-16">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            key={path}
            d={area}
            fill="url(#spark)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            key={`line-${path}`}
            d={path}
            fill="none"
            stroke="#F43F5E"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

/* ───────── alerts ticker ───────── */
const ALERT_POOL = [
  { severity: 'warning', source: 'Datadog', msg: 'CPU > 80% on api-07' },
  { severity: 'critical', source: 'Sentry', msg: '5xx spike on /checkout' },
  { severity: 'warning', source: 'Grafana', msg: 'Disk 82% on ingest-03' },
  { severity: 'major', source: 'Prometheus', msg: 'Redis evictions spike' },
  { severity: 'warning', source: 'Cert-manager', msg: 'SSL expiring in 7d' },
  { severity: 'critical', source: 'Datadog', msg: 'DB connections exhausted' },
];

function AlertsTicker() {
  const [items, setItems] = useState(() => ALERT_POOL.slice(0, 3).map((a, i) => ({ ...a, id: Date.now() + i })));

  useEffect(() => {
    const id = setInterval(() => {
      const next = ALERT_POOL[Math.floor(Math.random() * ALERT_POOL.length)];
      setItems((cur) => [{ ...next, id: Date.now() }, ...cur].slice(0, 3));
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="card p-4 h-[168px] overflow-hidden"
    >
      <div className="flex items-center gap-2 text-xs font-semibold mb-3">
        <Bell className="h-3.5 w-3.5 text-state-warning" />
        Live alerts
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((a) => {
            const tone =
              a.severity === 'critical' ? 'bg-state-critical/15 border-state-critical/40 text-state-critical'
              : a.severity === 'major' ? 'bg-state-danger/10 border-state-danger/30 text-state-danger'
              : 'bg-state-warning/10 border-state-warning/30 text-state-warning';
            return (
              <motion.div
                layout
                key={a.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="flex items-center gap-2 text-[11px]"
              >
                <span className={`chip border ${tone} shrink-0`}>
                  <AlertOctagon className="h-2.5 w-2.5" />
                  {a.severity}
                </span>
                <span className="text-fg truncate flex-1">{a.msg}</span>
                <span className="text-[10px] text-fg-subtle font-mono">{a.source}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ───────── deployments stream ───────── */
const DEPLOY_POOL = [
  { svc: 'api-gateway', v: 'v2.14.1', env: 'prod', status: 'ok' },
  { svc: 'web-app', v: 'v3.2.0', env: 'prod', status: 'ok' },
  { svc: 'billing-service', v: 'v1.8.5', env: 'staging', status: 'in_progress' },
  { svc: 'auth-service', v: 'v4.0.1', env: 'prod', status: 'ok' },
  { svc: 'search-index', v: 'v2.0.0', env: 'staging', status: 'in_progress' },
  { svc: 'notifications-svc', v: 'v1.3.1', env: 'prod', status: 'ok' },
];

function DeploymentStream() {
  const [items, setItems] = useState(() => DEPLOY_POOL.slice(0, 3).map((d, i) => ({ ...d, id: Date.now() + i })));

  useEffect(() => {
    const id = setInterval(() => {
      const next = DEPLOY_POOL[Math.floor(Math.random() * DEPLOY_POOL.length)];
      setItems((cur) => [{ ...next, id: Date.now() }, ...cur].slice(0, 3));
    }, 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5 }}
      className="card p-4 h-[168px] overflow-hidden"
    >
      <div className="flex items-center gap-2 text-xs font-semibold mb-3">
        <Rocket className="h-3.5 w-3.5 text-state-info" />
        Deployments
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((d) => (
            <motion.div
              layout
              key={d.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="flex items-center gap-2 text-[11px]"
            >
              <span className={
                'h-1.5 w-1.5 rounded-full shrink-0 ' +
                (d.status === 'ok'
                  ? 'bg-state-success'
                  : 'bg-state-info animate-pulse-dot')
              } />
              <span className="font-mono text-fg-muted truncate flex-1">{d.svc}</span>
              <span className="font-mono text-fg">{d.v}</span>
              <span className={
                'chip text-[9px] shrink-0 ' +
                (d.env === 'prod' ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' : 'bg-bg-elev border-border text-fg-muted')
              }>
                {d.env}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ───────── stats row ───────── */
function StatsRow() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="grid grid-cols-4 gap-3"
    >
      {[
        { label: 'Uptime SLA', value: '99.98%', icon: CheckCircle2, tone: 'text-state-success' },
        { label: 'Median MTTR', value: '42m', icon: Zap, tone: 'text-brand-400' },
        { label: 'Deploys / wk', value: '127', icon: GitCommit, tone: 'text-state-info' },
        { label: 'Engineers', value: '240+', icon: Activity, tone: 'text-state-warning' },
      ].map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 + i * 0.05 }}
          className="card p-3"
        >
          <div className="flex items-center justify-between">
            <s.icon className={`h-3.5 w-3.5 ${s.tone}`} />
          </div>
          <div className="text-lg font-semibold mt-1">{s.value}</div>
          <div className="text-[10px] text-fg-subtle uppercase tracking-wider">{s.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ───────── floating decorative orbs ───────── */
function FloatingOrbs() {
  return (
    <>
      <motion.div
        className="absolute top-20 right-10 h-2 w-2 rounded-full bg-brand-500"
        animate={{ y: [0, -18, 0], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 left-12 h-1.5 w-1.5 rounded-full bg-state-info"
        animate={{ y: [0, 14, 0], opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-32 right-24 h-1.5 w-1.5 rounded-full bg-state-success"
        animate={{ y: [0, -12, 0], opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </>
  );
}
