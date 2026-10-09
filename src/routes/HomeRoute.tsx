import { Navigate } from 'react-router-dom';

import { isAdminRole } from '@/config/roles';
import { useAuth } from '@/hooks/useAuth';
import Weeklies from '@/pages/user/Weeklies/Weeklies';

/**
 * Rota raiz inteligente (/):
 * - Administradores e Coordenadores (super_admin) são direcionados para o dashboard administrativo (/admin).
 * - Usuários comuns e líderes acessam o fluxo de Weeklies.
 */
export function HomeRoute() {
  const { user } = useAuth();

  if (isAdminRole(user?.global_role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Weeklies />;
}
