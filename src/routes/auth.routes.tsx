import { type RouteObject } from 'react-router-dom';

import ForgotPassword from '@/pages/auth/ForgotPassword/ForgotPassword';
import Login from '@/pages/auth/Login/Login';
import Register from '@/pages/auth/Register/Register';
import ResetPassword from '@/pages/auth/ResetPassword/ResetPassword';
import VerifyCode from '@/pages/auth/VerifyCode/VerifyCode';

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/verify-code',
    element: <VerifyCode />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
];
