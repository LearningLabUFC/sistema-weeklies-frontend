import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import Dashboard from '@/pages/admin/Dashboard/Dashboard';
import type { GlobalDashboardResponse } from '@/types/weeklies';

vi.mock('@/features/dashboard/api/dashboardApi', () => ({
  dashboardApi: {
    getGlobalDashboard: vi.fn(),
  },
}));

const mockGlobalDashboard: GlobalDashboardResponse = {
  semana_referencia: '2026-09-28',
  total_setores: 2,
  total_membros: 12,
  total_weeklies_enviadas: 10,
  total_weeklies_aprovadas: 8,
  total_weeklies_rejeitadas: 1,
  total_weeklies_expiradas: 1,
  total_weeklies_rascunho: 2,
  taxa_submissao_geral_percentual: 83,
  total_tasks_em_auditoria: 3,
  total_impedimentos: 2,
  setores: [
    {
      setor_id: 'sec-eng',
      setor_nome: 'Engenharia de Software',
      semana_referencia: '2026-09-28',
      total_membros: 8,
      weeklies_enviadas: 7,
      weeklies_aprovadas: 6,
      weeklies_rejeitadas: 1,
      weeklies_expiradas: 0,
      weeklies_rascunho: 1,
      taxa_submissao_percentual: 88,
      total_tasks: 25,
      tasks_concluidas: 15,
      tasks_pendentes: 8,
      tasks_em_auditoria: 2,
      total_impedimentos: 1,
    },
    {
      setor_id: 'sec-des',
      setor_nome: 'Design UI/UX',
      semana_referencia: '2026-09-28',
      total_membros: 4,
      weeklies_enviadas: 3,
      weeklies_aprovadas: 2,
      weeklies_rejeitadas: 0,
      weeklies_expiradas: 1,
      weeklies_rascunho: 1,
      taxa_submissao_percentual: 75,
      total_tasks: 10,
      tasks_concluidas: 6,
      tasks_pendentes: 3,
      tasks_em_auditoria: 1,
      total_impedimentos: 1,
    },
  ],
};

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('Admin Dashboard (D02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carrega e renderiza métricas globais e lista de setores via D02', async () => {
    vi.mocked(dashboardApi.getGlobalDashboard).mockResolvedValue(
      mockGlobalDashboard,
    );

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      // Metric cards
      expect(screen.getByText('Setores Cadastrados')).toBeInTheDocument();
      expect(screen.getByText('Vínculos em Setores')).toBeInTheDocument();
      expect(screen.getByText('Taxa Geral de Submissão')).toBeInTheDocument();
      expect(screen.getByText('Tarefas em Auditoria')).toBeInTheDocument();
      expect(screen.getByText('Impedimentos Ativos')).toBeInTheDocument();

      // Values
      expect(screen.getByText('83%')).toBeInTheDocument();
      expect(screen.getByText('Engenharia de Software')).toBeInTheDocument();
      expect(screen.getByText('Design UI/UX')).toBeInTheDocument();
    });

    // Check action links to sector tracking and admin sector details
    const trackLinks = screen.getAllByRole('link', { name: /acompanhar/i });
    expect(trackLinks).toHaveLength(2);
    expect(trackLinks[0]).toHaveAttribute(
      'href',
      '/setores/sec-eng/acompanhamento',
    );
    expect(trackLinks[1]).toHaveAttribute(
      'href',
      '/setores/sec-des/acompanhamento',
    );
  });

  it('permite alterar a semana de referência no seletor e recarregar dados', async () => {
    vi.mocked(dashboardApi.getGlobalDashboard).mockResolvedValue(
      mockGlobalDashboard,
    );

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Engenharia de Software')).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/semana de referência/i);
    fireEvent.change(select, { target: { value: '2026-09-21' } });

    await waitFor(() => {
      expect(dashboardApi.getGlobalDashboard).toHaveBeenCalledWith({
        semana_referencia: '2026-09-21',
      });
    });
  });

  it('exibe estado de erro e permite tentar novamente', async () => {
    vi.mocked(dashboardApi.getGlobalDashboard).mockRejectedValue(
      new Error('Erro interno ao consolidar métricas.'),
    );

    renderWithRouter(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByText('Erro ao carregar dashboard global'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Erro interno ao consolidar métricas.'),
      ).toBeInTheDocument();
    });

    // Retry
    vi.mocked(dashboardApi.getGlobalDashboard).mockResolvedValue(
      mockGlobalDashboard,
    );
    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Engenharia de Software')).toBeInTheDocument();
    });
  });
});
