import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  AlertOctagon, Rocket, Bell, Users, BookOpen, BarChart3,
  ShieldCheck, Zap, Activity, Clock, GitCommit, Server,
  ArrowRight, Sparkles, Github, Check, Terminal,
  Lock, Database, Code2, Globe, Cpu,
} from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { useRef } from 'react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg text-fg overflow-x-hidden">
      <LandingNav />
      <Hero />
      <Marquee />
      <Features />
      <Workflow />
      <Stats />
      <TechStack />
      <CTA />
      <Footer />
    </div>
  );
}

/* ─────────────────────────── NAV ─────────────────────────── */
function LandingNav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <a href="#features" className="text-fg-muted hover:text-fg transition-colors">Features</a>
          <a href="#workflow" className="text-fg-muted hover:text-fg transition-colors">Workflow</a>
          <a href="#stack" className="text-fg-muted hover:text-fg transition-colors">Stack</a>
          <a
            href="https://github.com/yaashchalke75/opsflow-devops-suite"
            target="_blank" rel="noopener noreferrer"
            className="text-fg-muted hover:text-fg transition-colors inline-flex items-center gap-1.5"
          >
            <Github className="h-3.5 w-3.5" /> Source
          </a>
        </nav>
        <Link to="/login">
          <Button size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>
            <span className="hidden sm:inline">Sign in / Try demo</span>
            <span className="sm:hidden">Sign in</span>
          </Button>
        </Link>
      </div>
    </motion.header>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative pt-16 md:pt-24 pb-20 md:pb-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-brand-700/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        style={{ y, opacity }}
        className="relative max-w-7xl mx-auto px-4 md:px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/30 rounded-full px-3 py-1.5 mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse-dot" />
          Live · Built end-to-end · Production deployed
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          The control room for{' '}
          <span className="bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 bg-clip-text text-transparent">
            modern DevOps teams.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-xl text-fg-muted max-w-2xl mx-auto mb-9 leading-relaxed"
        >
          Incidents, deployments, alerts, runbooks — connected to the people who own them.
          One platform that replaces the patchwork of PagerDuty + Linear + Confluence + Datadog.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" icon={<Sparkles className="h-4 w-4" />} className="w-full sm:w-auto px-6">
              Try the live demo
            </Button>
          </Link>
          <a
            href="https://github.com/yaashchalke75/opsflow-devops-suite"
            target="_blank" rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button size="lg" variant="secondary" icon={<Github className="h-4 w-4" />} className="w-full sm:w-auto px-6">
              View on GitHub
            </Button>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 text-xs text-fg-subtle"
        >
          No signup needed · One click logs you in as super admin
        </motion.p>
      </motion.div>

      {/* Floating preview card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative max-w-5xl mx-auto px-4 md:px-6 mt-14 md:mt-20"
      >
        <DashboardPreview />
      </motion.div>
    </section>
  );
}

/* Mock dashboard preview that shows under the hero */
function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border border-border bg-bg-card overflow-hidden shadow-[0_50px_100px_-20px_rgba(244,63,94,0.25)]">
      <div className="absolute -inset-x-20 -top-10 h-20 bg-gradient-to-b from-brand-500/30 to-transparent blur-2xl pointer-events-none" />
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-soft">
        <span className="h-2.5 w-2.5 rounded-full bg-state-danger/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-state-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-state-success/70" />
        <div className="ml-4 text-[11px] font-mono text-fg-subtle truncate">opsflow.io/dashboard</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 md:p-6">
        {[
          { label: 'Open incidents', value: '8', icon: AlertOctagon, color: 'text-state-danger bg-state-danger/10' },
          { label: 'Active alerts', value: '5', icon: Bell, color: 'text-state-warning bg-state-warning/10' },
          { label: 'Deploys today', value: '12', icon: Rocket, color: 'text-state-info bg-state-info/10' },
          { label: 'Uptime', value: '99.9%', icon: ShieldCheck, color: 'text-state-success bg-state-success/10' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i }}
            className="p-3 md:p-4 rounded-lg border border-border bg-bg-soft/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-fg-subtle">{s.label}</div>
                <div className="text-xl md:text-2xl font-semibold mt-1 tabular-nums">{s.value}</div>
              </div>
              <div className={`h-7 w-7 md:h-8 md:w-8 rounded-md grid place-items-center ${s.color}`}>
                <s.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="px-4 md:px-6 pb-4 md:pb-6 grid grid-cols-3 gap-3">
        <div className="col-span-2 h-32 rounded-lg border border-border bg-bg-soft/50 relative overflow-hidden">
          <div className="absolute inset-0 flex items-end px-3 pb-3 gap-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${20 + Math.random() * 70}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i, duration: 0.6 }}
                className="flex-1 rounded-sm bg-gradient-to-t from-brand-600 to-brand-400 opacity-80"
              />
            ))}
          </div>
        </div>
        <div className="h-32 rounded-lg border border-border bg-bg-soft/50 p-3 flex flex-col gap-1.5">
          {[
            { label: 'INC-1054', tone: 'text-state-danger' },
            { label: 'INC-1053', tone: 'text-state-warning' },
            { label: 'INC-1052', tone: 'text-state-success' },
          ].map((i, idx) => (
            <motion.div
              key={i.label}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx }}
              className="flex items-center gap-2 text-[10px]"
            >
              <span className={`h-1.5 w-1.5 rounded-full bg-current ${i.tone}`} />
              <span className="font-mono text-fg-muted">{i.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── MARQUEE ─────────────────────────── */
function Marquee() {
  const items = [
    'React 18', 'TypeScript', 'Node.js', 'Express', 'MongoDB Atlas',
    'Tailwind CSS', 'Vercel', 'Render', 'JWT', 'Recharts', 'Framer Motion',
    'Mongoose', 'TanStack Query', 'Zustand', 'Vite',
  ];
  return (
    <section className="py-12 border-y border-border/50 overflow-hidden">
      <p className="text-center text-xs uppercase tracking-widest text-fg-subtle mb-6">
        Built with modern, production-ready technology
      </p>
      <div className="relative">
        <div className="flex gap-12 animate-marquee">
          {[...items, ...items].map((tech, i) => (
            <span key={i} className="text-sm font-medium text-fg-muted whitespace-nowrap">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── FEATURES ─────────────────────────── */
const FEATURES = [
  { icon: AlertOctagon, title: 'Incident Management', desc: 'Triage outages collaboratively. Priorities, statuses, owners, and a live timeline of every comment and update.', color: 'from-state-danger to-state-warning' },
  { icon: Rocket, title: 'Deployment Center', desc: 'Track every release across dev, staging, production. One-click rollback when something breaks.', color: 'from-state-info to-brand-500' },
  { icon: Bell, title: 'Alerts Hub', desc: 'Aggregate signals from Datadog, Sentry, Prometheus. Acknowledge, mute, or resolve from one place.', color: 'from-state-warning to-brand-500' },
  { icon: BookOpen, title: 'Runbooks', desc: 'Markdown knowledge base for SOPs. Searchable, versioned, organized by category and tags.', color: 'from-brand-400 to-brand-600' },
  { icon: Users, title: 'Team Workspace', desc: 'Members, roles, tasks. Six-tier RBAC enforced on both the UI and the API. Real audit trail.', color: 'from-brand-500 to-brand-700' },
  { icon: BarChart3, title: 'Analytics', desc: 'MTTR trends, incident frequency, deploy success rate, top noisy services. Data-driven ops.', color: 'from-state-info to-state-success' },
];

function Features() {
  return (
    <section id="features" className="relative py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="What's inside"
          title="One platform. Every workflow."
          subtitle="Ten production-ready modules that cover the full DevOps loop — from incident triage to release tracking to team coordination."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12 md:mt-16">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="group relative card p-6 transition-colors hover:border-border-strong overflow-hidden"
            >
              <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
              <div className={`relative h-10 w-10 rounded-lg grid place-items-center bg-gradient-to-br ${f.color} text-white mb-4 shadow-lg`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── WORKFLOW ─────────────────────────── */
function Workflow() {
  const steps = [
    { icon: Bell, title: 'Alert fires', desc: 'Datadog detects a 5xx spike on the payments service. It pushes to OpsFlow.' },
    { icon: AlertOctagon, title: 'Incident opens', desc: 'On-call DevOps acknowledges, opens INC-1054, sets priority to critical.' },
    { icon: Users, title: 'Team coordinates', desc: 'Developer comments findings. Manager handles customer comms. Timeline tracked.' },
    { icon: BookOpen, title: 'Runbook executed', desc: 'Stripe-timeout runbook pulled up. Steps followed. Hotfix prepared.' },
    { icon: Rocket, title: 'Deploy + rollback ready', desc: 'v1.8.5-hotfix pushed to production. Status: success. Rollback one click away.' },
    { icon: BarChart3, title: 'Metrics update', desc: 'MTTR drops, deployment success rate refreshes, audit trail records every action.' },
  ];

  return (
    <section id="workflow" className="relative py-20 md:py-32 bg-bg-soft/30 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="How it works"
          title="From alert to resolution, end to end."
          subtitle="A real production incident, handled the OpsFlow way. Every step recorded, every owner accountable."
        />

        <div className="mt-12 md:mt-16 relative">
          {/* Vertical line on mobile, horizontal connector on desktop */}
          <div className="hidden md:block absolute top-12 left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-700/20 border border-brand-500/40 grid place-items-center text-brand-400 backdrop-blur-sm">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-bg-card border border-border grid place-items-center text-[10px] font-mono font-semibold text-fg-muted">
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1">{s.title}</h3>
                    <p className="text-xs text-fg-muted leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── STATS ─────────────────────────── */
function Stats() {
  const stats = [
    { value: '10', label: 'Production modules', icon: Code2 },
    { value: '6', label: 'RBAC roles enforced', icon: Lock },
    { value: '11', label: 'Mongoose collections', icon: Database },
    { value: '40+', label: 'API endpoints', icon: Terminal },
    { value: '99.9%', label: 'Frontend uptime', icon: Globe },
    { value: '<300ms', label: 'p50 response', icon: Zap },
  ];

  return (
    <section className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="By the numbers"
          title="Production, not prototype."
          subtitle="Real schema, real auth, real CI/CD. Hosted on Vercel + Render + MongoDB Atlas with custom CORS, JWT, rate limiting."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mt-10 md:mt-12">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card p-4 md:p-5 text-center"
            >
              <s.icon className="h-4 w-4 text-brand-400 mx-auto mb-2" />
              <div className="text-xl md:text-2xl font-bold tracking-tight">{s.value}</div>
              <div className="text-[10px] md:text-xs uppercase tracking-wider text-fg-subtle mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── TECH STACK ─────────────────────────── */
function TechStack() {
  const groups = [
    {
      title: 'Frontend',
      icon: Code2,
      items: [
        'React 18 + TypeScript',
        'Vite (instant HMR)',
        'Tailwind CSS — custom dark theme',
        'TanStack Query for server state',
        'Zustand for client state',
        'React Router (SPA routing)',
        'Recharts (custom dark tooltips)',
        'Framer Motion (this very animation)',
        'Lucide icon system',
      ],
    },
    {
      title: 'Backend',
      icon: Server,
      items: [
        'Node.js + Express',
        'Mongoose ODM',
        'JWT auth with bcrypt hashing',
        'Zod request validation',
        'Helmet · CORS · rate limiting',
        '6-role RBAC middleware',
        'Audit log for every action',
        'Presenter layer (DB → API shape)',
        'Seed scripts for demo data',
      ],
    },
    {
      title: 'Infrastructure',
      icon: Cpu,
      items: [
        'MongoDB Atlas (cloud)',
        'Vercel (frontend) — auto-deploy',
        'Render (backend) — auto-deploy',
        'UptimeRobot monitoring',
        'GitHub-based CI/CD',
        'Production CORS lockdown',
        '.env separation per environment',
        'Recruiter-proof demo mode',
        'Zero-downtime deploys',
      ],
    },
  ];

  return (
    <section id="stack" className="py-20 md:py-32 relative bg-bg-soft/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <SectionHeader
          eyebrow="The stack"
          title="Modern. Typed. Production-ready."
          subtitle="Every layer chosen for real-world reliability — same kind of decisions you'd make at a venture-backed startup."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 md:mt-16">
          {groups.map((g, i) => (
            <motion.div
              key={g.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 hover:border-border-strong transition-colors"
            >
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
                <div className="h-9 w-9 rounded-lg bg-brand-500/10 border border-brand-500/30 grid place-items-center text-brand-400">
                  <g.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide">{g.title}</h3>
              </div>
              <ul className="space-y-2">
                {g.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-fg-muted">
                    <Check className="h-3.5 w-3.5 text-brand-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── CTA ─────────────────────────── */
function CTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-3xl mx-auto px-4 md:px-6 text-center"
      >
        <Sparkles className="h-10 w-10 text-brand-400 mx-auto mb-6" />
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
          Try the live demo right now.
        </h2>
        <p className="text-base md:text-lg text-fg-muted mb-9 leading-relaxed">
          One click. No signup. You'll be logged in as super admin with a full workspace —
          incidents, deployments, alerts, runbooks, analytics. Browse everything.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" icon={<ArrowRight className="h-4 w-4" />} className="w-full sm:w-auto px-7">
              Launch demo
            </Button>
          </Link>
          <a
            href="https://github.com/yaashchalke75/opsflow-devops-suite"
            target="_blank" rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button size="lg" variant="secondary" icon={<Github className="h-4 w-4" />} className="w-full sm:w-auto px-7">
              Read the code
            </Button>
          </a>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────── FOOTER ─────────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-fg-subtle">
          <Logo />
        </div>
        <div className="flex items-center gap-4 text-xs text-fg-subtle">
          <span>© {new Date().getFullYear()} OpsFlow</span>
          <span>·</span>
          <a
            href="https://github.com/yaashchalke75/opsflow-devops-suite"
            target="_blank" rel="noopener noreferrer"
            className="hover:text-fg transition-colors inline-flex items-center gap-1"
          >
            <Github className="h-3 w-3" /> GitHub
          </a>
          <span>·</span>
          <a className="hover:text-fg transition-colors inline-flex items-center gap-1">
            <Activity className="h-3 w-3" /> Status
          </a>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> Built end-to-end
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────── HELPERS ─────────────────────────── */
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-brand-400 bg-brand-500/10 border border-brand-500/30 rounded-full px-2.5 py-1 mb-4"
      >
        <GitCommit className="h-2.5 w-2.5" />
        {eyebrow}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="text-sm md:text-base text-fg-muted leading-relaxed"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
