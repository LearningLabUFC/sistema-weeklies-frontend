export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'leader';
  avatar?: string;
  weeksWithoutReport: number;
  projects: string[];
}

export const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@learninglab.com',
    role: 'admin',
    weeksWithoutReport: 0,
    projects: [],
  },
  {
    id: '2',
    name: 'Ana Carolina Silva',
    email: 'ana.silva@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 0,
    projects: ['Midias', 'LLGirls'],
  },
  {
    id: '3',
    name: 'Bruno Costa',
    email: 'bruno.costa@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 4,
    projects: ['GestLab', 'StudyLab'],
  },
  {
    id: '4',
    name: 'Carla Mendes',
    email: 'carla.mendes@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 1,
    projects: ['StudyLab', 'Gamificall'],
  },
  {
    id: '5',
    name: 'Diego Santos',
    email: 'diego.santos@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 0,
    projects: ['GestLab'],
  },
  {
    id: '6',
    name: 'Eduarda Lima',
    email: 'eduarda.lima@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 3,
    projects: ['GestLab', 'LabGames', 'StudyLab'],
  },
  {
    id: '7',
    name: 'Felipe Oliveira',
    email: 'felipe.oliveira@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 0,
    projects: ['Gamificall', 'Midias'],
  },
  {
    id: '8',
    name: 'Pedro Alves',
    email: 'pedro.alves@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 0,
    projects: ['LLGirls', 'LabGames'],
  },
];
