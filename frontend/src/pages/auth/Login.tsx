import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { authApi } from '@/api';
import { useAuth } from '@/store/auth';
import toast from 'react-hot-toast';
import { Github, ArrowRight, Lock, Info, Mail, UserPlus, Sparkles, ChevronDown } from 'lucide-react';

export default function Login() {
  const nav = useNavigate();
  const setSession = useAuth((s) => s.setSession);
  const [email, setEmail] = useState('elena.marquez@opsflow.io');
  const [password, setPassword] = useState('demo1234');
  const [err, setErr] = useState<string | null>(null);
  const [ssoProvider, setSsoProvider] = useState<'GitHub' | 'Google' | null>(null);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);

  const demoAs = async (role: string) => {
    setDemoLoading(role); setErr(null); setRolePickerOpen(false);
    try {
      const { user, token } = await authApi.demo(role);
      setSession(user, token, { demo: true });
      toast.success(`Signed in as ${user.name} · ${role.replace('_', ' ')}`);
      nav('/dashboard');
    } catch (e: any) {
      setErr(e?.response?.data?.error || e?.message || 'Demo login unavailable');
    } finally {
      setDemoLoading(null);
    }
  };
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const { user, token } = await authApi.login(email, password);
      setSession(user, token);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      nav('/dashboard');
    } catch (e: any) {
      setErr(e?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Sign in to OpsFlow</h1>
      <p className="text-sm text-fg-muted mt-1.5">Welcome back — let's keep production healthy.</p>

      {/* One-click demo access */}
      <div className="mt-5 flex items-stretch gap-2">
        <Button
          type="button"
          onClick={() => demoAs('super_admin')}
          loading={demoLoading === 'super_admin'}
          icon={<Sparkles className="h-3.5 w-3.5" />}
          className="flex-1"
        >
          Try live demo
        </Button>
        <div className="relative">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setRolePickerOpen((o) => !o)}
            icon={<ChevronDown className="h-3.5 w-3.5" />}
            aria-label="Pick demo role"
          />
          {rolePickerOpen && (
            <div className="absolute right-0 top-11 w-56 bg-bg-card border border-border rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] p-1 z-[60] animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-fg-subtle font-semibold">
                Enter demo as
              </div>
              {[
                { role: 'super_admin', label: 'Super Admin' },
                { role: 'admin', label: 'Admin' },
                { role: 'manager', label: 'Engineering Manager' },
                { role: 'devops', label: 'DevOps Engineer' },
                { role: 'developer', label: 'Developer' },
                { role: 'viewer', label: 'Viewer' },
              ].map((r) => (
                <button
                  key={r.role}
                  onClick={() => demoAs(r.role)}
                  disabled={!!demoLoading}
                  className="w-full text-left px-3 py-1.5 text-xs text-fg-muted hover:text-fg hover:bg-bg-hover rounded-md transition-colors disabled:opacity-50"
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-fg-subtle">
        <span className="flex-1 h-px bg-border" /> or sign in with email <span className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-3.5">
        <Input
          label="Work email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-fg-muted cursor-pointer select-none">
            <input type="checkbox" className="accent-brand-500" defaultChecked /> Remember me
          </label>
          <Link to="/forgot" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</Link>
        </div>
        {err && <div className="text-xs text-state-danger bg-state-danger/10 border border-state-danger/30 rounded-md px-3 py-2">{err}</div>}
        <Button type="submit" loading={loading} className="w-full" icon={<Lock className="h-3.5 w-3.5" />}>
          Sign in to dashboard
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-fg-subtle">
        <span className="flex-1 h-px bg-border" /> or continue with <span className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" type="button" icon={<Github className="h-3.5 w-3.5" />} onClick={() => setSsoProvider('GitHub')}>
          GitHub
        </Button>
        <Button variant="secondary" type="button" icon={<GoogleIcon />} onClick={() => setSsoProvider('Google')}>
          Google
        </Button>
      </div>

      <p className="text-xs text-fg-muted mt-7 text-center">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brand-400 hover:text-brand-300 inline-flex items-center gap-0.5">
          Create one <ArrowRight className="h-3 w-3" />
        </Link>
      </p>

      <Modal
        open={!!ssoProvider}
        onClose={() => setSsoProvider(null)}
        title={`${ssoProvider ?? ''} sign-in coming soon`}
        description="Single sign-on isn't enabled on this workspace yet."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSsoProvider(null)}>
              Close
            </Button>
            <Button
              onClick={() => { setSsoProvider(null); nav('/signup'); }}
              icon={<UserPlus className="h-3.5 w-3.5" />}
            >
              Create an account instead
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 rounded-lg border border-state-info/30 bg-state-info/10 p-3">
            <Info className="h-4 w-4 text-state-info shrink-0 mt-0.5" />
            <div className="text-xs text-fg-muted leading-relaxed">
              <span className="text-fg font-medium">{ssoProvider} OAuth is not yet integrated</span> for this
              environment. Your workspace admin can enable it once the {ssoProvider} app is registered and
              client credentials are configured.
            </div>
          </div>

          <div className="text-xs font-semibold text-fg-muted uppercase tracking-wider pt-2">
            In the meantime, you can:
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-bg-soft p-3">
              <div className="h-7 w-7 rounded-md grid place-items-center bg-brand-500/10 text-brand-400 shrink-0">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Sign in with email & password</div>
                <div className="text-xs text-fg-muted">Use the form above with your workspace credentials.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-bg-soft p-3">
              <div className="h-7 w-7 rounded-md grid place-items-center bg-state-info/10 text-state-info shrink-0">
                <UserPlus className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Create a new account</div>
                <div className="text-xs text-fg-muted">New to OpsFlow? Sign up in under a minute.</div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-bg-soft p-3">
              <div className="h-7 w-7 rounded-md grid place-items-center bg-state-warning/10 text-state-warning shrink-0">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">Contact your admin</div>
                <div className="text-xs text-fg-muted">
                  Reach out at <span className="text-fg font-mono">admin@opsflow.io</span> to request {ssoProvider} SSO.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* Google "G" — colored for brand accuracy even in dark mode */
function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083 43.595 20 42 20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
