import AdminManagement from '@/pages/admin/AdminManagement/AdminManagement';
import Dashboard from '@/pages/admin/Dashboard/Dashboard';
import Frequencies from '@/pages/admin/Frequencies/Frequencies';
import HourReport from '@/pages/admin/HourReport/HourReport';
import NewRequest from '@/pages/admin/NewRequest/NewRequest';
import Participants from '@/pages/admin/Participants/Participants';
import Presence from '@/pages/admin/Presence/Presence';
import Projects from '@/pages/admin/Projects/Projects';
import Profile from '@/pages/user/Profile/Profile';
import { type RouteObject } from 'react-router-dom';

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'participantes',
        element: <Participants />,
      },
      {
        path: 'projetos',
        element: <Projects />,
      },
      {
        path: 'frequencias',
        element: <Frequencies />,
      },
      {
        path: 'presenca',
        element: <Presence />,
      },
      {
        path: 'relatorio-horas',
        element: <HourReport />,
      },
      {
        path: 'gerenciar-admins',
        element: <AdminManagement />,
      },
      {
        path: 'perfil',
        element: <Profile />,
      },
      {
        path: 'novos-participantes',
        element: <NewRequest />,
      },
    ],
  },
];
