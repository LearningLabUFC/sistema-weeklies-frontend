import { useContext } from 'react';

import {
  SectorContext,
  type SectorContextType,
} from '@/features/sectors/context/sectorContextDef';

export function useSectorContext(): SectorContextType {
  const context = useContext(SectorContext);
  if (!context) {
    throw new Error(
      'useSectorContext deve ser utilizado dentro de um SectorProvider',
    );
  }
  return context;
}
