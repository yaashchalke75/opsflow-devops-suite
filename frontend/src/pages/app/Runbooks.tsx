import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { runbookApi } from '@/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { BookOpen, Plus, Clock, Hash, Trash2 } from 'lucide-react';
import { formatRelative } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Runbook } from '@/types';
import { useCan } from '@/hooks/useCan';
import { ReadOnlyBanner } from '@/components/ui/ReadOnlyBanner';

export default function Runbooks() {
  const qc = useQueryClient();
  const canManage = useCan('runbooks:manage');
  const [q, setQ] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { data: runbooks = [] } = useQuery({ queryKey: ['runbooks', q], queryFn: () => runbookApi.list(q) });
  const selected = runbooks.find((r) => r.id === active) ?? runbooks[0];

  const createMut = useMutation({
    mutationFn: runbookApi.create,
    onSuccess: (r) => { toast.success('Runbook created'); setOpen(false); setActive(r.id); qc.invalidateQueries({ queryKey: ['runbooks'] }); },
  });

  const removeMut = useMutation({
    mutationFn: runbookApi.remove,
    onSuccess: () => { toast.success('Runbook deleted'); setActive(null); qc.invalidateQueries({ queryKey: ['runbooks'] }); },
  });

  return (
    <div>
      <PageHeader
        title="Runbooks"
        subtitle="Internal SOPs and incident response knowledge base."
        action={canManage ? <Button icon={<Plus className="h-3.5 w-3.5" />} onClick={() => setOpen(true)}>New runbook</Button> : null}
      />
      <ReadOnlyBanner />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <div>
          <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search runbooks…" className="mb-3" />
          <div className="card p-2 space-y-0.5 max-h-[70vh] overflow-y-auto">
            {runbooks.length === 0 && (
              <EmptyState icon={<BookOpen className="h-5 w-5" />} title="No runbooks" />
            )}
            {runbooks.map((r) => (
              <button
                key={r.id}
                onClick={() => setActive(r.id)}
                className={
                  'w-full text-left rounded-lg px-3 py-2.5 border transition ' +
                  (selected?.id === r.id
                    ? 'bg-brand-500/10 border-brand-500/30'
                    : 'bg-transparent border-transparent hover:bg-bg-hover hover:border-border')
                }
              >
                <div className="text-sm font-medium truncate">{r.title}</div>
                <div className="text-[11px] text-fg-muted mt-0.5 flex items-center gap-2">
                  <Badge tone="neutral">{r.category}</Badge>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatRelative(r.updatedAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6 min-h-[70vh]">
          {selected ? (
            <RunbookView runbook={selected} canManage={canManage} onDelete={() => removeMut.mutate(selected.id)} />
          ) : (
            <EmptyState icon={<BookOpen className="h-5 w-5" />} title="Select a runbook" />
          )}
        </div>
      </div>

      <Modal
        open={open} onClose={() => setOpen(false)} title="New runbook" size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button form="new-rb" type="submit" loading={createMut.isPending}>Publish</Button>
        </>}
      >
        <form
          id="new-rb"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            createMut.mutate({
              title: String(fd.get('title')),
              category: String(fd.get('category')),
              content: String(fd.get('content')),
              tags: String(fd.get('tags')).split(',').map((s) => s.trim()).filter(Boolean),
            });
          }}
          className="space-y-3"
        >
          <Input name="title" label="Title" required />
          <div className="grid grid-cols-2 gap-3">
            <Input name="category" label="Category" required defaultValue="Incident Response" />
            <Input name="tags" label="Tags" placeholder="k8s, release, postgres" />
          </div>
          <Textarea name="content" label="Content (Markdown)" required className="min-h-[260px] font-mono" />
        </form>
      </Modal>
    </div>
  );
}

function RunbookView({ runbook, canManage, onDelete }: { runbook: Runbook; canManage: boolean; onDelete: () => void }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold">{runbook.title}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge tone="brand">{runbook.category}</Badge>
            <Badge tone="neutral">v{runbook.version}</Badge>
            <span className="text-xs text-fg-muted flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated {formatRelative(runbook.updatedAt)} by {runbook.authorName}
            </span>
            {runbook.tags.map((t) => (
              <span key={t} className="chip bg-bg-elev border-border text-fg-muted">
                <Hash className="h-2.5 w-2.5" />{t}
              </span>
            ))}
          </div>
        </div>
        {canManage && (
          <Button variant="danger" size="sm" icon={<Trash2 className="h-3 w-3" />} onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
      <article className="prose-opsflow">
        <Markdown source={runbook.content} />
      </article>
    </div>
  );
}

function Markdown({ source }: { source: string }) {
  // Lightweight renderer for headings / lists / bold / code — no external dep.
  const lines = source.split('\n');
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  const flushList = () => {
    if (listBuf.length) {
      out.push(
        <ul key={out.length} className="list-disc pl-5 my-2 space-y-1 text-sm text-fg-muted">
          {listBuf.map((l, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(l) }} />)}
        </ul>,
      );
      listBuf = [];
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^###?\s/.test(line)) {
      flushList();
      const level = line.startsWith('###') ? 3 : 2;
      const text = line.replace(/^#+\s/, '');
      out.push(level === 3
        ? <h3 key={i} className="text-sm font-semibold mt-5 mb-2">{text}</h3>
        : <h2 key={i} className="text-base font-semibold mt-6 mb-2">{text}</h2>);
    } else if (/^#\s/.test(line)) {
      flushList();
      out.push(<h1 key={i} className="text-xl font-semibold mt-2 mb-3">{line.replace(/^#\s/, '')}</h1>);
    } else if (/^>\s/.test(line)) {
      flushList();
      out.push(<blockquote key={i} className="border-l-2 border-brand-500/60 pl-3 text-sm text-fg-muted my-3 italic">{line.replace(/^>\s/, '')}</blockquote>);
    } else if (/^\d+\.\s/.test(line) || /^-\s/.test(line)) {
      listBuf.push(line.replace(/^(\d+\.|-)\s/, ''));
    } else if (!line.trim()) {
      flushList();
    } else {
      flushList();
      out.push(<p key={i} className="text-sm text-fg-muted my-2 leading-6" dangerouslySetInnerHTML={{ __html: inline(line) }} />);
    }
  }
  flushList();
  return <>{out}</>;
}

function inline(s: string) {
  return s
    .replace(/`([^`]+)`/g, '<code class="font-mono text-[12px] px-1 py-0.5 rounded bg-bg-elev border border-border">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-fg font-semibold">$1</strong>');
}
