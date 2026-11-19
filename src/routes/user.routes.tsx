import { Navigate, type RouteObject } from 'react-router-dom';

import Presence from '@/pages/user/Presence/Presence';
import Profile from '@/pages/user/Profile/Profile';
import SectorDetailPage from '@/pages/user/Sectors/SectorDetailPage';
import SectorsCatalog from '@/pages/user/Sectors/SectorsCatalog';
import SectorTracking from '@/pages/user/Sectors/SectorTracking';
import MyTasks from '@/pages/user/Tasks/MyTasks';
import TimeClock from '@/pages/user/TimeClock/TimeClock';
import Weeklies from '@/pages/user/Weeklies/Weeklies';
import WeekliesLayout from '@/pages/user/Weeklies/WeekliesLayout';
import WeeklyDetailPage from '@/pages/user/WeeklyHistory/WeeklyDetailPage';
import WeeklyHistory from '@/pages/user/WeeklyHistory/WeeklyHistory';
import { HomeRoute } from '@/routes/HomeRoute';

export const userRoutes: RouteObject[] = [
  {
    index: true,
    element: <HomeRoute />,
  },
  {
    path: 'weeklies',
    element: <WeekliesLayout />,
    children: [
      {
        index: true,
        element: <Weeklies embedded />,
      },
      {
        path: 'historico',
        element: <WeeklyHistory embedded />,
      },
      {
        path: 'tarefas',
        element: <MyTasks embedded />,
      },
    ],
  },
  {
    path: 'weeklies/:weeklyId',
    element: <WeeklyDetailPage />,
  },
  {
    path: 'minha-weekly',
    element: <Navigate to="/weeklies" replace />,
  },
  {
    path: 'tarefas',
    element: <Navigate to="/weeklies/tarefas" replace />,
  },
  {
    path: 'setores',
    element: <SectorsCatalog />,
  },
  {
    path: 'setores/:sectorId',
    element: <SectorDetailPage />,
  },
  {
    path: 'setores/:sectorId/acompanhamento',
    element: <SectorTracking />,
  },
  {
    path: 'perfil',
    element: <Profile />,
  },
  {
    path: 'presenca',
    element: <Presence />,
  },
  {
    path: 'controle-horas',
    element: <TimeClock />,
  },
];
