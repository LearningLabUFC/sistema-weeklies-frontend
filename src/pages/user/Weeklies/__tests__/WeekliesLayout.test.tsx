import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLE_IDS } from '@/config/roles';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { assignmentsApi } from '@/features/weeklies/api/assignmentsApi';
import { warningsApi } from '@/features/weeklies/api/warningsApi';
import { useAuth } from '@/hooks/useAuth';
import WeekliesLayout from '@/pages/user/Weeklies/WeekliesLayout';
import type { User } from '@/types/user';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/sectors/context/useSectorContext', () => ({
  useSectorContext: vi.fn(),
}));

vi.mock('@/features/weeklies/api/warningsApi', () => ({
  warningsApi: {
    getMyWarnings: vi.fn(),
  },
}));

vi.mock('@/features/weeklies/api/assignmentsApi', () => ({
  assignmentsApi: {
    getMyAssignments: vi.fn(),
  },
}));

vi.mock('@/features/weeklies/components/WarningsList', () => ({
  WarningsList: ({ mode }: { mode: string }) => (
    <div data-testid={`warnings-list-${mode}`}>Lista de advertências</div>
  ),
}));

describe('WeekliesLayout Hub', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-1',
        nome_completo: 'Usuário Teste',
        email: 'teste@ufc.br',
        global_role: ROLE_IDS.USUARIO,
      } as unknown as User,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [
        {
          id: 'sec-1',
          nome: 'Back-end Python',
          descricao: 'API',
          ativo: true,
          criado_em: '2026-01-01',
          qtd_membros: 4,
          qtd_lideres: 1,
        },
      ],
      mySectors: [
        {
          id: 'sec-1',
          nome: 'Back-end Python',
          descricao: 'API',
          ativo: true,
          papel: 'membro',
        },
      ],
      selectedSectorId: 'sec-1',
      selectedSectorName: 'Back-end Python',
      selectedSector: {
        id: 'sec-1',
        nome: 'Back-end Python',
        descricao: 'API',
        ativo: true,
        criado_em: '2026-01-01',
        qtd_membros: 4,
        qtd_lideres: 1,
      },
      isMemberOf: vi.fn().mockReturnValue(true),
      getMyRole: vi.fn().mockReturnValue('membro'),
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    });

    vi.mocked(warningsApi.getMyWarnings).mockResolvedValue({
      advertencias: [],
      total: 0,
      pagina: 1,
      limite: 5,
    });

    vi.mocked(assignmentsApi.getMyAssignments).mockResolvedValue({
      atribuicoes: [],
      total: 3,
      pagina: 1,
      limite: 1,
    });
  });

  const renderHub = (initialEntry = '/weeklies') =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/weeklies" element={<WeekliesLayout />}>
            <Route index element={<div>Conteúdo Esta Semana</div>} />
            <Route path="historico" element={<div>Conteúdo Histórico</div>} />
            <Route path="tarefas" element={<div>Conteúdo Tarefas</div>} />
          </Route>
          <Route
            path="/minha-weekly"
            element={<Navigate to="/weeklies" replace />}
          />
          <Route
            path="/tarefas"
            element={<Navigate to="/weeklies/tarefas" replace />}
          />
        </Routes>
      </MemoryRouter>,
    );

  it('navega entre as abas Esta semana, Histórico e Tarefas via URL', async () => {
    const user = userEvent.setup();
    renderHub('/weeklies');

    expect(screen.getByText('Conteúdo Esta Semana')).toBeInTheDocument();
    expect(await screen.findByText('3')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /histórico/i }));
    expect(screen.getByText('Conteúdo Histórico')).toBeInTheDocument();

    await user.click(
      screen.getByRole('link', { name: /tarefas e colaboração/i }),
    );
    expect(screen.getByText('Conteúdo Tarefas')).toBeInTheDocument();
  });

  it('exibe banner colapsável de advertências quando existirem ocorrências', async () => {
    const user = userEvent.setup();
    vi.mocked(warningsApi.getMyWarnings).mockResolvedValue({
      advertencias: [],
      total: 2,
      pagina: 1,
      limite: 5,
    });

    renderHub('/weeklies');

    expect(
      await screen.findByText(/você possui 2 advertências registradas/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('warnings-list-me')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ver detalhes/i }));
    expect(screen.getByTestId('warnings-list-me')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ocultar/i }));
    expect(screen.queryByTestId('warnings-list-me')).not.toBeInTheDocument();
  });

  it('redireciona rotas legadas /minha-weekly e /tarefas para dentro do hub', async () => {
    const { unmount } = renderHub('/minha-weekly');
    await waitFor(() => {
      expect(screen.getByText('Conteúdo Esta Semana')).toBeInTheDocument();
    });
    unmount();

    renderHub('/tarefas');
    await waitFor(() => {
      expect(screen.getByText('Conteúdo Tarefas')).toBeInTheDocument();
    });
  });
});
