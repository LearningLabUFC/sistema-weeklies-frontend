import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

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

  return <Outlet />;
}
