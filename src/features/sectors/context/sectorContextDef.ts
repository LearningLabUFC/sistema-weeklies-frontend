import { createContext } from 'react';

import type {
  SectorListItem,
  SectorMemberRole,
  UserSectorItem,
} from '@/types/sectors';

export interface SectorContextType {
  sectors: SectorListItem[];
  mySectors: UserSectorItem[];
  isMemberOf: (sectorId: string) => boolean;
  getMyRole: (sectorId: string) => SectorMemberRole | null;
  selectedSectorId: string | null;
  selectedSectorName: string | null;
  selectedSector: SectorListItem | null;
  selectSector: (id: string, nome: string) => void;
  setSelectedSectorId: (id: string | null) => void;
  clearSelectedSector: () => void;
  isLoading: boolean;
  refreshSectors: () => Promise<void>;
}

export const SectorContext = createContext<SectorContextType | undefined>(
  undefined,
);
