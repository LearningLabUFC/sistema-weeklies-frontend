import { Navigate } from 'react-router-dom';

import { isAdminRole } from '@/config/roles';
import { useAuth } from '@/hooks/useAuth';
import Home from '@/pages/user/Home/Home';

/**
 * Rota raiz inteligente (/):
 * - Administradores e Coordenadores (super_admin) são direcionados para o dashboard administrativo (/admin).
 * - Usuários comuns e líderes acessam o Dashboard unificado.
 */
export function HomeRoute() {
  const { user } = useAuth();

  if (isAdminRole(user?.global_role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Home />;
}
