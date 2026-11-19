import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { TimeClockTracker } from '@/features/workSession/components/TimeClockTracker';
import { workSessionService } from '@/services/workSessionService';
import type {
  Pause,
  WorkSession,
  WorkSessionDetail,
} from '@/types/workSession';

vi.mock('@/services/workSessionService', () => ({
  workSessionService: {
    getCurrentSession: vi.fn(),
    startSession: vi.fn(),
    startPause: vi.fn(),
    endPause: vi.fn(),
    endSession: vi.fn(),
    continueSession: vi.fn(),
  },
}));

vi.mock('@/features/sectors/context/useSectorContext', () => ({
  useSectorContext: vi.fn(),
}));

describe('TimeClockTracker Component', () => {
  const mockSector = {
    id: 'sector-1',
    nome: 'Desenvolvimento',
    descricao: 'Setor de dev',
    ativo: true,
    papel: 'membro' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [
        {
          id: 'sector-1',
          nome: 'Desenvolvimento',
          descricao: 'Setor de dev',
          ativo: true,
          criado_em: '2026-01-01',
          qtd_membros: 5,
          qtd_lideres: 1,
        },
      ],
      mySectors: [mockSector],
      selectedSectorId: 'sector-1',
      selectedSectorName: 'Desenvolvimento',
      selectedSector: null,
      isMemberOf: vi.fn().mockReturnValue(true),
      getMyRole: vi.fn().mockReturnValue('membro'),
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    });
  });

  const mockActiveSession: WorkSessionDetail = {
    id: 'session-123',
    usuario_id: 'user-1',
    setor_id: 'sector-1',
    entrada_em: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hora atrás
    saida_em: null,
    expira_em: new Date(Date.now() + 7 * 3600 * 1000).toISOString(),
    status: 'ATIVA',
    motivo_encerramento: null,
    tempo_trabalhado_segundos: 3600,
    pausas: [],
  };

  const mockPausedSession: WorkSessionDetail = {
    ...mockActiveSession,
    status: 'EM_PAUSA',
    pausas: [
      {
        id: 'pause-1',
        sessao_id: 'session-123',
        inicio_em: new Date(Date.now() - 600 * 1000).toISOString(),
        fim_em: null,
      },
    ],
  };

  describe('Estado Inicial / Sem Sessão', () => {
    it('deve renderizar estado sem sessão aberta com cronômetro zerado e botões corretos', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        null,
      );

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(screen.getByText('Sem sessão aberta')).toBeInTheDocument();
      });

      expect(screen.getByText('00:00:00')).toBeInTheDocument();

      const btnIniciar = screen.getByRole('button', { name: /iniciar/i });
      const btnPausar = screen.getByRole('button', { name: /pausar/i });
      const btnTerminar = screen.getByRole('button', { name: /terminar/i });

      expect(btnIniciar).toBeEnabled();
      expect(btnPausar).toBeDisabled();
      expect(btnTerminar).toBeDisabled();
    });

    it('deve desabilitar botão Iniciar e exibir aviso quando o usuário não tiver setores ativos', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        null,
      );
      vi.mocked(useSectorContext).mockReturnValue({
        sectors: [],
        mySectors: [],
        selectedSectorId: null,
        selectedSectorName: null,
        selectedSector: null,
        isMemberOf: vi.fn().mockReturnValue(false),
        getMyRole: vi.fn().mockReturnValue(null),
        selectSector: vi.fn(),
        setSelectedSectorId: vi.fn(),
        clearSelectedSector: vi.fn(),
        isLoading: false,
        refreshSectors: vi.fn(),
      });

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Você não está vinculado a nenhum setor ativo no momento.',
          ),
        ).toBeInTheDocument();
      });

      const btnIniciar = screen.getByRole('button', { name: /iniciar/i });
      expect(btnIniciar).toBeDisabled();
    });

    it('deve exibir mensagem de erro amigável quando falhar a busca inicial', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockRejectedValueOnce({
        response: { data: { detail: 'Falha de conexão com a API' } },
      });

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(
          screen.getByText('Falha de conexão com a API'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Iniciar Sessão (Happy Path e Erro 409)', () => {
    it('deve iniciar sessão com sucesso ao clicar em Iniciar enviando setor_id selecionado', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        null,
      );
      const newSession: WorkSession = {
        id: 'session-new',
        usuario_id: 'user-1',
        setor_id: 'sector-1',
        entrada_em: new Date().toISOString(),
        saida_em: null,
        expira_em: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        status: 'ATIVA',
        motivo_encerramento: null,
        tempo_trabalhado_segundos: 0,
      };
      vi.mocked(workSessionService.startSession).mockResolvedValueOnce(
        newSession,
      );

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /iniciar/i })).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));

      await waitFor(() => {
        expect(workSessionService.startSession).toHaveBeenCalledTimes(1);
        expect(workSessionService.startSession).toHaveBeenCalledWith(
          'sector-1',
        );
        expect(
          screen.getByText('Entrada registrada com sucesso!'),
        ).toBeInTheDocument();
        expect(screen.getByText(/Em andamento \(ATIVA\)/i)).toBeInTheDocument();
      });
    });

    it('deve exibir erro quando houver conflito de sessão aberta (409)', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        null,
      );
      vi.mocked(workSessionService.startSession).mockRejectedValueOnce({
        response: { data: { detail: 'Você já possui uma sessão aberta.' } },
      });

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /iniciar/i })).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /iniciar/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Você já possui uma sessão aberta.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Controle de Pausas (Pausar e Retomar)', () => {
    it('deve iniciar pausa alterando estado para EM_PAUSA e botão para Retomar', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        mockActiveSession,
      );
      const novaPausa: Pause = {
        id: 'pause-new',
        sessao_id: 'session-123',
        inicio_em: new Date().toISOString(),
        fim_em: null,
      };
      vi.mocked(workSessionService.startPause).mockResolvedValueOnce(novaPausa);

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pausar/i })).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /pausar/i }));

      await waitFor(() => {
        expect(workSessionService.startPause).toHaveBeenCalledWith(
          'session-123',
        );
        expect(screen.getByText('Intervalo iniciado')).toBeInTheDocument();
        expect(
          screen.getByText(/Em Intervalo \(EM_PAUSA\)/i),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /retomar/i }),
        ).toBeInTheDocument();
      });
    });

    it('deve retomar o trabalho encerrando a pausa ativa', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        mockPausedSession,
      );
      const pausaFinalizada: Pause = {
        id: 'pause-1',
        sessao_id: 'session-123',
        inicio_em: mockPausedSession.pausas[0].inicio_em,
        fim_em: new Date().toISOString(),
      };
      vi.mocked(workSessionService.endPause).mockResolvedValueOnce(
        pausaFinalizada,
      );

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retomar/i })).toBeEnabled();
      });

      fireEvent.click(screen.getByRole('button', { name: /retomar/i }));

      await waitFor(() => {
        expect(workSessionService.endPause).toHaveBeenCalledWith(
          'session-123',
          'pause-1',
        );
        expect(screen.getByText('Intervalo finalizado')).toBeInTheDocument();
        expect(screen.getByText(/Em andamento \(ATIVA\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Finalizar Sessão (Terminar com Diálogo de Confirmação)', () => {
    it('deve abrir diálogo de confirmação e registrar saída ao confirmar', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        mockActiveSession,
      );
      const sessionFinalizada: WorkSession = {
        ...mockActiveSession,
        saida_em: new Date().toISOString(),
        status: 'FINALIZADA',
        motivo_encerramento: 'MANUAL',
        tempo_trabalhado_segundos: 3600,
      };
      vi.mocked(workSessionService.endSession).mockResolvedValueOnce(
        sessionFinalizada,
      );
      const mockOnSessionEnded = vi.fn();

      render(<TimeClockTracker onSessionEnded={mockOnSessionEnded} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /terminar/i })).toBeEnabled();
      });

      // Clica para abrir o AlertDialog
      fireEvent.click(screen.getByRole('button', { name: /terminar/i }));

      // Confirma no modal
      expect(screen.getByText('Registrar Saída')).toBeInTheDocument();
      const btnConfirmar = screen.getByRole('button', {
        name: /confirmar saída/i,
      });
      fireEvent.click(btnConfirmar);

      await waitFor(() => {
        expect(workSessionService.endSession).toHaveBeenCalledWith(
          'session-123',
        );
        expect(screen.getByText('Saída registrada!')).toBeInTheDocument();
        expect(mockOnSessionEnded).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Cálculo de Horas e Cronômetro em Tempo Real', () => {
    it('deve atualizar o cronômetro com base no tempo decorrido para sessão ATIVA', async () => {
      vi.useFakeTimers();

      const startTime = new Date('2026-10-15T10:00:00Z').getTime();
      vi.setSystemTime(startTime);

      const sessaoAtiva: WorkSessionDetail = {
        id: 'session-timer',
        usuario_id: 'user-1',
        setor_id: 'sector-1',
        entrada_em: new Date(startTime).toISOString(),
        saida_em: null,
        expira_em: new Date(startTime + 8 * 3600 * 1000).toISOString(),
        status: 'ATIVA',
        motivo_encerramento: null,
        tempo_trabalhado_segundos: 0,
        pausas: [],
      };

      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        sessaoAtiva,
      );

      render(<TimeClockTracker />);

      // Aguarda resolução da promise
      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.getByText('00:00:00')).toBeInTheDocument();

      // Avança 15 segundos no tempo simulado
      act(() => {
        vi.advanceTimersByTime(15000);
      });

      expect(screen.getByText('00:00:15')).toBeInTheDocument();

      vi.useRealTimers();
    });

    it('deve exibir o nome do setor em badge e detalhes quando houver sessão ativa', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        mockActiveSession,
      );

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(
          screen.getAllByText('Desenvolvimento').length,
        ).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Prorrogar Sessão (PATCH /work-sessions/{id}/continue)', () => {
    it('deve prorrogar sessão com sucesso ao clicar no botão Prorrogar', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        mockActiveSession,
      );
      const prorrogada: WorkSession = {
        ...mockActiveSession,
        expira_em: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
      };
      vi.mocked(workSessionService.continueSession).mockResolvedValueOnce(
        prorrogada,
      );

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /prorrogar \(\+2h\)/i }),
        ).toBeEnabled();
      });

      fireEvent.click(
        screen.getByRole('button', { name: /prorrogar \(\+2h\)/i }),
      );

      await waitFor(() => {
        expect(workSessionService.continueSession).toHaveBeenCalledWith(
          'session-123',
        );
        expect(screen.getByText('Jornada prorrogada!')).toBeInTheDocument();
      });
    });

    it('deve exibir aviso quando a API retornar 409 fora da janela de 10 min', async () => {
      vi.mocked(workSessionService.getCurrentSession).mockResolvedValueOnce(
        mockActiveSession,
      );
      vi.mocked(workSessionService.continueSession).mockRejectedValueOnce({
        response: {
          data: {
            detail:
              'A sessão só pode ser prorrogada nos últimos 10 minutos antes da expiração.',
          },
        },
      });

      render(<TimeClockTracker />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /prorrogar \(\+2h\)/i }),
        ).toBeEnabled();
      });

      fireEvent.click(
        screen.getByRole('button', { name: /prorrogar \(\+2h\)/i }),
      );

      await waitFor(() => {
        expect(
          screen.getByText(
            'A sessão só pode ser prorrogada nos últimos 10 minutos antes da expiração.',
          ),
        ).toBeInTheDocument();
      });
    });
  });
});
