import MyProjects from '@/pages/leader/MyProject/MyProjects';
import { type RouteObject } from 'react-router-dom';

export const leaderRoutes: RouteObject[] = [
  {
    path: 'lider/meu-projeto',
    element: <MyProjects />,
  },
];
