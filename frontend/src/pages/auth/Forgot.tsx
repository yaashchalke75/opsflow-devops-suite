import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authApi } from '@/api';
import { CheckCircle2 } from 'lucide-react';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authApi.forgot(email).catch(() => null);
    setLoading(false);
    setSent(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Forgot password?</h1>
      <p className="text-sm text-fg-muted mt-1.5">Enter your email and we'll send you a reset link.</p>

      {!sent ? (
        <form onSubmit={submit} className="mt-7 space-y-3.5">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
        </form>
      ) : (
        <div className="mt-7 card p-5 text-center">
          <CheckCircle2 className="h-8 w-8 text-state-success mx-auto mb-2" />
          <div className="text-sm font-medium">Check your inbox</div>
          <div className="text-xs text-fg-muted mt-1">
            If an account exists for <span className="text-fg">{email}</span>, a reset link is on its way.
          </div>
        </div>
      )}

      <p className="text-xs text-fg-muted mt-6 text-center">
        <Link to="/login" className="text-brand-400 hover:text-brand-300">← Back to sign in</Link>
      </p>
    </div>
  );
}
