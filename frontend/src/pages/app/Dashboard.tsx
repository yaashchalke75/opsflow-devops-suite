import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Stat } from '@/components/ui/Stat';
import { Card, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  AlertOctagon, Bell, Rocket, Users, Activity, Plus, Download,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { formatRelative } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useCan } from '@/hooks/useCan';

const SEV_COLORS = ['#DC2626', '#F59E0B', '#3B82F6', '#6B6F7A'];

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats });
  const canCreateIncident = useCan('incidents:manage');
  const nav = useNavigate();

  return (
    <div>
      <PageHeader
        title="Operations overview"
        subtitle="Real-time signal from incidents, deploys, and monitoring."
        meta={<Badge tone="success" dot>Production healthy</Badge>}
        action={
          <>
            <Button variant="secondary" icon={<Download className="h-3.5 w-3.5" />}>Export</Button>
            {canCreateIncident && (
              <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => nav('/incidents')}>
                New incident
              </Button>
            )}
          </>
        }
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[108px]" />)
        ) : (
          <>
            <Stat
              label="Open incidents"
              value={data.openIncidents}
              delta={data.openIncidentsDelta}
              icon={<AlertOctagon className="h-4 w-4" />}
              accent="danger"
            />
            <Stat
              label="Active alerts"
              value={data.activeAlerts}
              delta={data.activeAlertsDelta}
              icon={<Bell className="h-4 w-4" />}
              accent="warning"
            />
            <Stat
              label="Deployments today"
              value={data.deploymentsToday}
              delta={data.deploymentsDelta}
              icon={<Rocket className="h-4 w-4" />}
              accent="info"
            />
            <Stat
              label="Active engineers"
              value={data.activeEngineers}
              icon={<Users className="h-4 w-4" />}
              accent="success"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Trend chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="14-day operations trend"
            subtitle="Incidents, deployments, and alerts over time"
            action={
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-fg-subtle">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-state-danger" /> Incidents</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-state-info" /> Deploys</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-state-warning" /> Alerts</span>
              </div>
            }
          />
          {isLoading || !data ? <Skeleton className="h-[280px]" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAlr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6B6F7A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B6F7A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#2E3038', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={2} fill="url(#gInc)" />
                <Area type="monotone" dataKey="deployments" stroke="#3B82F6" strokeWidth={2} fill="url(#gDep)" />
                <Area type="monotone" dataKey="alerts" stroke="#F59E0B" strokeWidth={2} fill="url(#gAlr)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Severity mix */}
        <Card>
          <CardHeader title="Incidents by severity" subtitle="Rolling 30 days" />
          {isLoading || !data ? <Skeleton className="h-[280px]" /> : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={data.severityMix}
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.severityMix.map((_, i) => (
                      <Cell key={i} fill={SEV_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {data.severityMix.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: SEV_COLORS[i] }} />
                      <span className="text-fg-muted">{s.name}</span>
                    </div>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Activity feed */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Live activity"
            subtitle="Most recent events across services"
            action={<Link to="/audit" className="text-xs text-brand-400 hover:text-brand-300">View audit log →</Link>}
          />
          <ul className="space-y-1">
            {(data?.activity ?? []).map((a) => (
              <li key={a.id} className="flex items-start gap-3 py-2 border-b border-border last:border-b-0">
                <div className={
                  'mt-1 h-6 w-6 rounded-md grid place-items-center shrink-0 ' +
                  (a.type === 'incident' ? 'bg-state-danger/10 text-state-danger'
                    : a.type === 'deploy' ? 'bg-state-info/10 text-state-info'
                    : a.type === 'alert' ? 'bg-state-warning/10 text-state-warning'
                    : 'bg-brand-500/10 text-brand-400')
                }>
                  <Activity className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-fg">{a.message}</div>
                  <div className="text-xs text-fg-subtle">{formatRelative(a.timestamp)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Health summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Service uptime" subtitle="Last 30 days" />
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                {data?.uptimePct.toFixed(3) ?? '—'}%
              </span>
              <Badge tone="success">99.9 SLA</Badge>
            </div>
            <div className="divider" />
            <div className="grid grid-cols-3 gap-2 text-center">
              {['api-gateway', 'auth-service', 'web-app'].map((s) => (
                <div key={s} className="text-xs">
                  <div className="text-fg-muted truncate">{s}</div>
                  <div className="mt-1 flex justify-center gap-0.5">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <span
                        key={i}
                        className={
                          'h-5 w-1 rounded-sm ' +
                          (Math.random() > 0.94 ? 'bg-state-warning' : 'bg-state-success')
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Mean time to recovery" subtitle="Last 7 days" />
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold tracking-tight">{data?.mttrMinutes ?? '—'}m</span>
              <Badge tone="success">-18%</Badge>
            </div>
            <p className="text-xs text-fg-muted mt-2">
              Trending down — runbook coverage improvements are paying off.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
