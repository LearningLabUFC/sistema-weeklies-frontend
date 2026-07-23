import { type RouteObject } from 'react-router-dom';

import Profile from '@/pages/user/Profile/Profile';
import Presence from '@/pages/user/Presence/Presence';
import Weeklies from '@/pages/user/Weeklies/Weeklies';
import WeeklyHistory from '@/pages/user/WeeklyHistory/WeeklyHistory';
import TimeClock from '@/pages/user/TimeClock/TimeClock';

export const userRoutes: RouteObject[] = [
  {
    index: true,
    element: <Weeklies />,
  },
  {
    path: 'weeklies',
    element: <WeeklyHistory />,
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
