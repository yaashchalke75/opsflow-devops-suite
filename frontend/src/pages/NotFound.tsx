import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { ArrowLeft, LifeBuoy } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center p-6 grid-bg">
      <div className="max-w-md text-center">
        <div className="inline-block mb-8"><Logo /></div>
        <div className="text-[96px] font-bold leading-none tracking-tighter bg-gradient-to-br from-brand-400 to-brand-700 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="text-xl font-semibold mt-2">Page not found</h1>
        <p className="text-sm text-fg-muted mt-2">
          The page you're looking for doesn't exist or was moved. If you think this is a bug, let us know.
        </p>
        <div className="flex items-center justify-center gap-2 mt-6">
          <Link to="/dashboard"><Button icon={<ArrowLeft className="h-3.5 w-3.5" />}>Back to dashboard</Button></Link>
          <Button variant="secondary" icon={<LifeBuoy className="h-3.5 w-3.5" />}>Contact support</Button>
        </div>
      </div>
    </div>
  );
}
