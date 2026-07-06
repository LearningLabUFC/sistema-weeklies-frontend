import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import App from '../App.tsx';

import { NotFound } from '@/pages/Not Found/NotFound.tsx';

import Login from '@/pages/Login/Login.tsx';
import Register from '@/pages/Register/Register.tsx';
import ForgotPassword from '@/pages/ForgotPassword/ForgotPassword.tsx';
import VerifyCode from '@/pages/VerifyCode/VerifyCode.tsx';
import ResetPassword from '@/pages/ResetPassword/ResetPassword.tsx';

import Profile from '@/pages/Profile/Profile.tsx';

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          {
            index: true,
            element: <div>Bem vindo ao Dashboard (Página Inicial)</div>,
          },
          {
            path: '/profile',
            element: <Profile />,
          },
          {
            path: '/dashboard',
            element: <div>Página do Dashboard</div>,
          },
          {
            path: '/presenca',
            element: <div>Página de fazer presença</div>,
          },
          {
            path: '/ponto',
            element: <div>Página de bater ponto</div>,
          },
          {
            path: '/weeklies',
            element: <div>Minhas Weeklies</div>,
          },
        ],
      },
    ],
  },

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
  { path: '*', element: <NotFound /> },
]);
