import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SectorContext } from '@/features/sectors/context/sectorContextDef';
import { api } from '@/lib/api';
import { HourReport } from '@/pages/admin/HourReport/HourReport';
import { workSessionService } from '@/services/workSessionService';
import type {
  MetricsSectorsResponse,
  MetricsSummaryResponse,
  MetricsTimelineResponse,
  MetricsUsersResponse,
} from '@/types/workSession';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock('@/services/workSessionService', () => ({
  workSessionService: {
    getMetricsSummary: vi.fn(),
    getMetricsUsers: vi.fn(),
    getMetricsSectors: vi.fn(),
    getMetricsTimeline: vi.fn(),
    getSummary: vi.fn(),
    getHistory: vi.fn(),
    getSessionById: vi.fn(),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: {
      id: 'admin-user-id',
      nome: 'Admin Master',
      email: 'admin@empresa.com',
      role: { nome: 'ADMIN' },
    },
    isAuthenticated: true,
    isAdmin: true,
  }),
}));

const mockSectors = [
  {
    id: 'sec-dev-1',
    nome: 'Desenvolvimento',
    descricao: 'Time de Dev',
    criado_em: '2026-01-01',
    atualizado_em: '2026-01-01',
    ativo: true,
    qtd_membros: 0,
    qtd_lideres: 0,
  },
  {
    id: 'sec-design-2',
    nome: 'Design UI/UX',
    descricao: 'Time de Design',
    criado_em: '2026-01-01',
    atualizado_em: '2026-01-01',
    ativo: true,
    qtd_membros: 0,
    qtd_lideres: 0,
  },
];

const mockSectorContextValue = {
  sectors: mockSectors,
  mySectors: [
    {
      id: 'sec-dev-1',
      nome: 'Desenvolvimento',
      descricao: 'Time de Dev',
      papel: 'lider' as const,
      criado_em: '2026-01-01',
      ativo: true,
    },
  ],
  isMemberOf: vi.fn(),
  getMyRole: vi.fn(),
  selectedSectorId: null,
  selectedSectorName: null,
  selectedSector: null,
  selectSector: vi.fn(),
  setSelectedSectorId: vi.fn(),
  clearSelectedSector: vi.fn(),
  isLoading: false,
  refreshSectors: vi.fn().mockResolvedValue(undefined),
};

const mockMetrics: MetricsSummaryResponse = {
  inicio: '2026-10-19T00:00:00.000Z',
  fim: '2026-10-25T23:59:59.999Z',
  usuario_id: null,
  setor_id: null,
  tempo_trabalhado_segundos: 288000, // 80h
  tempo_pausado_segundos: 18000, // 5h
  sessoes_iniciadas: 20,
  usuarios_com_tempo_trabalhado: 5,
};

const mockUsersMetrics: MetricsUsersResponse = {
  inicio: '2026-10-19T00:00:00.000Z',
  fim: '2026-10-25T23:59:59.999Z',
  pagina: 1,
  limite: 10,
  total: 2,
  usuarios: [
    {
      usuario_id: 'user-uuid-1',
      nome_completo: 'Alice Dev',
      tempo_trabalhado_segundos: 72000, // 20h
      tempo_pausado_segundos: 3600, // 1h
      sessoes_iniciadas: 5,
    },
    {
      usuario_id: 'user-uuid-2',
      nome_completo: 'Bob Designer',
      tempo_trabalhado_segundos: 36000, // 10h
      tempo_pausado_segundos: 1800, // 30m
      sessoes_iniciadas: 3,
    },
  ],
};

const mockSectorsMetrics: MetricsSectorsResponse = {
  inicio: '2026-10-19T00:00:00.000Z',
  fim: '2026-10-25T23:59:59.999Z',
  pagina: 1,
  limite: 10,
  total: 2,
  setores: [
    {
      setor_id: 'sec-dev-1',
      setor_nome: 'Desenvolvimento',
      tempo_trabalhado_segundos: 216000, // 60h
      tempo_pausado_segundos: 14400, // 4h
      sessoes_iniciadas: 15,
      usuarios_com_tempo_trabalhado: 3,
    },
    {
      setor_id: 'sec-design-2',
      setor_nome: 'Design UI/UX',
      tempo_trabalhado_segundos: 54000, // 15h
      tempo_pausado_segundos: 3600, // 1h
      sessoes_iniciadas: 5,
      usuarios_com_tempo_trabalhado: 2,
    },
  ],
};

const mockTimelineMetrics: MetricsTimelineResponse = {
  inicio: '2026-10-19T00:00:00.000Z',
  fim: '2026-10-25T23:59:59.999Z',
  agrupamento: 'dia',
  fuso: 'America/Sao_Paulo',
  intervalos: [
    {
      inicio: '2026-10-19T00:00:00-03:00',
      fim: '2026-10-20T00:00:00-03:00',
      tempo_trabalhado_segundos: 28800, // 8h
      tempo_pausado_segundos: 3600, // 1h
    },
    {
      inicio: '2026-10-20T00:00:00-03:00',
      fim: '2026-10-21T00:00:00-03:00',
      tempo_trabalhado_segundos: 32400, // 9h
      tempo_pausado_segundos: 1800, // 30m
    },
  ],
};

function renderHourReport() {
  return render(
    <SectorContext.Provider value={mockSectorContextValue}>
      <HourReport />
    </SectorContext.Provider>,
  );
}

describe('HourReport Admin Page (Metrics Summary & Users Breakdown)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({
      data: { usuarios: [] },
    });
    vi.mocked(workSessionService.getMetricsSummary).mockResolvedValue(
      mockMetrics,
    );
    vi.mocked(workSessionService.getMetricsUsers).mockResolvedValue(
      mockUsersMetrics,
    );
    vi.mocked(workSessionService.getMetricsSectors).mockResolvedValue(
      mockSectorsMetrics,
    );
    vi.mocked(workSessionService.getMetricsTimeline).mockResolvedValue(
      mockTimelineMetrics,
    );
  });

  it('deve carregar e renderizar os cards de métricas executivas da semana atual', async () => {
    renderHourReport();

    // Loading skeleton initial presence
    expect(screen.getByTestId('hour-report-loading')).toBeInTheDocument();

    // Wait for metrics to load
    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });

    // Verify executive metric cards
    expect(
      screen.getAllByText('Tempo Trabalhado').length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/80.0 horas líquidas computadas/i),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/Colaboradores Ativos/i).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(
      screen.getByText(/Membros com registro no período/i),
    ).toBeInTheDocument();

    expect(screen.getByText(/Sessões de Ponto/i)).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(
      screen.getByText(/Total de jornadas iniciadas/i),
    ).toBeInTheDocument();

    expect(screen.getByText('Tempo em Pausas')).toBeInTheDocument();
    expect(screen.getByText('5h 00m')).toBeInTheDocument();
    expect(screen.getByText(/5.0 horas em intervalos/i)).toBeInTheDocument();

    // Verify productivity indicators:
    expect(screen.getByText('16h 00m')).toBeInTheDocument();
    expect(screen.getAllByText('4h 00m').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('5.9%')).toBeInTheDocument();
  });

  it('deve alternar para o preset "Este Mês" e refazer as consultas de resumo e usuários', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });

    const monthButton = screen.getByRole('button', { name: /este mês/i });
    fireEvent.click(monthButton);

    await waitFor(() => {
      expect(workSessionService.getMetricsSummary).toHaveBeenCalledTimes(2);
      expect(workSessionService.getMetricsUsers).toHaveBeenCalledTimes(2);
      expect(workSessionService.getMetricsSectors).toHaveBeenCalledTimes(2);
      expect(workSessionService.getMetricsTimeline).toHaveBeenCalledTimes(2);
    });
  });

  it('deve alternar para o preset "Últimos 30 Dias" e refazer a consulta', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });

    const last30Button = screen.getByRole('button', {
      name: /últimos 30 dias/i,
    });
    fireEvent.click(last30Button);

    await waitFor(() => {
      expect(workSessionService.getMetricsSummary).toHaveBeenCalledTimes(2);
      expect(workSessionService.getMetricsUsers).toHaveBeenCalledTimes(2);
      expect(workSessionService.getMetricsSectors).toHaveBeenCalledTimes(2);
      expect(workSessionService.getMetricsTimeline).toHaveBeenCalledTimes(2);
    });
  });

  it('deve alternar para o preset "Personalizado" e exibir campos de data', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });

    const customButton = screen.getByRole('button', {
      name: /personalizado/i,
    });
    fireEvent.click(customButton);

    expect(screen.getByLabelText(/data inicial/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data final/i)).toBeInTheDocument();
  });

  it('deve filtrar por colaborador selecionado e chamar a API com usuario_id', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('collaborator-autocomplete-input');
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, {
      target: { value: 'Alice' },
    });
    expect(searchInput).toHaveValue('Alice');

    const aliceOption = await screen.findByRole('option', {
      name: /Alice Dev/i,
    });
    fireEvent.click(aliceOption);

    await waitFor(() => {
      expect(workSessionService.getMetricsSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: 'user-uuid-1',
        }),
      );
      expect(workSessionService.getMetricsUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: 'user-uuid-1',
        }),
      );
      expect(workSessionService.getMetricsSectors).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: 'user-uuid-1',
        }),
      );
      expect(workSessionService.getMetricsTimeline).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: 'user-uuid-1',
        }),
      );
    });

    expect(searchInput).toHaveValue('Alice Dev');
    expect(screen.getByText(/Filtrado por: Alice Dev/i)).toBeInTheDocument();
  });

  it('deve abrir o modal de detalhamento de sessões ao clicar em "Detalhar Sessões"', async () => {
    vi.mocked(workSessionService.getHistory).mockResolvedValueOnce({
      sessoes: [
        {
          id: 'sess-test-1',
          usuario_id: 'user-uuid-1',
          setor_id: 'sec-dev-1',
          entrada_em: '2026-10-20T09:00:00Z',
          saida_em: '2026-10-20T17:00:00Z',
          expira_em: '2026-10-20T17:00:00Z',
          status: 'FINALIZADA',
          motivo_encerramento: 'MANUAL',
          tempo_trabalhado_segundos: 25200,
        },
      ],
      total: 1,
      pagina: 1,
      limite: 50,
    });

    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('Alice Dev')).toBeInTheDocument();
    });

    const detailButtons = screen.getAllByRole('button', {
      name: /detalhar sessões/i,
    });
    expect(detailButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(detailButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Sessões de Alice Dev/i)).toBeInTheDocument();
    });

    expect(workSessionService.getHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        usuario_id: 'user-uuid-1',
      }),
    );

    // Permitir filtrar o painel a partir do modal
    const filterFromModalBtn = screen.getByRole('button', {
      name: /filtrar painel por este colaborador/i,
    });
    fireEvent.click(filterFromModalBtn);

    await waitFor(() => {
      expect(screen.getByText(/Filtrado por: Alice Dev/i)).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro e permitir tentar novamente quando a API falhar', async () => {
    vi.mocked(workSessionService.getMetricsSummary).mockRejectedValueOnce(
      new Error('Acesso restrito a administradores.'),
    );

    renderHourReport();

    await waitFor(() => {
      expect(
        screen.getByText('Acesso restrito a administradores.'),
      ).toBeInTheDocument();
    });

    // Mock success on retry
    vi.mocked(workSessionService.getMetricsSummary).mockResolvedValueOnce(
      mockMetrics,
    );

    const retryButton = screen.getByRole('button', {
      name: /tentar novamente/i,
    });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });
  });

  it('deve limpar os filtros ao clicar no botão "Limpar Filtros"', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('collaborator-autocomplete-input');
    fireEvent.change(searchInput, {
      target: { value: 'Alice' },
    });
    expect(searchInput).toHaveValue('Alice');

    const clearButton = screen.getByRole('button', {
      name: /limpar filtros/i,
    });
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue('');
  });

  it('não deve exibir administradores e super_admins nas sugestões de colaboradores', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        usuarios: [
          {
            id: 'user-regular-1',
            nome_completo: 'Juliana Colaboradora',
            email: 'juliana@empresa.com',
            role_nome: 'usuario',
          },
          {
            id: 'user-admin-1',
            nome_completo: 'Carlos Administrador',
            email: 'carlos@empresa.com',
            role_nome: 'admin',
          },
          {
            id: 'user-super-1',
            nome_completo: 'Diana SuperAdmin',
            email: 'diana@empresa.com',
            role_nome: 'super_admin',
          },
        ],
      },
    });

    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });

    // Chama o endpoint de users com filtro de role=usuario
    expect(api.get).toHaveBeenCalledWith(
      '/admin/users?status=ativo&role=usuario&limite=100',
    );

    // Foca no input de busca para abrir as sugestões
    const searchInput = screen.getByTestId('collaborator-autocomplete-input');
    fireEvent.focus(searchInput);

    // Abre a lista de sugestões flutuante
    await waitFor(() => {
      expect(
        screen.getByTestId('collaborator-suggestions-list'),
      ).toBeInTheDocument();
    });

    // Colaborador elegível DEVE estar presente
    expect(screen.getByText('Juliana Colaboradora')).toBeInTheDocument();

    // Admin e Super Admin NÃO devem estar presentes nas sugestões
    expect(screen.queryByText('Carlos Administrador')).not.toBeInTheDocument();
    expect(screen.queryByText('Diana SuperAdmin')).not.toBeInTheDocument();
  });

  it('deve permitir limpar a seleção de colaborador pelo botão "X" do campo de busca', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('collaborator-autocomplete-input');
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, {
      target: { value: 'Alice' },
    });

    const aliceOption = await screen.findByRole('option', {
      name: /Alice Dev/i,
    });
    fireEvent.click(aliceOption);

    expect(searchInput).toHaveValue('Alice Dev');

    // Clica no botão X do input
    const clearInputBtn = screen.getByTestId('collaborator-autocomplete-clear');
    fireEvent.click(clearInputBtn);

    expect(searchInput).toHaveValue('');
    await waitFor(() => {
      expect(workSessionService.getMetricsSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: undefined,
        }),
      );
    });
  });

  it('deve exibir mensagem de estado vazio no dropdown quando a busca não encontrar ninguém', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('80h 00m')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('collaborator-autocomplete-input');
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, {
      target: { value: 'Inexistente XYZ' },
    });

    await waitFor(() => {
      expect(screen.getByTestId('collaborator-no-results')).toBeInTheDocument();
      expect(
        screen.getByText(/Nenhum colaborador elegível encontrado/i),
      ).toBeInTheDocument();
    });
  });

  it('deve renderizar a tabela de desempenho por colaborador com dados de GET /work-sessions/metrics/users', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(
        screen.getByText('Desempenho por Colaborador'),
      ).toBeInTheDocument();
      expect(screen.getByText('Alice Dev')).toBeInTheDocument();
      expect(screen.getByText('Bob Designer')).toBeInTheDocument();
    });

    // Verify individual collaborator hours and session badges scoped to users card
    const usersCard = screen.getByTestId('users-metrics-card');
    expect(within(usersCard).getByText('20h 00m')).toBeInTheDocument();
    expect(within(usersCard).getByText('10h 00m')).toBeInTheDocument();
    expect(within(usersCard).getByText(/5 jornadas/i)).toBeInTheDocument();
    expect(within(usersCard).getByText(/3 jornadas/i)).toBeInTheDocument();

    // Verify footer summary count
    expect(
      within(usersCard).getByText(/Exibindo 2 de 2 colaboradores/i),
    ).toBeInTheDocument();
  });

  it('deve permitir paginar para a próxima página de colaboradores', async () => {
    // Return total = 15 so there are 2 pages (limite = 10)
    vi.mocked(workSessionService.getMetricsUsers).mockResolvedValueOnce({
      ...mockUsersMetrics,
      total: 15,
      limite: 10,
    });

    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('Alice Dev')).toBeInTheDocument();
    });

    const usersCard = screen.getByTestId('users-metrics-card');
    const nextButton = within(usersCard).getByRole('button', {
      name: /próxima/i,
    });
    expect(nextButton).toBeEnabled();

    // Next page mock
    vi.mocked(workSessionService.getMetricsUsers).mockResolvedValueOnce({
      ...mockUsersMetrics,
      pagina: 2,
      total: 15,
      usuarios: [
        {
          usuario_id: 'user-uuid-3',
          nome_completo: 'Carol Backend',
          tempo_trabalhado_segundos: 14400,
          tempo_pausado_segundos: 0,
          sessoes_iniciadas: 2,
        },
      ],
    });

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(workSessionService.getMetricsUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          pagina: 2,
        }),
      );
    });
  });

  it('deve exibir mensagem de estado vazio quando não houver colaboradores com atividade', async () => {
    vi.mocked(workSessionService.getMetricsUsers).mockResolvedValueOnce({
      ...mockUsersMetrics,
      total: 0,
      usuarios: [],
    });

    renderHourReport();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Nenhum colaborador com atividade registrada no período selecionado/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('deve renderizar a tabela de desempenho por setor com dados de GET /work-sessions/metrics/sectors', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('Desempenho por Setor')).toBeInTheDocument();
      expect(screen.getByText('Desenvolvimento')).toBeInTheDocument();
      expect(screen.getByText('Design UI/UX')).toBeInTheDocument();
    });

    expect(screen.getByText('60h 00m')).toBeInTheDocument();
    expect(screen.getByText(/3 membros/i)).toBeInTheDocument();
    expect(screen.getByText(/15 jornadas/i)).toBeInTheDocument();
    expect(screen.getByText(/Exibindo 2 de 2 setores/i)).toBeInTheDocument();
  });

  it('deve filtrar por setor ao clicar em "Filtrar Setor" na tabela de setores', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('Desempenho por Setor')).toBeInTheDocument();
    });

    const filterSectorBtns = screen.getAllByRole('button', {
      name: /filtrar setor/i,
    });
    expect(filterSectorBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(filterSectorBtns[0]);

    await waitFor(() => {
      expect(workSessionService.getMetricsSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          setor_id: 'sec-dev-1',
        }),
      );
      expect(workSessionService.getMetricsUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          setor_id: 'sec-dev-1',
        }),
      );
      expect(workSessionService.getMetricsSectors).toHaveBeenCalledWith(
        expect.objectContaining({
          setor_id: 'sec-dev-1',
        }),
      );
    });
  });

  it('deve permitir paginar para a próxima página de setores', async () => {
    vi.mocked(workSessionService.getMetricsSectors).mockResolvedValueOnce({
      ...mockSectorsMetrics,
      total: 15,
      limite: 10,
    });

    renderHourReport();

    await waitFor(() => {
      expect(screen.getByText('Desenvolvimento')).toBeInTheDocument();
    });

    const sectorsCard = screen.getByTestId('sectors-metrics-card');
    const nextButton = within(sectorsCard).getByRole('button', {
      name: /próxima/i,
    });
    expect(nextButton).toBeEnabled();

    vi.mocked(workSessionService.getMetricsSectors).mockResolvedValueOnce({
      ...mockSectorsMetrics,
      pagina: 2,
      total: 15,
      setores: [
        {
          setor_id: 'sec-infra-3',
          setor_nome: 'Infraestrutura',
          tempo_trabalhado_segundos: 36000,
          tempo_pausado_segundos: 1800,
          sessoes_iniciadas: 4,
          usuarios_com_tempo_trabalhado: 2,
        },
      ],
    });

    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(workSessionService.getMetricsSectors).toHaveBeenCalledWith(
        expect.objectContaining({
          pagina: 2,
        }),
      );
    });
  });

  it('deve exibir mensagem de estado vazio quando não houver setores com atividade', async () => {
    vi.mocked(workSessionService.getMetricsSectors).mockResolvedValueOnce({
      ...mockSectorsMetrics,
      total: 0,
      setores: [],
    });

    renderHourReport();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Nenhum setor com atividade registrada no período selecionado/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('deve renderizar o card de evolução temporal com dados de GET /work-sessions/metrics/timeline', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(
        screen.getByText('Evolução Temporal do Expediente'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Horas Trabalhadas')).toBeInTheDocument();
    expect(screen.getByText('Pausas / Intervalos')).toBeInTheDocument();
    expect(screen.getByText('America/Sao_Paulo')).toBeInTheDocument();
    expect(screen.getByText(/2 dias/i)).toBeInTheDocument();
  });

  it('deve alterar o agrupamento da timeline para "Semanal" e chamar a API', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(
        screen.getByText('Evolução Temporal do Expediente'),
      ).toBeInTheDocument();
    });

    const timelineCard = screen.getByTestId('timeline-metrics-card');
    const weeklyBtn = within(timelineCard).getByRole('button', {
      name: /semanal/i,
    });
    fireEvent.click(weeklyBtn);

    await waitFor(() => {
      expect(workSessionService.getMetricsTimeline).toHaveBeenCalledWith(
        expect.objectContaining({
          agrupamento: 'semana',
        }),
      );
    });
  });

  it('deve alterar o agrupamento da timeline para "Mensal" e chamar a API', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(
        screen.getByText('Evolução Temporal do Expediente'),
      ).toBeInTheDocument();
    });

    const timelineCard = screen.getByTestId('timeline-metrics-card');
    const monthlyBtn = within(timelineCard).getByRole('button', {
      name: /mensal/i,
    });
    fireEvent.click(monthlyBtn);

    await waitFor(() => {
      expect(workSessionService.getMetricsTimeline).toHaveBeenCalledWith(
        expect.objectContaining({
          agrupamento: 'mes',
        }),
      );
    });
  });

  it('deve exibir mensagem de estado vazio quando não houver intervalos na timeline', async () => {
    vi.mocked(workSessionService.getMetricsTimeline).mockResolvedValueOnce({
      ...mockTimelineMetrics,
      intervalos: [],
    });

    renderHourReport();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Nenhum registro cronológico encontrado para o período selecionado/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('deve renderizar a seção de auditoria com os componentes colapsáveis', async () => {
    renderHourReport();

    await waitFor(() => {
      expect(
        screen.getByText(/auditoria e registros individuais/i),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', { name: /resumo de horas/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /histórico de sessões/i }),
    ).toBeInTheDocument();
  });
});
