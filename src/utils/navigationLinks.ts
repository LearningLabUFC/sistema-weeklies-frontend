import { adminLinks, leaderLinks, userLinks } from '@/data/data';
import type { NavigationLink } from '@/types/sidebar';

const SHOW_ALL_LINKS = import.meta.env.VITE_SHOW_ALL_LINKS === 'true';

export const getNavigationLinks = (role: string): NavigationLink[] => {
  if (SHOW_ALL_LINKS) {
    const allLinks = [...adminLinks, ...leaderLinks, ...userLinks];

    return allLinks.filter(
      (link, index, self) =>
        index === self.findIndex(item => item.to === link.to),
    );
  }

  if (role === 'admin') return adminLinks;
  if (role === 'leader') return leaderLinks;
  return userLinks;
};

export const getRoleDetails = (role: string) => {
  switch (role) {
    case 'admin':
      return {
        label: 'Administrador',
        color: 'bg-purple-100 text-purple-700',
      };
    case 'leader':
      return {
        label: 'Líder',
        color: 'bg-amber-100 text-amber-700',
      };
    default:
      return {
        label: 'Aluno',
        color: 'bg-indigo-100 text-indigo-700',
      };
  }
};
