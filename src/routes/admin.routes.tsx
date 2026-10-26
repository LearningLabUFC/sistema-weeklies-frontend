import { Navigate, type RouteObject } from 'react-router-dom';

import Dashboard from '@/pages/admin/Dashboard/Dashboard';
import Frequencies from '@/pages/admin/Frequencies/Frequencies';
import HourReport from '@/pages/admin/HourReport/HourReport';
import NewRequest from '@/pages/admin/NewRequest/NewRequest';
import Participants from '@/pages/admin/Participants/Participants';
import Presence from '@/pages/admin/Presence/Presence';
import AdminSectorDetail from '@/pages/admin/Sectors/AdminSectorDetail';
import AdminSectorsList from '@/pages/admin/Sectors/AdminSectorsList';
import Profile from '@/pages/user/Profile/Profile';

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
        path: 'setores',
        element: <AdminSectorsList />,
      },
      {
        path: 'setores/:sectorId',
        element: <AdminSectorDetail />,
      },
      {
        path: 'projetos',
        element: <Navigate to="/admin/setores" replace />,
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
