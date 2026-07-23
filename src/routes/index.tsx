import { createBrowserRouter } from 'react-router-dom';

import App from '@/App';
import { ProtectedRoute } from './ProtectedRoute';

import { NotFound } from '@/pages/Not Found/NotFound';

import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { leaderRoutes } from './leader.routes';
import { adminRoutes } from './admin.routes';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [...userRoutes, ...leaderRoutes, ...adminRoutes],
      },
    ],
  },

  ...authRoutes,

  {
    path: '*',
    element: <NotFound />,
  },
]);
