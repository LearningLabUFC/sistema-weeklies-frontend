import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionHistoryCollapsible } from '@/features/workSession/components/SessionHistoryCollapsible';
import { workSessionService } from '@/services/workSessionService';
import type { WorkSession } from '@/types/workSession';

vi.mock('@/services/workSessionService', () => ({
  workSessionService: {
    getHistory: vi.fn(),
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

  it('deve exibir mensagem apropriada quando a lista estiver vazia (edge case)', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: [],
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
    });

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    await waitFor(() => {
      expect(screen.getByText('Finalizada')).toBeInTheDocument();
    });
  });

  it('deve acionar busca ao clicar no filtro "Esta Semana"', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValue({
      sessoes: mockSessions,
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
        }),
      );
    });
  });

  it('deve recarregar automaticamente quando refreshTrigger mudar e o menu estiver aberto', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValue({
      sessoes: mockSessions,
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
});
