import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { LiveShowcase } from '@/components/auth/LiveShowcase';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 relative">
      {/* Left: form */}
      <div className="flex flex-col p-6 md:p-10">
        <Logo />
        <div className="flex-1 grid place-items-center py-10">
          <div className="w-full max-w-sm animate-fade-in">
            <Outlet />
          </div>
        </div>
        <div className="text-xs text-fg-subtle text-center">© {new Date().getFullYear()} OpsFlow, Inc. · SOC 2 Type II</div>
      </div>

      {/* Right: live showcase */}
      <div className="hidden md:block relative bg-bg-soft border-l border-border">
        <LiveShowcase />
      </div>
    </div>
  );
}
