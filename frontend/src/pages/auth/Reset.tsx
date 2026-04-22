import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/api';
import toast from 'react-hot-toast';

export default function Reset() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get('token') || 'demo';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    await authApi.reset(token, password).catch(() => null);
    setLoading(false);
    toast.success('Password reset. Please sign in.');
    nav('/login');
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
      <p className="text-sm text-fg-muted mt-1.5">Choose a strong password to secure your account.</p>

      <form onSubmit={submit} className="mt-7 space-y-3.5">
        <Input label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input label="Confirm password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full">Reset password</Button>
      </form>

      <p className="text-xs text-fg-muted mt-6 text-center">
        <Link to="/login" className="text-brand-400 hover:text-brand-300">← Back to sign in</Link>
      </p>
    </div>
  );
}
