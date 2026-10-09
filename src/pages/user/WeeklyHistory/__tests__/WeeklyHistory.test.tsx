import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlertDialogProvider } from '@/context/AlertDialogProvider';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import WeeklyHistory from '@/pages/user/WeeklyHistory/WeeklyHistory';
import type { WeeklyListResponse } from '@/types/weeklies';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<AlertDialogProvider>{ui}</AlertDialogProvider>);
};

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: {
    list: vi.fn(),
  },
}));

vi.mock('@/features/weeklies/api/weekliesApi', () => ({
  weekliesApi: {
    getMyWeeklies: vi.fn(),
    getById: vi.fn(),
    submit: vi.fn(),
    reopen: vi.fn(),
    updateTask: vi.fn(),
    removeTask: vi.fn(),
  },
}));

describe('WeeklyHistory', () => {
  const mockWeekliesResponse: WeeklyListResponse = {
    total: 2,
    pagina: 1,
    limite: 10,
    weeklies: [
      {
        id: 'w-1',
        usuario_id: 'u-1',
        membro_nome: 'Leo Dev',
        setor_id: 'sec-1',
        semana_referencia: '2026-09-28',
        status: 'APROVADA',
        enviada_em: '2026-09-28T18:00:00Z',
        total_tasks: 3,
        total_concluidas: 3,
        total_impedimentos: 0,
        motivo_expiracao: null,
        criado_em: '2026-09-25T08:00:00Z',
      },
      {
        id: 'w-2',
        usuario_id: 'u-1',
        membro_nome: 'Leo Dev',
        setor_id: 'sec-1',
        semana_referencia: '2026-09-21',
        status: 'ENVIADA',
        enviada_em: '2026-09-21T17:00:00Z',
        total_tasks: 2,
        total_concluidas: 1,
        total_impedimentos: 1,
        motivo_expiracao: null,
        criado_em: '2026-09-18T08:00:00Z',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sectorsApi.list).mockResolvedValue({
      setores: [
        {
          id: 'sec-1',
          nome: 'Tecnologia',
          descricao: 'Setor de TI',
          ativo: true,
          qtd_membros: 5,
          qtd_lideres: 1,
          criado_em: '2026-01-01T00:00:00Z',
        },
      ],
      total: 1,
      pagina: 1,
      limite: 100,
    });
  });

  it('lista weeklies do usuário consumindo W01 com contadores e status', async () => {
    vi.mocked(weekliesApi.getMyWeeklies).mockResolvedValue(
      mockWeekliesResponse,
    );

    renderWithProviders(<WeeklyHistory />);

    expect(screen.getByTestId('weeklies-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Semana de 28/09/2026')).toBeInTheDocument();
      expect(screen.getByText('Semana de 21/09/2026')).toBeInTheDocument();
    });

    expect(screen.getByText('Aprovada')).toBeInTheDocument();
    expect(screen.getByText('Enviada')).toBeInTheDocument();
    expect(weekliesApi.getMyWeeklies).toHaveBeenCalledWith({
      pagina: 1,
      limite: 10,
      setor_id: undefined,
      status: undefined,
    });
  });

  it('permite abrir o modal de detalhe da weekly', async () => {
    vi.mocked(weekliesApi.getMyWeeklies).mockResolvedValue(
      mockWeekliesResponse,
    );
    vi.mocked(weekliesApi.getById).mockResolvedValue({
      ...mockWeekliesResponse.weeklies[0],
      avaliada_em: null,
      avaliada_por: null,
      observacao_lider: null,
      detalhe_expiracao: null,
      atualizado_em: '2026-09-28T18:00:00Z',
      tasks: [],
    });

    renderWithProviders(<WeeklyHistory />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /ver detalhes/i }),
      ).toHaveLength(2);
    });

    fireEvent.click(
      screen.getAllByRole('button', { name: /ver detalhes/i })[0],
    );

    await waitFor(() => {
      expect(weekliesApi.getById).toHaveBeenCalledWith('w-1');
    });
  });

  it('oferece botão de recuperação sem filtro caso consulta por setor falhe (ex: perda de vínculo)', async () => {
    vi.mocked(weekliesApi.getMyWeeklies).mockRejectedValue(
      new Error('Vínculo com o setor não encontrado'),
    );

    renderWithProviders(<WeeklyHistory />);

    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao carregar histórico de weeklies/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('Vínculo com o setor não encontrado'),
    ).toBeInTheDocument();
  });
});
