import { Navigate, Outlet } from 'react-router-dom';

import { Spinner } from '@/components/ui/spinner';
import { isAdminRole } from '@/config/roles';
import { useAuth } from '@/hooks/useAuth';

/**
 * Guarda de rota administrativa.
 * Garante que apenas usuários autenticados, ativos e com cargo global de
 * Administrador ou Super Administrador (Coordenadora) acessem as rotas filhas.
 */
export function AdminRoute() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-6 bg-linear-to-br from-indigo-100 via-white to-indigo-100 flex flex-col items-center justify-center font-sans text-slate-900">
        <div className="flex flex-col items-center gap-3 text-center">
          <Spinner className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500 animate-pulse">
            Verificando permissões...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isPending = user?.status_id === '1fa85f64-5717-4562-b3fc-2c963f66afa1';
  if (isPending) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!isAdminRole(user?.global_role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
