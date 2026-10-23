import { type RouteObject } from 'react-router-dom';

import Presence from '@/pages/user/Presence/Presence';
import Profile from '@/pages/user/Profile/Profile';
import SectorDetailPage from '@/pages/user/Sectors/SectorDetailPage';
import SectorsCatalog from '@/pages/user/Sectors/SectorsCatalog';
import SectorTracking from '@/pages/user/Sectors/SectorTracking';
import MyTasks from '@/pages/user/Tasks/MyTasks';
import TimeClock from '@/pages/user/TimeClock/TimeClock';
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
    element: <WeeklyHistory />,
  },
  {
    path: 'weeklies/:weeklyId',
    element: <WeeklyDetailPage />,
  },
  {
    path: 'tarefas',
    element: <MyTasks />,
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
