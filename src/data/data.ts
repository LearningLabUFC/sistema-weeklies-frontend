import type { NavigationLink } from '@/types/sidebar';
import {
  CalendarCheck,
  Camera,
  CheckSquare,
  Clock,
  FileText,
  FolderKanban,
  Globe,
  Home,
  LayoutDashboard,
  Link2,
  PlaySquare,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  UserStar,
  UserRoundPlus,
} from 'lucide-react';

const baseLinks: NavigationLink[] = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/weeklies', icon: FileText, label: 'Minhas weeklies' },
  { to: '/presenca', icon: CheckSquare, label: 'Presença' },
  { to: '/controle-horas', icon: Clock, label: 'Controle de horas' },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

export const userLinks: NavigationLink[] = [...baseLinks];

export const leaderLinks: NavigationLink[] = [
  ...baseLinks,
  { to: 'lider/meu-projeto', icon: FolderKanban, label: 'Meu projeto' },
];

export const adminLinks: NavigationLink[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/participantes', icon: Users, label: 'Participantes' },
  {
    to: '/admin/novos-participantes',
    icon: UserRoundPlus,
    label: 'Solicitações',
  },
  { to: '/admin/projetos', icon: FolderKanban, label: 'Projetos' },
  { to: '/admin/perfil', icon: UserStar, label: 'Perfil' },
  {
    to: '/admin/frequencias',
    icon: CalendarCheck,
    label: 'Frequências',
  },
  {
    to: '/admin/presenca',
    icon: ShieldCheck,
    label: 'Gerenciar presença',
  },
  {
    to: '/admin/relatorio-horas',
    icon: Clock,
    label: 'Relatório de horas',
  },
];

export const superAdminLinks: NavigationLink[] = [
  ...adminLinks,
  {
    to: '/admin/gerenciar-admins',
    icon: ShieldAlert,
    label: 'Gerenciar admins',
  },
];

export const pendingApprovalLinks = [
  {
    title: 'Site oficial do LearningLab',
    url: 'https://learninglab.com.br/',
    icon: Globe,
  },
  {
    title: 'Instagram',
    url: 'https://www.instagram.com/learninglabufc/',
    icon: Camera,
  },
  {
    title: 'YouTube',
    url: 'https://www.youtube.com/channel/UCZGpt5Lolr7dYeOEHUuAfVg/featured',
    icon: PlaySquare,
  },
  {
    title: 'Outras informações (Taplink)',
    url: 'https://taplink.cc/learninglabufc',
    icon: Link2,
  },
];

export const ROLE_IDS = {
  ALUNO: '2fa85f64-5717-4562-b3fc-2c963f66afa3',
  ADMIN: '2fa85f64-5717-4562-b3fc-2c963f66afa2',
  SUPER_ADMIN: '2fa85f64-5717-4562-b3fc-2c963f66afa1',
  LEADER: 'id-do-lider-pendente',
};

export const ROLE_LABELS: Record<string, string> = {
  [ROLE_IDS.ALUNO]: 'Aluno',
  [ROLE_IDS.ADMIN]: 'Administrador',
  [ROLE_IDS.SUPER_ADMIN]: 'Coordenadora',
  [ROLE_IDS.LEADER]: 'Líder',
};
