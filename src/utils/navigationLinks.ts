import { adminLinks, leaderLinks, userLinks } from '@/data/data';
import type { NavigationLink } from '@/types/sidebar';

export const getNavigationLinks = (role: string): NavigationLink[] => {
  if (role === 'admin') return adminLinks;
  if (role === 'leader') return leaderLinks;
  return userLinks;
};

export const getRoleDetails = (role: string) => {
  // depois precisa identificar a role
  switch (role) {
    case 'admin':
      return {
        label: 'Administrador',
        color: 'bg-purple-100 text-purple-700',
      };
    case 'leader':
      return { label: 'Líder', color: 'bg-amber-100 text-amber-700' };
    default:
      return { label: 'Aluno', color: 'bg-indigo-100 text-indigo-700' };
  }
};
