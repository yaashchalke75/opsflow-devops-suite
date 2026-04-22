import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/api';
import { useAuth } from '@/store/auth';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export default function Signup() {
  const nav = useNavigate();
  const setSession = useAuth((s) => s.setSession);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const { user, token } = await authApi.signup(form);
      setSession(user, token);
      toast.success('Account created');
      nav('/dashboard');
    } catch (e: any) {
      setErr(e?.message || 'Unable to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Create your workspace</h1>
      <p className="text-sm text-fg-muted mt-1.5">Start collaborating with your ops team in minutes.</p>

      <form onSubmit={submit} className="mt-7 space-y-3.5">
        <Input label="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
        <Input label="Work email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" />
        <Input label="Password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" hint="Use a unique password — passwords are bcrypt-hashed." />
        {err && <div className="text-xs text-state-danger bg-state-danger/10 border border-state-danger/30 rounded-md px-3 py-2">{err}</div>}
        <Button type="submit" loading={loading} className="w-full" icon={<UserPlus className="h-3.5 w-3.5" />}>
          Create account
        </Button>
      </form>

      <p className="text-xs text-fg-muted mt-6 text-center">
        By signing up you agree to our <a className="text-fg-muted hover:text-fg">Terms</a> & <a className="text-fg-muted hover:text-fg">Privacy Policy</a>.
      </p>

      <p className="text-xs text-fg-muted mt-4 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
      </p>
    </div>
  );
}
