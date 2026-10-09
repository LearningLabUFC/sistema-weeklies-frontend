import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { useAuth } from '@/hooks/useAuth';
import SectorsCatalog from '@/pages/user/Sectors/SectorsCatalog';
import type { SectorListResponse } from '@/types/sectors';
import type { User } from '@/types/user';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: {
    list: vi.fn(),
  },
}));

vi.mock('@/features/sectors/context/useSectorContext', () => ({
  useSectorContext: vi.fn(),
}));

const mockSectorsResponse: SectorListResponse = {
  setores: [
    {
      id: 'sec-1',
      nome: 'Desenvolvimento Web',
      descricao: 'Projetos e plataformas web da organização.',
      ativo: true,
      criado_em: '2026-01-10T10:00:00Z',
      qtd_membros: 5,
      qtd_lideres: 1,
    },
    {
      id: 'sec-2',
      nome: 'Ciência de Dados',
      descricao: 'Modelagem preditiva e inteligência de negócios.',
      ativo: true,
      criado_em: '2026-01-15T10:00:00Z',
      qtd_membros: 3,
      qtd_lideres: 1,
    },
  ],
  total: 2,
  pagina: 1,
  limite: 12,
};

const renderSectorsCatalog = () => {
  return render(
    <MemoryRouter initialEntries={['/setores']}>
      <Routes>
        <Route path="/setores" element={<SectorsCatalog />} />
        <Route path="/setores/:sectorId" element={<div>Página Detalhes</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('SectorsCatalog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'u-1',
        global_role: '2fa85f64-5717-4562-b3fc-2c963f66afa3', // usuario
      } as User,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      registerUser: vi.fn(),
      logout: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [],
      mySectors: [],
      selectedSector: null,
      selectedSectorId: null,
      selectedSectorName: null,
      setSelectedSectorId: vi.fn(),
      isMemberOf: vi.fn().mockReturnValue(false),
      getMyRole: vi.fn().mockReturnValue(null),
      selectSector: vi.fn(),
      clearSelectedSector: vi.fn(),
      refreshSectors: vi.fn(),
      isLoading: false,
    });
  });

  it('exibe o catálogo com os cards dos setores carregados', async () => {
    vi.mocked(sectorsApi.list).mockResolvedValueOnce(mockSectorsResponse);

    renderSectorsCatalog();

    expect(screen.getByText('Carregando setores...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Desenvolvimento Web')).toBeInTheDocument();
      expect(screen.getByText('Ciência de Dados')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Projetos e plataformas web da organização.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Modelagem preditiva e inteligência de negócios.'),
    ).toBeInTheDocument();
  });

  it('exibe mensagem quando não há setores cadastrados', async () => {
    vi.mocked(sectorsApi.list).mockResolvedValueOnce({
      setores: [],
      total: 0,
      pagina: 1,
      limite: 12,
    });

    renderSectorsCatalog();

    await waitFor(() => {
      expect(screen.getByText('Nenhum setor cadastrado')).toBeInTheDocument();
    });
  });

  it('exibe estado de erro e permite tentar novamente', async () => {
    vi.mocked(sectorsApi.list)
      .mockRejectedValueOnce(new Error('Falha na conexão'))
      .mockResolvedValueOnce(mockSectorsResponse);

    renderSectorsCatalog();

    await waitFor(() => {
      expect(
        screen.getByText('Não foi possível carregar os setores'),
      ).toBeInTheDocument();
      expect(screen.getByText('Falha na conexão')).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Desenvolvimento Web')).toBeInTheDocument();
    });
  });
});
