import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/features/auth/context/AuthContext';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { SectorProvider } from '@/features/sectors/context/SectorContext';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import type { User } from '@/types/user';

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: {
    list: vi.fn(),
    getMySectors: vi.fn().mockResolvedValue([]),
  },
}));

describe('SectorContext Isolated Storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(sectorsApi.getMySectors).mockResolvedValue([]);
    vi.mocked(sectorsApi.list).mockResolvedValue({
      setores: [
        {
          id: 'sec-1',
          nome: 'Desenvolvimento',
          descricao: 'Setor Dev',
          ativo: true,
          criado_em: '2026-01-01',
          qtd_membros: 5,
          qtd_lideres: 1,
        },
      ],
      total: 1,
      pagina: 1,
      limite: 100,
    });
  });

  const createWrapper = (user: User | null) => {
    return ({ children }: { children: ReactNode }) => (
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: Boolean(user),
          loading: false,
          login: vi.fn(),
          logout: vi.fn(),
          registerUser: vi.fn(),
          checkUserStatus: vi.fn(),
        }}
      >
        <SectorProvider>{children}</SectorProvider>
      </AuthContext.Provider>
    );
  };

  it('salva o setor selecionado com namespace do ID do usuário autenticado', async () => {
    const userA = { id: 'user-aaa', nome_completo: 'Alice' } as User;
    const { result } = renderHook(() => useSectorContext(), {
      wrapper: createWrapper(userA),
    });

    await waitFor(() => {
      expect(result.current.sectors.length).toBe(1);
    });

    act(() => {
      result.current.selectSector('sec-1', 'Desenvolvimento');
    });

    expect(result.current.selectedSectorId).toBe('sec-1');
    expect(
      localStorage.getItem('@LearningLab:selectedSector:user-aaa'),
    ).toContain('sec-1');
    expect(localStorage.getItem('@LearningLab:selectedSector')).toBeNull();
  });

  it('não herda a seleção do usuário anterior ao trocar de conta', async () => {
    localStorage.setItem(
      '@LearningLab:selectedSector:user-aaa',
      JSON.stringify({ id: 'sec-1', nome: 'Desenvolvimento' }),
    );

    const userB = { id: 'user-bbb', nome_completo: 'Bob' } as User;
    const { result } = renderHook(() => useSectorContext(), {
      wrapper: createWrapper(userB),
    });

    await waitFor(() => {
      expect(result.current.sectors.length).toBe(1);
    });

    expect(result.current.selectedSectorId).toBeNull();
  });

  it('recupera a seleção própria salva anteriormente para o mesmo usuário', async () => {
    localStorage.setItem(
      '@LearningLab:selectedSector:user-bbb',
      JSON.stringify({ id: 'sec-1', nome: 'Desenvolvimento' }),
    );

    const userB = { id: 'user-bbb', nome_completo: 'Bob' } as User;
    const { result } = renderHook(() => useSectorContext(), {
      wrapper: createWrapper(userB),
    });

    await waitFor(() => {
      expect(result.current.sectors.length).toBe(1);
    });

    expect(result.current.selectedSectorId).toBe('sec-1');
  });

  it('limpa a seleção quando clearSelectedSector é chamado', async () => {
    const userA = { id: 'user-aaa', nome_completo: 'Alice' } as User;
    const { result } = renderHook(() => useSectorContext(), {
      wrapper: createWrapper(userA),
    });

    await waitFor(() => {
      expect(result.current.sectors.length).toBe(1);
    });

    act(() => {
      result.current.selectSector('sec-1', 'Desenvolvimento');
    });
    expect(result.current.selectedSectorId).toBe('sec-1');

    act(() => {
      result.current.clearSelectedSector();
    });
    expect(result.current.selectedSectorId).toBeNull();
    expect(
      localStorage.getItem('@LearningLab:selectedSector:user-aaa'),
    ).toBeNull();
  });
});
