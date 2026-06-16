import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import App from '../App.tsx';
import { NotFound } from '@/pages/Not Found/NotFound.tsx';

export const router = createBrowserRouter([
  { path: '/', element: <App /> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/profile', element: <div>profile</div> }],
  },
  { path: '*', element: <NotFound /> },
]);
