import type { NavigationLink } from '@/types/sidebar';
import {
  CalendarCheck,
  CheckSquare,
  Clock,
  FileText,
  FolderKanban,
  Home,
  LayoutDashboard,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  UserStar,
} from 'lucide-react';

const baseLinks: NavigationLink[] = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/weeklies', icon: FileText, label: 'Minhas Weeklies' },
  { to: '/presenca', icon: CheckSquare, label: 'Presença' },
  { to: '/controle-horas', icon: Clock, label: 'Controle de Horas' },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

export const userLinks: NavigationLink[] = [...baseLinks];

export const leaderLinks: NavigationLink[] = [
  ...baseLinks,
  { to: 'lider/meu-projeto', icon: FolderKanban, label: 'Meu Projeto' },
];

export const adminLinks: NavigationLink[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/participantes', icon: Users, label: 'Participantes' },
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
    label: 'Gerenciar Presença',
  },
  {
    to: '/admin/relatorio-horas',
    icon: Clock,
    label: 'Relatório de Horas',
  },
  {
    to: '/admin/gerenciar-admins',
    icon: ShieldAlert,
    label: 'Gerenciar Admins',
  },
];
