import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  BarChart, Bar, Legend,
} from 'recharts';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { TrendingDown, Clock, Activity, Download } from 'lucide-react';

export default function Analytics() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics'], queryFn: analyticsApi.overview });

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Team performance, reliability, and deployment health."
        action={<Button variant="secondary" icon={<Download className="h-3.5 w-3.5" />}>Export CSV</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[108px]" />)
        ) : (
          <>
            <Stat label="MTTR (median)" value={`${data.mttrMinutes}m`} delta={-18} icon={<Clock className="h-4 w-4" />} accent="success" />
            <Stat label="Incident frequency" value={`${data.incidentFrequency.reduce((a, b) => a + b.count, 0)}`} delta={-7} icon={<Activity className="h-4 w-4" />} accent="info" />
            <Stat label="Deployment success" value="94%" delta={3} icon={<TrendingDown className="h-4 w-4" />} accent="success" />
            <Stat label="Failed deploys" value={data.deploymentSuccess.reduce((a, b) => a + b.failed, 0)} delta={-12} icon={<TrendingDown className="h-4 w-4" />} accent="warning" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Incident frequency" subtitle="Weekly open incidents" />
          {isLoading || !data ? <Skeleton className="h-[260px]" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.incidentFrequency}>
                <XAxis dataKey="week" stroke="#6B6F7A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B6F7A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(244,63,94,0.06)' }} />
                <Line type="monotone" dataKey="count" stroke="#F43F5E" strokeWidth={2.5} dot={{ r: 3, fill: '#F43F5E' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="Deployment success" subtitle="Weekly success vs failed" />
          {isLoading || !data ? <Skeleton className="h-[260px]" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.deploymentSuccess}>
                <XAxis dataKey="week" stroke="#6B6F7A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B6F7A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(244,63,94,0.06)' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9094A0' }} />
                <Bar dataKey="success" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="Team workload" subtitle="Open vs resolved per team" />
          {isLoading || !data ? <Skeleton className="h-[260px]" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.teamWorkload} layout="vertical">
                <XAxis type="number" stroke="#6B6F7A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#6B6F7A" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(244,63,94,0.06)' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9094A0' }} />
                <Bar dataKey="open" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                <Bar dataKey="resolved" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <CardHeader title="Top services by incident volume" subtitle="Last 30 days" />
          {isLoading || !data ? <Skeleton className="h-[260px]" /> : (
            <div className="space-y-2.5">
              {data.topServices.map((s) => {
                const max = Math.max(...data.topServices.map((x) => x.incidents));
                const pct = (s.incidents / max) * 100;
                return (
                  <div key={s.service}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-fg-muted">{s.service}</span>
                      <span className="text-fg font-medium">{s.incidents}</span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-elev overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
