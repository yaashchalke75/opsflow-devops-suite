import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

export default function Audit() {
  const { data: logs = [], isLoading } = useQuery({ queryKey: ['audit'], queryFn: auditApi.list });

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Every admin and user action across the workspace."
        action={<Button variant="secondary" icon={<Download className="h-3.5 w-3.5" />}>Export</Button>}
      />

      {isLoading ? <Skeleton className="h-[500px]" /> : (
        <Table>
          <THead>
            <TH>Actor</TH>
            <TH>Action</TH>
            <TH>IP</TH>
            <TH className="text-right">When</TH>
          </THead>
          <TBody>
            {logs.map((l) => (
              <TR key={l.id}>
                <TD>
                  <div className="flex items-center gap-2">
                    <Avatar name={l.actorName} size="sm" />
                    <span className="text-sm">{l.actorName}</span>
                  </div>
                </TD>
                <TD className="text-sm">{l.action}</TD>
                <TD><span className="font-mono text-xs text-fg-muted">{l.ip}</span></TD>
                <TD className="text-right text-xs text-fg-muted">{formatDate(l.createdAt)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
