import { type RouteObject } from 'react-router-dom';

import Presence from '@/pages/user/Presence/Presence';
import Profile from '@/pages/user/Profile/Profile';
import TimeClock from '@/pages/user/TimeClock/TimeClock';
import Weeklies from '@/pages/user/Weeklies/Weeklies';
import WeeklyHistory from '@/pages/user/WeeklyHistory/WeeklyHistory';

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
