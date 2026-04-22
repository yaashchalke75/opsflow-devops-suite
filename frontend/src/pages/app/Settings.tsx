import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCan } from '@/hooks/useCan';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/store/auth';
import { Avatar } from '@/components/ui/Avatar';
import { ROLE_LABEL } from '@/lib/permissions';
import toast from 'react-hot-toast';
import { Shield, Bell, User, Building2, Key, Sparkles, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

type Section = 'profile' | 'security' | 'notifications' | 'organization';

export default function Settings() {
  const user = useAuth((s) => s.user);
  const isDemo = useAuth((s) => s.isDemo);
  const canManageOrg = useCan('settings:manage');
  const [rawTab, setTab] = useState<Section>('profile');
  // If demo, Security & Organization tabs don't exist — force back to profile.
  const tab: Section =
    isDemo && (rawTab === 'security' || rawTab === 'organization') ? 'profile' : rawTab;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account, security, and workspace preferences." />

      {isDemo && (
        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-brand-500/30 bg-brand-500/10 p-3">
          <Sparkles className="h-4 w-4 text-brand-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="text-fg font-medium">Shared demo account</div>
            <div className="text-fg-muted mt-0.5">
              Account-level settings (password, email, role, sessions, organization) are protected
              so every visitor starts from the same clean state.{' '}
              <Link to="/signup" className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-0.5">
                Create your own account <UserPlus className="h-3 w-3" />
              </Link>{' '}
              to customize these.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <nav className="card p-2 space-y-1 h-max">
          {([
            { v: 'profile', l: 'Profile', i: User },
            // Security & Organization hidden in demo mode (seeded accounts are shared)
            ...(!isDemo ? [{ v: 'security' as const, l: 'Security', i: Shield }] : []),
            { v: 'notifications', l: 'Notifications', i: Bell },
            ...(canManageOrg && !isDemo ? [{ v: 'organization' as const, l: 'Organization', i: Building2 }] : []),
          ] as const).map((s) => (
            <button
              key={s.v}
              onClick={() => setTab(s.v)}
              className={
                'w-full flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm transition ' +
                (tab === s.v ? 'bg-brand-500/10 text-fg border border-brand-500/20' : 'text-fg-muted hover:text-fg hover:bg-bg-hover border border-transparent')
              }
            >
              <s.i className="h-4 w-4" /> {s.l}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {tab === 'profile' && (
            <Card>
              <CardHeader title="Profile" subtitle="Your personal information across OpsFlow" />
              <div className="flex items-center gap-4 mb-5">
                <Avatar name={user?.name || 'U'} color={user?.avatarColor} size="lg" />
                <div>
                  <div className="text-sm font-medium">{user?.name}</div>
                  <div className="text-xs text-fg-muted">{user?.email}</div>
                  <Badge tone="brand" className="mt-1.5">{user?.role && ROLE_LABEL[user.role]}</Badge>
                </div>
                {!isDemo && <Button variant="secondary" size="sm" className="ml-auto">Change avatar</Button>}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isDemo) { toast.error('Profile is read-only in demo mode'); return; }
                  toast.success('Profile saved');
                }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Name" defaultValue={user?.name} disabled={isDemo} />
                  <Input label="Title" defaultValue={user?.title} disabled={isDemo} />
                </div>
                <Input label="Email" type="email" defaultValue={user?.email} disabled={isDemo} />
                {!isDemo && (
                  <div className="flex justify-end"><Button>Save changes</Button></div>
                )}
              </form>
            </Card>
          )}

          {tab === 'security' && (
            <>
              <Card>
                <CardHeader title="Password" subtitle="Used to sign in to OpsFlow" />
                <form onSubmit={(e) => { e.preventDefault(); toast.success('Password updated'); }} className="space-y-3">
                  <Input label="Current password" type="password" />
                  <Input label="New password" type="password" />
                  <Input label="Confirm new password" type="password" />
                  <div className="flex justify-end"><Button icon={<Key className="h-3.5 w-3.5" />}>Update password</Button></div>
                </form>
              </Card>

              <Card>
                <CardHeader title="Two-factor authentication" subtitle="Strongly recommended" action={<Badge tone="warning">Not enabled</Badge>} />
                <Button variant="secondary">Enable 2FA</Button>
              </Card>

              <Card>
                <CardHeader title="Active sessions" />
                {[
                  ['Chrome on macOS', 'San Francisco, CA · current session'],
                  ['iOS App', 'Mumbai, IN · 2 hours ago'],
                ].map(([t, s]) => (
                  <div key={t} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <div>
                      <div className="text-sm">{t}</div>
                      <div className="text-xs text-fg-muted">{s}</div>
                    </div>
                    <Button variant="ghost" size="sm">Revoke</Button>
                  </div>
                ))}
              </Card>
            </>
          )}

          {tab === 'notifications' && (
            <Card>
              <CardHeader title="Notification preferences" />
              {[
                ['Incident assigned to me', true],
                ['Critical alerts firing', true],
                ['Deployment success / failure', true],
                ['Weekly analytics digest', false],
                ['Mentions in comments', true],
              ].map(([label, on]) => (
                <label key={label as string} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div>
                    <div className="text-sm">{label}</div>
                    <div className="text-xs text-fg-muted">In-app and email</div>
                  </div>
                  <input type="checkbox" defaultChecked={on as boolean} className="accent-brand-500 h-4 w-4" />
                </label>
              ))}
            </Card>
          )}

          {tab === 'organization' && (
            <>
              <Card>
                <CardHeader title="Organization" subtitle="Branding and workspace identity" />
                <form onSubmit={(e) => { e.preventDefault(); toast.success('Saved'); }} className="space-y-3">
                  <Input label="Organization name" defaultValue="OpsFlow Inc." />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Slug" defaultValue="opsflow" />
                    <Input label="Primary domain" defaultValue="opsflow.io" />
                  </div>
                  <div className="flex justify-end"><Button>Save</Button></div>
                </form>
              </Card>
              <Card>
                <CardHeader title="Danger zone" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Delete workspace</div>
                    <div className="text-xs text-fg-muted">Permanently delete this workspace and all its data.</div>
                  </div>
                  <Button variant="danger">Delete workspace</Button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
