import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SessionSummaryCollapsible } from '@/features/workSession/components/SessionSummaryCollapsible';
import { useAuth } from '@/hooks/useAuth';
import { workSessionService } from '@/services/workSessionService';
import type { WorkSessionSummaryResponse } from '@/types/workSession';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/workSessionService', () => ({
  workSessionService: {
    getSummary: vi.fn(),
  },
}));

describe('SessionSummaryCollapsible Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-1',
        nome_completo: 'Aluno Teste',
        email: 'aluno@learninglab.com',
        matricula: '123456',
        data_nascimento: '2000-01-01',
        data_ingresso: '2023-01-01',
        meta_horas_semanais: 20, // Meta de 20h semanais
        foto_perfil: '',
        curso_id: 'curso-1',
        status_id: 'ativo-1',
        global_role: 'aluno',
      },
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      isAuthenticated: true,
      checkUserStatus: vi.fn(),
    });
  });

  const mockSummary: WorkSessionSummaryResponse = {
    usuario_id: 'user-1',
    inicio: '2026-10-12T00:00:00Z',
    fim: '2026-10-18T23:59:59Z',
    tempo_trabalhado_segundos: 36000, // 10h (50% de 20h)
  };

  it('deve buscar e exibir o resumo e a barra de progresso da meta ao expandir', async () => {
    vi.mocked(workSessionService.getSummary).mockResolvedValueOnce(mockSummary);

    render(<SessionSummaryCollapsible />);

    expect(workSessionService.getSummary).not.toHaveBeenCalled();

    // Expande o menu retrátil
    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(workSessionService.getSummary).toHaveBeenCalledTimes(1);
      expect(screen.getAllByText('10h 00m')[0]).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('50% concluído')).toBeInTheDocument();
      expect(screen.getByText('/ 20h')).toBeInTheDocument();
    });
  });

  it('deve alternar para filtro de mês e buscar novo resumo', async () => {
    vi.mocked(workSessionService.getSummary).mockResolvedValue(mockSummary);

    render(<SessionSummaryCollapsible />);

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(screen.getAllByText('10h 00m')[0]).toBeInTheDocument();
    });

    // Clica no botão "Este Mês"
    fireEvent.click(screen.getByRole('button', { name: /este mês/i }));

    await waitFor(() => {
      expect(workSessionService.getSummary).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Total em Horas Decimais')).toBeInTheDocument();
    });
  });

  it('deve exibir indicador de erro com opção de tentar novamente', async () => {
    vi.mocked(workSessionService.getSummary).mockRejectedValueOnce({
      response: { data: { detail: 'Não foi possível carregar o resumo.' } },
    });

    render(<SessionSummaryCollapsible />);

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Não foi possível carregar o resumo.'),
      ).toBeInTheDocument();
    });

    vi.mocked(workSessionService.getSummary).mockResolvedValueOnce(mockSummary);

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    await waitFor(() => {
      expect(screen.getAllByText('10h 00m')[0]).toBeInTheDocument();
    });
  });

  it('deve exibir indicador de "Meta atingida!" quando ultrapassar ou igualar 100%', async () => {
    const metaAtingidaSummary: WorkSessionSummaryResponse = {
      ...mockSummary,
      tempo_trabalhado_segundos: 72000, // 20h
    };
    vi.mocked(workSessionService.getSummary).mockResolvedValue(
      metaAtingidaSummary,
    );

    render(<SessionSummaryCollapsible />);

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(screen.getByText('Meta atingida!')).toBeInTheDocument();
    });
  });
});
