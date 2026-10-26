import { createBrowserRouter } from 'react-router-dom';

import App from '@/App';
import { NotFound } from '@/pages/Not Found/NotFound';
import PendingApproval from '@/pages/user/PendingApproval/PendingApproval';
import { adminRoutes } from '@/routes/admin.routes';
import { AdminRoute } from '@/routes/AdminRoute';
import { authRoutes } from '@/routes/auth.routes';
import { leaderRoutes } from '@/routes/leader.routes';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { userRoutes } from '@/routes/user.routes';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/pending-approval',
        element: <PendingApproval />,
      },
      {
        path: '/',
        element: <App />,
        children: [
          ...userRoutes,
          ...leaderRoutes,
          {
            element: <AdminRoute />,
            children: adminRoutes,
          },
        ],
      },
    ],
  },
  ...authRoutes,
  {
    path: '*',
    element: <NotFound />,
  },
]);
