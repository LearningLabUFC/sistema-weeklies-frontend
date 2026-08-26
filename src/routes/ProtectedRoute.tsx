import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-6 bg-linear-to-br from-indigo-100 via-white to-indigo-100 flex flex-col items-center justify-center font-sans text-slate-900">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isPending = user?.status_id === '1fa85f64-5717-4562-b3fc-2c963f66afa1';

  if (isPending && location.pathname !== '/pending-approval') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!isPending && location.pathname === '/pending-approval') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
