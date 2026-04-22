import type { Role } from '@/types';

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Engineering Manager',
  devops: 'DevOps Engineer',
  developer: 'Developer',
  viewer: 'Viewer',
};

export type Permission =
  | 'users:manage'
  | 'incidents:manage'
  | 'deployments:manage'
  | 'alerts:manage'
  | 'runbooks:manage'
  | 'settings:manage'
  | 'analytics:view';

const ROLE_PERMS: Record<Role, Permission[]> = {
  super_admin: [
    'users:manage', 'incidents:manage', 'deployments:manage',
    'alerts:manage', 'runbooks:manage', 'settings:manage', 'analytics:view',
  ],
  admin: [
    'users:manage', 'incidents:manage', 'deployments:manage',
    'alerts:manage', 'runbooks:manage', 'settings:manage', 'analytics:view',
  ],
  manager: ['incidents:manage', 'runbooks:manage', 'analytics:view'],
  devops: ['incidents:manage', 'deployments:manage', 'alerts:manage', 'runbooks:manage'],
  developer: ['incidents:manage', 'runbooks:manage'],
  viewer: [],
};

export function can(role: Role | undefined, perm: Permission) {
  if (!role) return false;
  return ROLE_PERMS[role].includes(perm);
}

export function permissionsFor(role: Role | undefined): Permission[] {
  return role ? [...ROLE_PERMS[role]] : [];
}
