import { Navigate, type RouteObject } from 'react-router-dom';

export const leaderRoutes: RouteObject[] = [
  {
    path: 'lider/meu-projeto',
    element: <Navigate to="/setores" replace />,
  },
];
