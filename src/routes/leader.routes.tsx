import { type RouteObject } from 'react-router-dom';

import MyProjects from '@/pages/leader/MyProject/MyProjects';

export const leaderRoutes: RouteObject[] = [
  {
    path: 'lider/meu-projeto',
    element: <MyProjects />,
  },
];
