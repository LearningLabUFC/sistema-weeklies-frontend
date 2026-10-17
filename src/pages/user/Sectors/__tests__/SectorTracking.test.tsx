import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlertDialogProvider } from '@/context/AlertDialogProvider';
import { dashboardApi } from '@/features/dashboard/api/dashboardApi';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { useAuth } from '@/hooks/useAuth';
import SectorTracking from '@/pages/user/Sectors/SectorTracking';
import type {
  SectorDashboardResponse,
  TaskListResponse,
  WeeklyListResponse,
} from '@/types/weeklies';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/dashboard/api/dashboardApi', () => ({
  dashboardApi: {
    getSectorDashboard: vi.fn(),
  },
}));

vi.mock('@/features/weeklies/api/weekliesApi', () => ({
  weekliesApi: {
    getSectorWeeklies: vi.fn(),
    getById: vi.fn(),
    evaluate: vi.fn(),
  },
}));

vi.mock('@/features/weeklies/api/tasksApi', () => ({
  tasksApi: {
    getSectorAuditTasks: vi.fn(),
    conclude: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderSectorTracking = (sectorId = 'sec-test') => {
  return render(
    <AlertDialogProvider>
      <MemoryRouter initialEntries={[`/setores/${sectorId}/acompanhamento`]}>
        <Routes>
          <Route
            path="/setores/:sectorId/acompanhamento"
            element={<SectorTracking />}
          />
        </Routes>
      </MemoryRouter>
    </AlertDialogProvider>,
  );
};

describe('SectorTracking Page', () => {
  const mockDashboard: SectorDashboardResponse = {
    setor_id: 'sec-test',
    setor_nome: 'Inteligência Artificial',
    semana_referencia: '2026-09-28',
    total_membros: 5,
    weeklies_enviadas: 4,
    weeklies_aprovadas: 2,
    weeklies_rejeitadas: 1,
    weeklies_expiradas: 0,
    weeklies_rascunho: 1,
    taxa_submissao_percentual: 80,
    total_tasks: 12,
    tasks_concluidas: 8,
    tasks_pendentes: 3,
    tasks_em_auditoria: 2,
    total_impedimentos: 1,
  };

  const mockWeeklies: WeeklyListResponse = {
    weeklies: [
      {
        id: 'w-1',
        usuario_id: 'u-other-member',
        membro_nome: 'Ana Costa',
        setor_id: 'sec-test',
        semana_referencia: '2026-09-28',
        status: 'ENVIADA',
        enviada_em: '2026-09-28T18:00:00Z',
        total_tasks: 3,
        total_concluidas: 2,
        total_impedimentos: 1,
        motivo_expiracao: null,
        criado_em: '2026-09-25T10:00:00Z',
      },
      {
        id: 'w-2',
        usuario_id: 'u-logged-user',
        membro_nome: 'Líder Usuário',
        setor_id: 'sec-test',
        semana_referencia: '2026-09-28',
        status: 'ENVIADA',
        enviada_em: '2026-09-28T17:30:00Z',
        total_tasks: 2,
        total_concluidas: 1,
        total_impedimentos: 0,
        motivo_expiracao: null,
        criado_em: '2026-09-25T09:00:00Z',
      },
    ],
    total: 2,
    pagina: 1,
    limite: 10,
  };

  const mockAuditTasks: TaskListResponse = {
    tasks: [
      {
        id: 't-audit-1',
        usuario_id: 'u-other-member',
        setor_id: 'sec-test',
        origem_task_id: null,
        titulo: 'Revisar modelo de NLP',
        descricao: 'Validação da acurácia do pipeline',
        status: 'EM_AUDITORIA',
        prazo_conclusao: '2026-10-05',
        entrada_auditoria_em: '2026-09-29T12:00:00Z',
        criado_em: '2026-09-24T10:00:00Z',
        atualizado_em: '2026-09-29T12:00:00Z',
      },
    ],
    total: 1,
    pagina: 1,
    limite: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'u-logged-user',
        nome_completo: 'Líder Usuário',
        email: 'lider@example.com',
        global_role: 'usuario',
        matricula: '12345',
        data_nascimento: '2000-01-01',
        data_ingresso: '2026-01-01',
        meta_horas_semanais: 20,
        foto_perfil: '',
        curso_id: 'c-1',
        status_id: 's-1',
      },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      registerUser: vi.fn(),
      logout: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    vi.mocked(dashboardApi.getSectorDashboard).mockResolvedValue(mockDashboard);
    vi.mocked(weekliesApi.getSectorWeeklies).mockResolvedValue(mockWeeklies);
    vi.mocked(tasksApi.getSectorAuditTasks).mockResolvedValue(mockAuditTasks);
  });

  it('exibe estado de acesso restrito quando D01 retornar 403 / isForbidden', async () => {
    const forbiddenError = {
      isAxiosError: true,
      name: 'AxiosError',
      message: 'Acesso restrito ao setor',
      response: {
        status: 403,
        data: { detail: 'Acesso restrito ao setor' },
      },
    };
    vi.mocked(dashboardApi.getSectorDashboard).mockRejectedValue(
      forbiddenError,
    );

    renderSectorTracking();

    await waitFor(() => {
      expect(screen.getByTestId('access-denied-state')).toBeInTheDocument();
    });

    expect(screen.getByText('Acesso restrito')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Esta área é reservada para líderes do setor e administradores do sistema.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /voltar para setores/i }),
    ).toBeInTheDocument();
  });

  it('renderiza métricas do setor via D01 e lista weeklies via W07', async () => {
    renderSectorTracking();

    expect(screen.getByTestId('sector-tracking-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Inteligência Artificial')).toBeInTheDocument();
    });

    expect(screen.getAllByText(/28\/09\/2026/i).length).toBeGreaterThan(0);
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText(/4 enviadas de 5 membros/i)).toBeInTheDocument();

    // Weeklies list in Tab 1
    await waitFor(() => {
      expect(screen.getByText('Ana Costa')).toBeInTheDocument();
      expect(screen.getByText('Líder Usuário')).toBeInTheDocument();
    });

    // Ana Costa's weekly can be evaluated by leader
    const evaluateButtons = screen.getAllByRole('button', {
      name: /avaliar/i,
    });
    // First button (Ana Costa) is enabled
    expect(evaluateButtons[0]).not.toBeDisabled();

    // Second button (Líder Usuário - self weekly) is disabled
    expect(evaluateButtons[1]).toBeDisabled();
    expect(screen.getByText('Sua Weekly')).toBeInTheDocument();
  });

  it('permite alternar para a aba de auditoria e lista tarefas via T06', async () => {
    renderSectorTracking();

    await waitFor(() => {
      expect(screen.getByText('Inteligência Artificial')).toBeInTheDocument();
    });

    const auditTabBtn = screen.getByRole('button', {
      name: /fila de auditoria/i,
    });
    fireEvent.click(auditTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Revisar modelo de NLP')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Validação da acurácia do pipeline'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Autor: u-other-member/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /prorrogar prazo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /concluir/i }),
    ).toBeInTheDocument();
  });
});
