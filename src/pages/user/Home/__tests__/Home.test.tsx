import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLE_IDS } from '@/config/roles';
import { resetMockPresenceStore } from '@/features/presence/mock/presenceMock';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { assignmentsApi } from '@/features/weeklies/api/assignmentsApi';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { warningsApi } from '@/features/weeklies/api/warningsApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAuth } from '@/hooks/useAuth';
import Home from '@/pages/user/Home/Home';
import { workSessionService } from '@/services/workSessionService';
import type { User } from '@/types/user';
import type { WeeklyResponse } from '@/types/weeklies';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

vi.mock('@/features/sectors/context/useSectorContext', () => ({
  useSectorContext: vi.fn(),
}));

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: { getById: vi.fn() },
}));

vi.mock('@/features/weeklies/api/weekliesApi', () => ({
  weekliesApi: {
    getCurrentWeekly: vi.fn(),
    create: vi.fn(),
    getSectorWeeklies: vi.fn(),
  },
}));

vi.mock('@/features/weeklies/api/warningsApi', () => ({
  warningsApi: { getMyWarnings: vi.fn() },
}));

vi.mock('@/features/weeklies/api/assignmentsApi', () => ({
  assignmentsApi: { getMyAssignments: vi.fn() },
}));

vi.mock('@/features/weeklies/api/tasksApi', () => ({
  tasksApi: { getMyTasks: vi.fn() },
}));

vi.mock('@/services/workSessionService', () => ({
  workSessionService: {
    getCurrentSession: vi.fn(),
    getSummary: vi.fn(),
    startSession: vi.fn(),
    startPause: vi.fn(),
    endPause: vi.fn(),
    endSession: vi.fn(),
    continueSession: vi.fn(),
  },
}));

describe('Home Dashboard Page', () => {
  const mockWeekly: WeeklyResponse = {
    id: 'weekly-1',
    usuario_id: 'user-1',
    membro_nome: 'Maria Silva',
    setor_id: 'sec-1',
    semana_referencia: '2026-11-23',
    status: 'RASCUNHO',
    enviada_em: null,
    avaliada_em: null,
    avaliada_por: null,
    observacao_lider: null,
    motivo_expiracao: null,
    detalhe_expiracao: null,
    criado_em: '2026-11-18T10:00:00Z',
    atualizado_em: '2026-11-18T10:00:00Z',
    tasks: [
      {
        id: 'wt-1',
        task_id: 'task-1',
        titulo: 'Entregar API',
        descricao: null,
        status_task: 'PENDENTE',
        prazo_conclusao: null,
        concluida: true,
        impedimento: null,
        posicao: 1,
        origem: 'NOVA',
      },
      {
        id: 'wt-2',
        task_id: 'task-2',
        titulo: 'Escrever testes',
        descricao: null,
        status_task: 'PENDENTE',
        prazo_conclusao: null,
        concluida: false,
        impedimento: null,
        posicao: 2,
        origem: 'NOVA',
      },
    ],
  };

  const baseSectorContext = {
    sectors: [
      {
        id: 'sec-1',
        nome: 'Front-end React',
        descricao: 'Interface',
        ativo: true,
        criado_em: '2026-01-01',
        qtd_membros: 5,
        qtd_lideres: 1,
      },
    ],
    mySectors: [
      {
        id: 'sec-1',
        nome: 'Front-end React',
        descricao: 'Interface',
        ativo: true,
        papel: 'membro' as const,
      },
    ],
    selectedSectorId: 'sec-1',
    selectedSectorName: 'Front-end React',
    selectedSector: {
      id: 'sec-1',
      nome: 'Front-end React',
      descricao: 'Interface',
      ativo: true,
      criado_em: '2026-01-01',
      qtd_membros: 5,
      qtd_lideres: 1,
    },
    isMemberOf: vi.fn().mockReturnValue(true),
    getMyRole: vi.fn().mockReturnValue('membro'),
    selectSector: vi.fn(),
    setSelectedSectorId: vi.fn(),
    clearSelectedSector: vi.fn(),
    isLoading: false,
    refreshSectors: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetMockPresenceStore();

    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn(),
      hideAlertDialog: vi.fn(),
    });

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-1',
        nome_completo: 'Maria Silva',
        email: 'maria@ufc.br',
        meta_horas_semanais: 12,
        global_role: ROLE_IDS.USUARIO,
      } as unknown as User,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    vi.mocked(useSectorContext).mockReturnValue(baseSectorContext);
    vi.mocked(sectorsApi.getById).mockResolvedValue({ membros: [] } as never);
    vi.mocked(weekliesApi.getCurrentWeekly).mockResolvedValue(mockWeekly);
    vi.mocked(workSessionService.getCurrentSession).mockResolvedValue(null);
    vi.mocked(workSessionService.getSummary).mockResolvedValue({
      inicio: '2026-11-16T00:00:00Z',
      fim: '2026-11-22T23:59:59Z',
      tempo_trabalhado_segundos: 7200,
    });
    vi.mocked(warningsApi.getMyWarnings).mockResolvedValue({
      advertencias: [],
      total: 1,
      pagina: 1,
      limite: 5,
    });
    vi.mocked(assignmentsApi.getMyAssignments).mockResolvedValue({
      atribuicoes: [],
      total: 2,
      pagina: 1,
      limite: 5,
    });
    vi.mocked(tasksApi.getMyTasks).mockResolvedValue({
      tasks: [
        {
          id: 't-overdue',
          usuario_id: 'user-1',
          setor_id: 'sec-1',
          origem_task_id: null,
          titulo: 'Tarefa atrasada',
          descricao: null,
          status: 'PENDENTE',
          prazo_conclusao: '2020-01-01',
          entrada_auditoria_em: null,
          criado_em: '2020-01-01T00:00:00Z',
          atualizado_em: '2020-01-01T00:00:00Z',
        },
      ],
      total: 1,
      pagina: 1,
      limite: 50,
    });
  });

  const renderHome = () =>
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/weeklies" element={<div>Editor Weekly</div>} />
          <Route
            path="/setores/:sectorId/acompanhamento"
            element={<div>Acompanhamento Setor</div>}
          />
        </Routes>
      </MemoryRouter>,
    );

  it('renderiza resumo da weekly, ponto rápido, pendências e histórico mockado de presença', async () => {
    renderHome();

    expect(await screen.findByText('Olá, Maria')).toBeInTheDocument();
    expect(await screen.findByText('Continuar editando')).toBeInTheDocument();
    expect(screen.getByText('Esta semana:')).toBeInTheDocument();
    expect(screen.getByText('2h 00m')).toBeInTheDocument();

    // Presença: chamada aberta + 3 últimas reuniões
    expect(
      screen.getByLabelText(/palavra-chave da chamada/i),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('presence-recent-item')).toHaveLength(3);
    expect(screen.getByText('Reunião Geral Quinzenal #08')).toBeInTheDocument();
    expect(screen.getByText('Reunião Geral Quinzenal #07')).toBeInTheDocument();

    // Pendências
    expect(
      await screen.findByText(/1 advertência registrada/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/2 convites aguardando resposta/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 tarefa com prazo vencido/i)).toBeInTheDocument();

    // Usuário não é líder: card de liderança não aparece
    expect(
      screen.queryByText(/Liderança — Weeklies para Avaliar/i),
    ).not.toBeInTheDocument();
  });

  it('permite iniciar o ponto rápido e confirmar presença no card do dashboard', async () => {
    const user = userEvent.setup();
    vi.mocked(workSessionService.startSession).mockResolvedValueOnce({
      id: 'sess-1',
      usuario_id: 'user-1',
      setor_id: 'sec-1',
      entrada_em: new Date().toISOString(),
      saida_em: null,
      expira_em: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      status: 'ATIVA',
      motivo_encerramento: null,
      tempo_trabalhado_segundos: 0,
    });

    renderHome();

    const startBtn = await screen.findByRole('button', {
      name: /iniciar ponto/i,
    });
    await user.click(startBtn);
    expect(workSessionService.startSession).toHaveBeenCalledWith('sec-1');

    // Testa palavra incorreta e depois correta no card de presença
    const keywordInput = screen.getByLabelText(/palavra-chave da chamada/i);
    await user.type(keywordInput, 'errada');
    await user.click(screen.getByRole('button', { name: /^Confirmar$/i }));
    expect(
      await screen.findByText(/palavra-chave incorreta/i),
    ).toBeInTheDocument();

    await user.clear(keywordInput);
    await user.type(keywordInput, 'learninglab');
    await user.click(screen.getByRole('button', { name: /^Confirmar$/i }));

    expect(
      await screen.findByText(/presença confirmada hoje às/i),
    ).toBeInTheDocument();
  });

  it('exibe card de Liderança quando usuário for líder de setor e permite criar weekly quando 404', async () => {
    const user = userEvent.setup();
    vi.mocked(useSectorContext).mockReturnValue({
      ...baseSectorContext,
      mySectors: [
        {
          id: 'sec-1',
          nome: 'Front-end React',
          descricao: 'Interface',
          ativo: true,
          papel: 'lider' as const,
        },
      ],
    });
    vi.mocked(weekliesApi.getCurrentWeekly).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404, data: { detail: 'Não encontrada' } },
    });
    vi.mocked(weekliesApi.getSectorWeeklies).mockResolvedValueOnce({
      weeklies: [],
      total: 3,
      pagina: 1,
      limite: 1,
    });
    vi.mocked(weekliesApi.create).mockResolvedValueOnce(mockWeekly);

    renderHome();

    expect(
      await screen.findByText(/Liderança — Weeklies para Avaliar/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/3 weeklies aguardando/i),
    ).toBeInTheDocument();

    const createBtn = await screen.findByRole('button', {
      name: /criar weekly da semana/i,
    });
    await user.click(createBtn);

    await waitFor(() => {
      expect(weekliesApi.create).toHaveBeenCalledWith({ setor_id: 'sec-1' });
      expect(screen.getByText('Editor Weekly')).toBeInTheDocument();
    });
  });
});
