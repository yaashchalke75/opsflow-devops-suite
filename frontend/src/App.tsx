import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Skeleton } from '@/components/ui/Skeleton';
import { can, type Permission } from '@/lib/permissions';

const Login = lazy(() => import('@/pages/auth/Login'));
const Signup = lazy(() => import('@/pages/auth/Signup'));
const Forgot = lazy(() => import('@/pages/auth/Forgot'));
const Reset = lazy(() => import('@/pages/auth/Reset'));
const Dashboard = lazy(() => import('@/pages/app/Dashboard'));
const Incidents = lazy(() => import('@/pages/app/Incidents'));
const Deployments = lazy(() => import('@/pages/app/Deployments'));
const Alerts = lazy(() => import('@/pages/app/Alerts'));
const Team = lazy(() => import('@/pages/app/Team'));
const Runbooks = lazy(() => import('@/pages/app/Runbooks'));
const Analytics = lazy(() => import('@/pages/app/Analytics'));
const Audit = lazy(() => import('@/pages/app/Audit'));
const Settings = lazy(() => import('@/pages/app/Settings'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function Fallback() {
  return <div className="p-8 space-y-3"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();
  const location = useLocation();
  if (!hydrated) return <Fallback />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function Public({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useAuth();
  if (!hydrated) return <Fallback />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RequirePerm({ perm, children }: { perm: Permission; children: React.ReactNode }) {
  const role = useAuth((s) => s.user?.role);
  if (!can(role, perm)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<Public><AuthLayout /></Public>}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot" element={<Forgot />} />
          <Route path="/reset" element={<Reset />} />
        </Route>

        <Route element={<Protected><AppLayout /></Protected>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/deployments" element={<Deployments />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/team" element={<Team />} />
          <Route path="/runbooks" element={<Runbooks />} />
          <Route path="/analytics" element={<RequirePerm perm="analytics:view"><Analytics /></RequirePerm>} />
          <Route path="/audit" element={<RequirePerm perm="users:manage"><Audit /></RequirePerm>} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
