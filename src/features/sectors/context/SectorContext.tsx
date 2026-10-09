import {
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { AuthContext } from '@/features/auth/context/AuthContext';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { SectorContext } from '@/features/sectors/context/sectorContextDef';
import { useAuth } from '@/hooks/useAuth';
import type { SectorListItem, UserSectorItem } from '@/types/sectors';

interface SelectedSectorData {
  id: string;
  nome: string;
}

const STORAGE_PREFIX = '@LearningLab:selectedSector';

export function SectorProvider({ children }: { children: ReactNode }) {
  let authUser = useContext(AuthContext)?.user;
  try {
    const authHook = useAuth();
    if (authHook?.user) {
      authUser = authHook.user;
    }
  } catch {
    // fallback to useContext
  }
  const userId = authUser?.id;
  const storageKey = userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;

  const [sectors, setSectors] = useState<SectorListItem[]>([]);
  const [mySectors, setMySectors] = useState<UserSectorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prevUserId, setPrevUserId] = useState(userId);
  const [selected, setSelected] = useState<SelectedSectorData | null>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Ajusta a seleção durante a renderização ao trocar de usuário autenticado
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    let nextSelected: SelectedSectorData | null;
    try {
      const stored = localStorage.getItem(storageKey);
      nextSelected = stored ? JSON.parse(stored) : null;
    } catch {
      nextSelected = null;
    }
    setSelected(nextSelected);
  }

  const refreshSectors = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resAll, resMine] = await Promise.all([
        sectorsApi.list({ limite: 100 }),
        userId && typeof sectorsApi.getMySectors === 'function'
          ? sectorsApi.getMySectors().catch(() => [])
          : Promise.resolve([]),
      ]);
      setSectors(resAll.setores);
      setMySectors(resMine);
    } catch (err) {
      console.error('Erro ao carregar setores no contexto:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let isCancelled = false;
    Promise.all([
      sectorsApi.list({ limite: 100 }),
      userId && typeof sectorsApi.getMySectors === 'function'
        ? sectorsApi.getMySectors().catch(() => [])
        : Promise.resolve([]),
    ])
      .then(([resAll, resMine]) => {
        if (!isCancelled) {
          setSectors(resAll.setores);
          setMySectors(resMine);
        }
      })
      .catch(err => {
        if (!isCancelled) console.error('Erro ao carregar setores:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    try {
      if (selected) {
        localStorage.setItem(storageKey, JSON.stringify(selected));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [selected, storageKey]);

  const selectSector = useCallback((id: string, nome: string) => {
    setSelected({ id, nome });
  }, []);

  const setSelectedSectorId = useCallback(
    (id: string | null) => {
      if (!id) {
        setSelected(null);
        return;
      }
      const sec = sectors.find(s => s.id === id);
      setSelected({ id, nome: sec ? sec.nome : '' });
    },
    [sectors],
  );

  const clearSelectedSector = useCallback(() => {
    setSelected(null);
  }, []);

  const isMemberOf = useCallback(
    (sectorId: string) => {
      return mySectors.some(s => s.id === sectorId);
    },
    [mySectors],
  );

  const getMyRole = useCallback(
    (sectorId: string) => {
      const found = mySectors.find(s => s.id === sectorId);
      return found ? found.papel : null;
    },
    [mySectors],
  );

  const selectedSector = selected?.id
    ? sectors.find(s => s.id === selected.id) || null
    : null;

  return (
    <SectorContext.Provider
      value={{
        sectors,
        mySectors,
        isMemberOf,
        getMyRole,
        selectedSectorId: selected?.id ?? null,
        selectedSectorName: selected?.nome ?? null,
        selectedSector,
        selectSector,
        setSelectedSectorId,
        clearSelectedSector,
        isLoading,
        refreshSectors,
      }}
    >
      {children}
    </SectorContext.Provider>
  );
}
