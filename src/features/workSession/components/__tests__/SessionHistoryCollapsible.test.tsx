import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SectorContext } from '@/features/sectors/context/sectorContextDef';
import { SessionHistoryCollapsible } from '@/features/workSession/components/SessionHistoryCollapsible';
import { workSessionService } from '@/services/workSessionService';
import type { WorkSession } from '@/types/workSession';

vi.mock('@/services/workSessionService', () => ({
  workSessionService: {
    getHistory: vi.fn(),
    getSessionById: vi.fn(),
  },
}));

describe('SessionHistoryCollapsible Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSessions: WorkSession[] = [
    {
      id: 'session-1',
      usuario_id: 'user-1',
      setor_id: 'sector-dev',
      entrada_em: '2026-10-10T09:00:00Z',
      saida_em: '2026-10-10T13:00:00Z',
      expira_em: '2026-10-10T17:00:00Z',
      status: 'FINALIZADA',
      motivo_encerramento: 'MANUAL',
      tempo_trabalhado_segundos: 14400, // 4h
    },
    {
      id: 'session-2',
      usuario_id: 'user-1',
      setor_id: 'sector-design',
      entrada_em: '2026-10-11T14:00:00Z',
      saida_em: null,
      expira_em: '2026-10-11T22:00:00Z',
      status: 'ATIVA',
      motivo_encerramento: null,
      tempo_trabalhado_segundos: 1800, // 30m
    },
  ];

  it('deve iniciar fechado e buscar dados somente ao ser expandido (lazy loading)', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: mockSessions,
      total: 2,
      pagina: 1,
      limite: 5,
    });

    render(<SessionHistoryCollapsible />);

    // Antes de clicar, não deve ter chamado a API
    expect(workSessionService.getHistory).not.toHaveBeenCalled();

    // Clica no gatilho do collapsible
    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      expect(workSessionService.getHistory).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Finalizada')).toBeInTheDocument();
      expect(screen.getByText('Ativa')).toBeInTheDocument();
    });
  });

  it('deve exibir nome/identificação do setor em cada linha da sessão', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: mockSessions,
      total: 2,
      pagina: 1,
      limite: 5,
    });

    render(<SessionHistoryCollapsible />);

    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      // Quando não há contexto mockado de setor, usa fallback amigável "Setor vinculado"
      const sectorBadges = screen.getAllByText('Setor vinculado');
      expect(sectorBadges.length).toBe(2);
    });
  });

  it('deve exibir mensagem apropriada quando a lista estiver vazia (edge case)', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: [],
      total: 0,
      pagina: 1,
      limite: 5,
    });

    render(<SessionHistoryCollapsible />);

    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText('Nenhuma sessão encontrada para este período'),
      ).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro e permitir tentar novamente quando a API falhar', async () => {
    vi.mocked(workSessionService.getHistory).mockRejectedValueOnce({
      response: { data: { detail: 'Erro interno ao consultar histórico.' } },
    });

    render(<SessionHistoryCollapsible />);

    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText('Erro interno ao consultar histórico.'),
      ).toBeInTheDocument();
    });

    // Clica em Tentar novamente
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: mockSessions,
      total: 2,
      pagina: 1,
      limite: 5,
    });

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    await waitFor(() => {
      expect(screen.getByText('Finalizada')).toBeInTheDocument();
    });
  });

  it('deve acionar busca com período ao clicar no filtro "Esta Semana"', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValue({
      sessoes: mockSessions,
      total: 2,
      pagina: 1,
      limite: 5,
    });

    render(<SessionHistoryCollapsible />);

    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('Finalizada')).toBeInTheDocument();
    });

    // Clica em "Esta Semana"
    fireEvent.click(screen.getByRole('button', { name: /esta semana/i }));

    await waitFor(() => {
      expect(workSessionService.getHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          inicio: expect.any(String),
          fim: expect.any(String),
          pagina: 1,
          limite: 5,
        }),
      );
    });
  });

  it('deve suportar paginação navegando para a próxima página', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: mockSessions,
      total: 25,
      pagina: 1,
      limite: 5,
    });

    render(<SessionHistoryCollapsible />);

    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('Finalizada')).toBeInTheDocument();
      expect(screen.getByText(/Exibindo/i)).toBeInTheDocument();
    });

    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: mockSessions,
      total: 25,
      pagina: 2,
      limite: 5,
    });

    const btnNext = screen.getByRole('button', { name: /próxima/i });
    expect(btnNext).toBeEnabled();
    fireEvent.click(btnNext);

    await waitFor(() => {
      expect(workSessionService.getHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          pagina: 2,
          limite: 5,
        }),
      );
    });
  });

  it('deve recarregar automaticamente quando refreshTrigger mudar e o menu estiver aberto', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValue({
      sessoes: mockSessions,
      total: 2,
      pagina: 1,
      limite: 5,
    });

    const { rerender } = render(
      <SessionHistoryCollapsible refreshTrigger={0} />,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      expect(workSessionService.getHistory).toHaveBeenCalledTimes(1);
    });

    // Simula término de sessão alterando refreshTrigger para 1
    rerender(<SessionHistoryCollapsible refreshTrigger={1} />);

    await waitFor(() => {
      expect(workSessionService.getHistory).toHaveBeenCalledTimes(2);
    });
  });

  it('deve abrir o modal de detalhes ao clicar no botão Detalhes de uma sessão', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: mockSessions,
      total: 2,
      pagina: 1,
      limite: 5,
    });
    vi.mocked(workSessionService.getSessionById).mockResolvedValueOnce({
      ...mockSessions[0],
      setor_id: 'sector-dev',
      pausas: [],
    });

    render(<SessionHistoryCollapsible />);

    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /detalhes/i }).length,
      ).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /detalhes/i })[0]);

    await waitFor(() => {
      expect(workSessionService.getSessionById).toHaveBeenCalled();
      expect(screen.getByText('Detalhes da Sessão')).toBeInTheDocument();
    });
  });

  it('não deve exibir setores alheios da organização para membro sem vínculos e sem sessões', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: [],
      total: 0,
      pagina: 1,
      limite: 5,
    });

    const mockSectorContextValue = {
      sectors: [
        {
          id: 'setor-dev',
          nome: 'Desenvolvimento',
          descricao: '',
          criado_em: '',
          atualizado_em: '',
          ativo: true,
          qtd_membros: 0,
          qtd_lideres: 0,
        },
      ],
      mySectors: [],
      isMemberOf: vi.fn(),
      getMyRole: vi.fn(),
      selectedSectorId: null,
      selectedSectorName: null,
      selectedSector: null,
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    };

    render(
      <SectorContext.Provider value={mockSectorContextValue}>
        <SessionHistoryCollapsible />
      </SectorContext.Provider>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      expect(screen.getByText('Nenhum setor vinculado')).toBeInTheDocument();
      expect(screen.queryByText('Desenvolvimento')).not.toBeInTheDocument();
    });

    const sectorTrigger = screen.getAllByRole('combobox')[0];
    expect(sectorTrigger).toBeDisabled();
  });

  it('deve incluir setores históricos onde o membro trabalhou mesmo se não estiver mais vinculado', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: [
        {
          id: 'sess-passada',
          usuario_id: 'user-1',
          setor_id: 'setor-antigo-id',
          entrada_em: '2026-09-01T09:00:00Z',
          saida_em: '2026-09-01T17:00:00Z',
          expira_em: '2026-09-01T17:00:00Z',
          status: 'FINALIZADA',
          motivo_encerramento: 'MANUAL',
          tempo_trabalhado_segundos: 28800,
        },
      ],
      total: 1,
      pagina: 1,
      limite: 5,
    });

    const mockSectorContextValue = {
      sectors: [
        {
          id: 'setor-antigo-id',
          nome: 'Setor Antigo Trabalhado',
          descricao: '',
          criado_em: '',
          atualizado_em: '',
          ativo: true,
          qtd_membros: 0,
          qtd_lideres: 0,
        },
        {
          id: 'setor-alheio',
          nome: 'Setor Alheio Nunca Trabalhado',
          descricao: '',
          criado_em: '',
          atualizado_em: '',
          ativo: true,
          qtd_membros: 0,
          qtd_lideres: 0,
        },
      ],
      mySectors: [], // Atualmente desvinculado
      isMemberOf: vi.fn(),
      getMyRole: vi.fn(),
      selectedSectorId: null,
      selectedSectorName: null,
      selectedSector: null,
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    };

    render(
      <SectorContext.Provider value={mockSectorContextValue}>
        <SessionHistoryCollapsible />
      </SectorContext.Provider>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    );

    await waitFor(() => {
      // O select de setor deve estar habilitado porque há histórico no Setor Antigo
      const sectorTrigger = screen.getAllByRole('combobox')[0];
      expect(sectorTrigger).not.toBeDisabled();
    });

    const sectorTrigger = screen.getAllByRole('combobox')[0];
    fireEvent.click(sectorTrigger);

    // Deve encontrar o Setor Antigo Trabalhado
    expect(
      await screen.findByRole('option', { name: 'Setor Antigo Trabalhado' }),
    ).toBeInTheDocument();

    // NÃO deve encontrar o Setor Alheio
    expect(
      screen.queryByRole('option', { name: 'Setor Alheio Nunca Trabalhado' }),
    ).not.toBeInTheDocument();
  });
});
