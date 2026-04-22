import { useAuth } from '@/store/auth';
import { can, type Permission } from '@/lib/permissions';

/** `const canEdit = useCan('incidents:manage');` — reactive to role changes. */
export function useCan(perm: Permission) {
  const role = useAuth((s) => s.user?.role);
  return can(role, perm);
}
