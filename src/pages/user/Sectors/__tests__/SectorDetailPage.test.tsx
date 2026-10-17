import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { useAuth } from '@/hooks/useAuth';
import SectorDetailPage from '@/pages/user/Sectors/SectorDetailPage';
import type { SectorDetail } from '@/types/sectors';
import type { User } from '@/types/user';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: {
    getById: vi.fn(),
  },
}));

vi.mock('@/features/sectors/context/useSectorContext', () => ({
  useSectorContext: vi.fn(),
}));

const mockSector: SectorDetail = {
  id: 'sec-123',
  nome: 'Inteligência Artificial',
  descricao: 'Frente focada em modelos de linguagem e visão computacional.',
  ativo: true,
  criado_em: '2026-02-15T10:00:00Z',
  membros: [
    {
      id: 'lider-1',
      nome_completo: 'Alice Líder',
      email: 'alice@lab.ufc.br',
      papel: 'lider',
    },
    {
      id: 'membro-1',
      nome_completo: 'Bob Silva',
      email: 'bob@lab.ufc.br',
      papel: 'membro',
    },
    {
      id: 'membro-2',
      nome_completo: 'Carlos Santos',
      email: 'carlos@lab.ufc.br',
      papel: 'membro',
    },
  ],
};

const renderSectorDetailPage = (sectorId = 'sec-123') => {
  return render(
    <MemoryRouter initialEntries={[`/setores/${sectorId}`]}>
      <Routes>
        <Route path="/setores/:sectorId" element={<SectorDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('SectorDetailPage', () => {
  const mockSelectSector = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(sectorsApi.getById).mockResolvedValue(mockSector);

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-ext',
        nome_completo: 'Externo',
        email: 'externo@lab.ufc.br',
        global_role: 'usuario',
      } as unknown as User,
      isAuthenticated: true,
      logout: vi.fn(),
      login: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      checkUserStatus: vi.fn(),
    });

    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [],
      mySectors: [],
      isMemberOf: vi.fn().mockReturnValue(false),
      getMyRole: vi.fn().mockReturnValue(null),
      selectedSectorId: null,
      selectedSectorName: null,
      selectedSector: null,
      selectSector: mockSelectSector,
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    });
  });

  it('renderiza os dados do setor, métricas, líderes e integrantes para usuário externo', async () => {
    renderSectorDetailPage();

    await waitFor(() => {
      expect(screen.getByText('Inteligência Artificial')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Frente focada em modelos de linguagem e visão computacional.',
      ),
    ).toBeInTheDocument();

    // Líder exibido
    expect(screen.getByText('Alice Líder')).toBeInTheDocument();
    expect(screen.getByText('alice@lab.ufc.br')).toBeInTheDocument();

    // Integrantes exibidos
    expect(screen.getByText('Bob Silva')).toBeInTheDocument();
    expect(screen.getByText('Carlos Santos')).toBeInTheDocument();

    // Status externo
    expect(
      screen.getByText(/Setor Externo \(Você não faz parte desta equipe\)/i),
    ).toBeInTheDocument();

    // Botão de contatar liderança para usuários externos
    expect(screen.getByText('Contatar Liderança')).toBeInTheDocument();
  });

  it('exibe badge e botão de Weekly quando usuário é membro da equipe', async () => {
    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [],
      mySectors: [
        {
          id: 'sec-123',
          nome: 'Inteligência Artificial',
          descricao: null,
          ativo: true,
          papel: 'membro',
        },
      ],
      isMemberOf: vi.fn((id: string) => id === 'sec-123'),
      getMyRole: vi.fn((id: string) => (id === 'sec-123' ? 'membro' : null)),
      selectedSectorId: null,
      selectedSectorName: null,
      selectedSector: null,
      selectSector: mockSelectSector,
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    });

    renderSectorDetailPage();

    await waitFor(() => {
      expect(
        screen.getByText(/Você é Membro deste Setor/i),
      ).toBeInTheDocument();
    });

    const weeklyBtn = screen.getByText('Ir para Minhas Weeklies');
    expect(weeklyBtn).toBeInTheDocument();

    fireEvent.click(weeklyBtn);
    expect(mockSelectSector).toHaveBeenCalledWith(
      'sec-123',
      'Inteligência Artificial',
    );
  });

  it('permite buscar integrantes por nome ou e-mail', async () => {
    renderSectorDetailPage();

    await waitFor(() => {
      expect(screen.getByText('Bob Silva')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Buscar membro por nome ou e-mail...',
    );

    // Filtra por "Carlos"
    fireEvent.change(searchInput, { target: { value: 'carlos' } });

    expect(screen.getByText('Carlos Santos')).toBeInTheDocument();
    expect(screen.queryByText('Bob Silva')).not.toBeInTheDocument();

    // Filtra por termo sem correspondência
    fireEvent.change(searchInput, { target: { value: 'inexistente' } });
    expect(
      screen.getByText(/Nenhum integrante encontrado para "inexistente"/i),
    ).toBeInTheDocument();
  });

  it('exibe estado de erro e botão de tentar novamente', async () => {
    vi.mocked(sectorsApi.getById).mockRejectedValueOnce(
      new Error('Erro de conexão com o servidor.'),
    );

    renderSectorDetailPage();

    await waitFor(() => {
      expect(
        screen.getByText('Não foi possível carregar o setor'),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('Erro de conexão com o servidor.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });
});
