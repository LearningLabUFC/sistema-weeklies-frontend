import {
  adminLinks,
  leaderLinks,
  superAdminLinks,
  userLinks,
} from '@/config/navigation';
import { ROLE_IDS, ROLE_LABELS, ROLE_NAME_COLORS } from '@/config/roles';
import type { NavigationLink } from '@/types/sidebar';

export const getNavigationLinks = (role: string): NavigationLink[] => {
  const showAllLinks = import.meta.env.VITE_SHOW_ALL_LINKS === 'true';

  if (showAllLinks) {
    const allLinks = [...superAdminLinks, ...leaderLinks, ...userLinks];

    return allLinks.filter(
      (link, index, self) =>
        index === self.findIndex(item => item.to === link.to),
    );
  }

  const linksMap: Record<string, NavigationLink[]> = {
    [ROLE_IDS.SUPER_ADMIN]: superAdminLinks,
    [ROLE_IDS.ADMIN]: adminLinks,
    [ROLE_IDS.LEADER]: leaderLinks,
  };

  return linksMap[role] || userLinks;
};

export const getRoleDetails = (role: string) => {
  const detailsMap: Record<string, { label: string; color: string }> = {
    [ROLE_IDS.SUPER_ADMIN]: {
      label: ROLE_LABELS[ROLE_IDS.SUPER_ADMIN],
      color: ROLE_NAME_COLORS.super_admin,
    },
    [ROLE_IDS.ADMIN]: {
      label: ROLE_LABELS[ROLE_IDS.ADMIN],
      color: ROLE_NAME_COLORS.admin,
    },
    [ROLE_IDS.LEADER]: {
      label: ROLE_LABELS[ROLE_IDS.LEADER],
      color: ROLE_NAME_COLORS.lider,
    },
  };

  return (
    detailsMap[role] || {
      label: ROLE_LABELS[ROLE_IDS.ALUNO] || 'Aluno',
      color: ROLE_NAME_COLORS.aluno,
    }
  );
};
