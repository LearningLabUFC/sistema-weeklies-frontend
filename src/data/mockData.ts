export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'leader';
  avatar?: string;
  weeksWithoutReport: number;
  projects: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  members: string[];
}

export interface PresenceRecord {
  id: string;
  userId: string;
  date: string;
  present: boolean;
}

export const MOCK_USERS: User[] = [
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
    weeksWithoutReport: 0, // Em dia (Enviou)
    projects: ['Midias', 'LLGirls'],
  },
  {
    id: '3',
    name: 'Bruno Costa',
    email: 'bruno.costa@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 4, // ALERTA CRÍTICO (4+ semanas)
    projects: ['GestLab', 'StudyLab'],
  },
  {
    id: '4',
    name: 'Carla Mendes',
    email: 'carla.mendes@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 1, // Pendente essa semana, mas sem alerta crítico (<3)
    projects: ['StudyLab', 'Gamificall'],
  },
  {
    id: '5',
    name: 'Diego Santos',
    email: 'diego.santos@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 0, // Em dia (Enviou)
    projects: ['GestLab'],
  },
  {
    id: '6',
    name: 'Eduarda Lima',
    email: 'eduarda.lima@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 3, // ALERTA CRÍTICO (3+ semanas)
    projects: ['GestLab', 'LabGames', 'StudyLab'],
  },
  {
    id: '7',
    name: 'Felipe Oliveira',
    email: 'felipe.oliveira@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 0, // Em dia (Enviou)
    projects: ['Gamificall', 'Midias'],
  },
  {
    id: '8',
    name: 'Pedro Alves',
    email: 'pedro.alves@learninglab.com',
    role: 'student',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    weeksWithoutReport: 0, // Em dia (Enviou)
    projects: ['LLGirls', 'LabGames'],
  },
];

// ---------------------------------------------------------------------------
// 2. MOCK DE PROJETOS
// ---------------------------------------------------------------------------
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Midias',
    description: 'Equipe responsável pelas redes sociais e comunicação visual.',
    members: ['2', '7'], // Ana e Felipe
  },
  {
    id: 'p2',
    name: 'GestLab',
    description: 'Desenvolvimento do sistema de gestão interna.',
    members: ['3', '5', '6'], // Bruno (alerta), Diego e Eduarda (alerta)
  },
  {
    id: 'p3',
    name: 'StudyLab',
    description: 'Plataforma de compartilhamento de artigos e estudos.',
    members: ['3', '4', '6'], // Bruno (alerta), Carla e Eduarda (alerta)
  },
  {
    id: 'p4',
    name: 'Gamificall',
    description: 'Pesquisa e aplicação de gamificação na educação.',
    members: ['4', '7'], // Carla e Felipe
  },
  {
    id: 'p5',
    name: 'LLGirls',
    description: 'Iniciativa de incentivo e apoio a mulheres na tecnologia.',
    members: ['2', '8'], // Ana e Pedro
  },
  {
    id: 'p6',
    name: 'LabGames',
    description: 'Estúdio experimental de desenvolvimento de jogos digitais.',
    members: ['6', '8'], // Eduarda (alerta) e Pedro
  },
];

// ---------------------------------------------------------------------------
// 3. MOCK DE PRESENÇA (~71% de taxa para bater com o protótipo)
// ---------------------------------------------------------------------------
// 14 registros no total: 10 presenças (true) e 4 faltas (false) = 71.4%
export const MOCK_PRESENCE_RECORDS: PresenceRecord[] = [
  { id: 'r1', userId: '2', date: '2026-07-20', present: true },
  { id: 'r2', userId: '3', date: '2026-07-20', present: false }, // Falta do Bruno
  { id: 'r3', userId: '4', date: '2026-07-20', present: true },
  { id: 'r4', userId: '5', date: '2026-07-20', present: true },
  { id: 'r5', userId: '6', date: '2026-07-20', present: false }, // Falta da Eduarda
  { id: 'r6', userId: '7', date: '2026-07-20', present: true },
  { id: 'r7', userId: '8', date: '2026-07-20', present: true },
  { id: 'r8', userId: '2', date: '2026-07-13', present: true },
  { id: 'r9', userId: '3', date: '2026-07-13', present: false }, // Falta do Bruno
  { id: 'r10', userId: '4', date: '2026-07-13', present: true },
  { id: 'r11', userId: '5', date: '2026-07-13', present: true },
  { id: 'r12', userId: '6', date: '2026-07-13', present: false }, // Falta da Eduarda
  { id: 'r13', userId: '7', date: '2026-07-13', present: true },
  { id: 'r14', userId: '8', date: '2026-07-13', present: true },
];
