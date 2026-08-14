import {
  adminLinks,
  superAdminLinks,
  leaderLinks,
  userLinks,
  ROLE_IDS,
  ROLE_LABELS,
} from '@/data/data';
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
      color: 'bg-[#F51BA3]/10 text-[#F51BA3] dark:bg-[#F51BA3]/20',
    },
    [ROLE_IDS.ADMIN]: {
      label: ROLE_LABELS[ROLE_IDS.ADMIN],
      color: 'bg-[#8204EE]/10 text-[#8204EE] dark:bg-[#8204EE]/20',
    },
    [ROLE_IDS.LEADER]: {
      label: ROLE_LABELS[ROLE_IDS.LEADER],
      color:
        'bg-[#FFBF00]/15 text-[#D49E00] dark:bg-[#FFBF00]/20 dark:text-[#FFBF00]',
    },
  };

  return (
    detailsMap[role] || {
      label: ROLE_LABELS[ROLE_IDS.ALUNO] || 'Aluno',
      color: 'bg-[#457EFF]/10 text-[#457EFF] dark:bg-[#457EFF]/20',
    }
  );
};
