import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute() {
  // TODO: Fazer logica real de autenticação (hooks e checkar o local storage)
  const token = localStorage.getItem('@SeuApp:token'); // buscar o token de autenticação
  const isAuthenticated = !!token;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
