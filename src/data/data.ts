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
} from 'lucide-react';

const baseLinks: NavigationLink[] = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/weeklies', icon: FileText, label: 'Minhas Weeklies' },
  { to: '/presenca', icon: CheckSquare, label: 'Presença' },
  { to: '/ponto', icon: Clock, label: 'Controle de Horas' },
  { to: '/profile', icon: User, label: 'Perfil' },
];

export const userLinks: NavigationLink[] = [...baseLinks];

export const leaderLinks: NavigationLink[] = [
  ...baseLinks,
  { to: '/projetos', icon: FolderKanban, label: 'Meu Projeto' },
];

export const adminLinks: NavigationLink[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/participantes', icon: Users, label: 'Participantes' },
  { to: '/admin/projetos', icon: FolderKanban, label: 'Projetos' },
  {
    to: '/admin/frequencia',
    icon: CalendarCheck,
    label: 'Frequências',
  },
  { to: '/admin/presenca', icon: ShieldCheck, label: 'Gerenciar Presença' },
  { to: '/admin/relatorio-horas', icon: Clock, label: 'Relatório de Horas' },
  {
    to: '/admin/gerenciar-admins',
    icon: ShieldAlert,
    label: 'Gerenciar Admins',
  },
];
