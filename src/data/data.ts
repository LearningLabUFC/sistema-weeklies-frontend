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

export const pendingApprovalLinks = [
  {
    title: 'Site Oficial do LearningLab',
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
    title: 'Outras Informações (Taplink)',
    url: 'https://taplink.cc/learninglabufc',
    icon: Link2,
  },
];
