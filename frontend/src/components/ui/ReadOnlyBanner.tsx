import { Eye } from 'lucide-react';
import { useAuth } from '@/store/auth';

export function ReadOnlyBanner() {
  const role = useAuth((s) => s.user?.role);
  if (role !== 'viewer') return null;
  return (
    <div className="mb-4 flex items-center gap-2.5 px-3 py-2 rounded-lg border border-state-info/30 bg-state-info/10 text-xs">
      <Eye className="h-3.5 w-3.5 text-state-info shrink-0" />
      <span className="text-fg-muted">
        You're signed in as <span className="text-fg font-medium">Viewer</span> — read-only access.
        Contact an admin to request elevated permissions.
      </span>
    </div>
  );
}
