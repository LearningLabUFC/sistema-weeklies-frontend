import { type RouteObject } from 'react-router-dom';

import Login from '@/pages/auth/Login/Login';
import Register from '@/pages/auth/Register/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword/ForgotPassword';
import VerifyCode from '@/pages/auth/VerifyCode/VerifyCode';
import ResetPassword from '@/pages/auth/ResetPassword/ResetPassword';

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
