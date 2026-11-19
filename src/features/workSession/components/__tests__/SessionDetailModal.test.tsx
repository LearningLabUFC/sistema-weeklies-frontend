import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionDetailModal } from '@/features/workSession/components/SessionDetailModal';
import { workSessionService } from '@/services/workSessionService';
import type { WorkSessionDetail } from '@/types/workSession';

vi.mock('@/services/workSessionService', () => ({
  workSessionService: {
    getSessionById: vi.fn(),
  },
}));

describe('SessionDetailModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDetail: WorkSessionDetail = {
    id: 'session-123',
    usuario_id: 'user-1',
    setor_id: 'setor-dev',
    entrada_em: '2026-10-10T09:00:00Z',
    saida_em: '2026-10-10T17:30:00Z',
    expira_em: '2026-10-10T19:00:00Z',
    status: 'FINALIZADA',
    motivo_encerramento: 'MANUAL',
    tempo_trabalhado_segundos: 27000, // 7h 30m
    pausas: [
      {
        id: 'pause-1',
        sessao_id: 'session-123',
        inicio_em: '2026-10-10T12:00:00Z',
        fim_em: '2026-10-10T13:00:00Z',
      },
      {
        id: 'pause-2',
        sessao_id: 'session-123',
        inicio_em: '2026-10-10T15:30:00Z',
        fim_em: '2026-10-10T15:45:00Z',
      },
    ],
  };

  it('não deve renderizar dialog aberto quando isOpen for false', () => {
    render(
      <SessionDetailModal
        sessionId="session-123"
        isOpen={false}
        onClose={vi.fn()}
      />,
    );

    expect(screen.queryByText('Detalhes da Sessão')).not.toBeInTheDocument();
    expect(workSessionService.getSessionById).not.toHaveBeenCalled();
  });

  it('deve buscar e exibir detalhes completos da sessão quando aberto', async () => {
    vi.mocked(workSessionService.getSessionById).mockResolvedValueOnce(
      mockDetail,
    );

    render(
      <SessionDetailModal
        sessionId="session-123"
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Buscando detalhes da sessão...'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(workSessionService.getSessionById).toHaveBeenCalledWith(
        'session-123',
      );
      expect(screen.getByText('Detalhes da Sessão')).toBeInTheDocument();
      expect(screen.getByText('Finalizada')).toBeInTheDocument();
      expect(screen.getByText('7h 30m')).toBeInTheDocument();
      expect(screen.getByText('Saída manual registrada')).toBeInTheDocument();
      expect(screen.getByText('Intervalos Realizados (2)')).toBeInTheDocument();
      expect(screen.getByText('Total em pausa: 1h 15m')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem apropriada quando a sessão não possuir intervalos', async () => {
    const detailWithoutPauses: WorkSessionDetail = {
      ...mockDetail,
      pausas: [],
    };
    vi.mocked(workSessionService.getSessionById).mockResolvedValueOnce(
      detailWithoutPauses,
    );

    render(
      <SessionDetailModal
        sessionId="session-123"
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Intervalos Realizados (0)')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Nenhum intervalo foi registrado nesta jornada de trabalho.',
        ),
      ).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro e permitir tentar novamente quando a requisição falhar', async () => {
    vi.mocked(workSessionService.getSessionById).mockRejectedValueOnce({
      response: { data: { detail: 'Sessão não encontrada.' } },
    });

    render(
      <SessionDetailModal
        sessionId="session-123"
        isOpen={true}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Sessão não encontrada.')).toBeInTheDocument();
    });

    // Clica em tentar novamente
    vi.mocked(workSessionService.getSessionById).mockResolvedValueOnce(
      mockDetail,
    );
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    await waitFor(() => {
      expect(screen.getByText('7h 30m')).toBeInTheDocument();
    });
  });

  it('deve acionar onClose ao clicar no botão Fechar', async () => {
    vi.mocked(workSessionService.getSessionById).mockResolvedValueOnce(
      mockDetail,
    );
    const mockOnClose = vi.fn();

    render(
      <SessionDetailModal
        sessionId="session-123"
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Detalhes da Sessão')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: /fechar/i })[0]);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
