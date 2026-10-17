import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLE_IDS } from '@/config/roles';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAuth } from '@/hooks/useAuth';
import Weeklies from '@/pages/user/Weeklies/Weeklies';
import type { User } from '@/types/user';
import type { WeeklyResponse } from '@/types/weeklies';

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/sectors/context/useSectorContext', () => ({
  useSectorContext: vi.fn(),
}));

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: { getById: vi.fn() },
}));

vi.mock('@/features/weeklies/api/tasksApi', () => ({
  tasksApi: { getMyTasks: vi.fn() },
}));

vi.mock('@/features/weeklies/api/weekliesApi', () => ({
  weekliesApi: {
    getCurrentWeekly: vi.fn(),
    create: vi.fn(),
    submit: vi.fn(),
    reopen: vi.fn(),
    updateTaskItem: vi.fn(),
    removeTaskItem: vi.fn(),
    addTask: vi.fn(),
  },
}));

describe('Weeklies Page', () => {
  let mockAlertConfig: { onConfirm?: () => Promise<void> | void } = {};

  const mockWeekly: WeeklyResponse = {
    id: 'weekly-1',
    usuario_id: 'user-1',
    membro_nome: 'Usuário Teste',
    setor_id: 'sec-1',
    semana_referencia: '2026-10-05',
    status: 'RASCUNHO',
    enviada_em: null,
    avaliada_em: null,
    avaliada_por: null,
    observacao_lider: null,
    motivo_expiracao: null,
    detalhe_expiracao: null,
    criado_em: '2026-10-02T10:00:00Z',
    atualizado_em: '2026-10-02T10:00:00Z',
    tasks: [
      {
        id: 'wt-1',
        task_id: 'task-1',
        titulo: 'Desenvolver login JWT',
        descricao: 'Endpoint de autenticação',
        status_task: 'PENDENTE',
        prazo_conclusao: '2026-10-10',
        concluida: false,
        impedimento: null,
        posicao: 1,
        origem: 'NOVA',
      },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(sectorsApi.getById).mockResolvedValue({ membros: [] } as never);
    vi.mocked(tasksApi.getMyTasks).mockResolvedValue({
      tasks: [],
      total: 0,
      pagina: 1,
      limite: 50,
    });
    mockAlertConfig = {};

    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn().mockImplementation(config => {
        mockAlertConfig = config;
      }),
      hideAlertDialog: vi.fn(),
    });

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-1',
        nome_completo: 'Usuário Teste',
        email: 'user@ufc.br',
        global_role: 'usuario',
      } as unknown as User,
      isAuthenticated: true,
      logout: vi.fn(),
      login: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      checkUserStatus: vi.fn(),
    });

    const mockSectorContext = {
      sectors: [
        {
          id: 'sec-1',
          nome: 'Front-end React',
          descricao: 'Setor de interface web',
          ativo: true,
          criado_em: '2026-01-01',
          qtd_membros: 5,
          qtd_lideres: 1,
        },
      ],
      selectedSectorId: 'sec-1',
      selectedSectorName: 'Front-end React',
      selectedSector: {
        id: 'sec-1',
        nome: 'Front-end React',
        descricao: 'Setor de interface web',
        ativo: true,
        criado_em: '2026-01-01',
        qtd_membros: 5,
        qtd_lideres: 1,
      },
      mySectors: [
        {
          id: 'sec-1',
          nome: 'Front-end React',
          descricao: 'Setor de interface web',
          ativo: true,
          papel: 'membro' as const,
        },
      ],
      isMemberOf: vi.fn().mockReturnValue(true),
      getMyRole: vi.fn().mockReturnValue('membro'),
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    };

    vi.mocked(useSectorContext).mockReturnValue(mockSectorContext);
  });

  function selectContext(id: string) {
    const baseContext = {
      sectors: [
        {
          id: 'sec-1',
          nome: 'Front-end React',
          descricao: 'Setor de interface web',
          ativo: true,
          criado_em: '2026-01-01',
          qtd_membros: 5,
          qtd_lideres: 1,
        },
      ],
      selectedSectorName: 'Front-end React',
      isMemberOf: vi.fn().mockReturnValue(true),
      getMyRole: vi.fn().mockReturnValue('membro'),
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    };

    vi.mocked(useSectorContext).mockReturnValue({
      ...baseContext,
      selectedSectorId: id,
      selectedSector: { ...baseContext.sectors[0], id, nome: `Setor ${id}` },
      mySectors: ['sec-1', 'sec-2'].map(sectorId => ({
        id: sectorId,
        nome: `Setor ${sectorId}`,
        descricao: 'Setor de teste',
        ativo: true,
        papel: 'membro' as const,
      })),
    });
  }

  it('ignora criação atrasada de A e mantém o modal e a tarefa no setor B', async () => {
    const user = userEvent.setup();
    let finishCreate!: (weekly: WeeklyResponse) => void;
    vi.mocked(weekliesApi.getCurrentWeekly).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404, data: { detail: 'Não encontrada' } },
    });
    vi.mocked(weekliesApi.create).mockReturnValue(
      new Promise(resolve => {
        finishCreate = resolve;
      }),
    );
    const view = render(
      <MemoryRouter>
        <Weeklies />
      </MemoryRouter>,
    );
    await user.click(
      await screen.findByRole('button', { name: /criar weekly da semana/i }),
    );

    const weeklyB = {
      ...mockWeekly,
      id: 'weekly-2',
      setor_id: 'sec-2',
      tasks: [
        { ...mockWeekly.tasks[0], id: 'wt-2', titulo: 'Tarefa do setor B' },
      ],
    };
    vi.mocked(weekliesApi.getCurrentWeekly).mockResolvedValue(weeklyB);
    selectContext('sec-2');
    view.rerender(
      <MemoryRouter>
        <Weeklies />
      </MemoryRouter>,
    );
    await screen.findByText('Tarefa do setor B');
    await user.click(
      screen.getByRole('button', { name: /^Adicionar Tarefa$/ }),
    );
    const dialog = await screen.findByRole('dialog');
    await user.type(
      within(dialog).getByLabelText(/Título da tarefa/),
      'Nova tarefa de B',
    );

    await act(async () => finishCreate(mockWeekly));
    expect(screen.getByText('Tarefa do setor B')).toBeInTheDocument();
    expect(screen.queryByText('Desenvolver login JWT')).not.toBeInTheDocument();
    expect(
      within(dialog).getByDisplayValue('Nova tarefa de B'),
    ).toBeInTheDocument();
    vi.mocked(weekliesApi.addTask).mockResolvedValue(weeklyB.tasks[0]);
    await user.click(
      within(dialog).getByRole('button', { name: /^Adicionar Tarefa$/ }),
    );
    expect(weekliesApi.addTask).toHaveBeenCalledWith(
      'weekly-2',
      expect.objectContaining({ titulo: 'Nova tarefa de B' }),
    );
  });

  it('fecha o modal na troca de setor e ignora a submissão antiga mesmo ao voltar para A', async () => {
    const user = userEvent.setup();
    let finishSubmit!: (weekly: WeeklyResponse) => void;
    vi.mocked(weekliesApi.getCurrentWeekly).mockResolvedValue(mockWeekly);
    vi.mocked(weekliesApi.submit).mockReturnValue(
      new Promise(resolve => {
        finishSubmit = resolve;
      }),
    );
    const view = render(
      <MemoryRouter>
        <Weeklies />
      </MemoryRouter>,
    );
    await user.click(
      await screen.findByRole('button', { name: /Enviar Weekly/ }),
    );
    await user.click(
      screen.getByRole('button', { name: /^Adicionar Tarefa$/ }),
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    selectContext('sec-2');
    vi.mocked(weekliesApi.getCurrentWeekly).mockResolvedValue({
      ...mockWeekly,
      id: 'weekly-2',
      setor_id: 'sec-2',
    });
    view.rerender(
      <MemoryRouter>
        <Weeklies />
      </MemoryRouter>,
    );
    await waitFor(() =>
      expect(weekliesApi.getCurrentWeekly).toHaveBeenLastCalledWith('sec-2'),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    selectContext('sec-1');
    vi.mocked(weekliesApi.getCurrentWeekly).mockResolvedValue(mockWeekly);
    view.rerender(
      <MemoryRouter>
        <Weeklies />
      </MemoryRouter>,
    );
    await screen.findByText('Desenvolver login JWT');
    const calls = vi.mocked(weekliesApi.getCurrentWeekly).mock.calls.length;
    await act(async () => finishSubmit({ ...mockWeekly, status: 'ENVIADA' }));
    expect(weekliesApi.getCurrentWeekly).toHaveBeenCalledTimes(calls);
    expect(useAlertDialog().showAlertDialog).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Weekly enviada' }),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exibe estado de "Iniciar Weekly" quando W02 retorna 404 e permite chamar W03', async () => {
    const user = userEvent.setup();
    const notFoundError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: { detail: 'Weekly não encontrada' },
      },
    };
    vi.mocked(weekliesApi.getCurrentWeekly).mockRejectedValueOnce(
      notFoundError,
    );
    vi.mocked(weekliesApi.create).mockResolvedValueOnce(mockWeekly);

    render(
      <MemoryRouter>
        <Weeklies />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(weekliesApi.getCurrentWeekly).toHaveBeenCalledWith('sec-1');
    });

    expect(
      screen.getByText(/iniciar weekly desta semana/i),
    ).toBeInTheDocument();

    const createBtn = screen.getByRole('button', {
      name: /criar weekly da semana \(w03\)/i,
    });
    await user.click(createBtn);

    expect(weekliesApi.create).toHaveBeenCalledWith({ setor_id: 'sec-1' });

    await waitFor(() => {
      expect(screen.getByText('Desenvolver login JWT')).toBeInTheDocument();
    });
  });

  it('carrega weekly existente e permite submissão com W05', async () => {
    const user = userEvent.setup();
    vi.mocked(weekliesApi.getCurrentWeekly).mockResolvedValue(mockWeekly);
    vi.mocked(weekliesApi.submit).mockResolvedValueOnce(mockWeekly);

    render(
      <MemoryRouter>
        <Weeklies />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Desenvolver login JWT')).toBeInTheDocument();
    });

    expect(screen.getByText('Rascunho')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', {
      name: /enviar weekly \(w05\)/i,
    });
    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);

    expect(weekliesApi.submit).toHaveBeenCalledWith('weekly-1');
  });

  it('permite reabrir weekly quando status for ENVIADA (W06)', async () => {
    const user = userEvent.setup();
    const enviadaWeekly: WeeklyResponse = {
      ...mockWeekly,
      status: 'ENVIADA',
      enviada_em: '2026-10-03T18:00:00Z',
    };
    vi.mocked(weekliesApi.getCurrentWeekly).mockResolvedValue(enviadaWeekly);
    vi.mocked(weekliesApi.reopen).mockResolvedValueOnce(mockWeekly);

    render(
      <MemoryRouter>
        <Weeklies />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Enviada')).toBeInTheDocument();
    });

    const reopenBtn = screen.queryByRole('button', {
      name: /reabrir weekly \(w06\)/i,
    });

    if (reopenBtn) {
      await user.click(reopenBtn);
      expect(mockAlertConfig.onConfirm).toBeDefined();
      await act(async () => {
        await mockAlertConfig.onConfirm!();
      });
      expect(weekliesApi.reopen).toHaveBeenCalledWith('weekly-1');
    }
  });

  it('redireciona coordenador ou administrador para /admin sem consultar weekly pessoal', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        nome_completo: 'Coordenadora Geral',
        email: 'coord@ufc.br',
        global_role: ROLE_IDS.SUPER_ADMIN,
      } as unknown as User,
      isAuthenticated: true,
      logout: vi.fn(),
      login: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/weeklies-test']}>
        <Routes>
          <Route path="/weeklies-test" element={<Weeklies />} />
          <Route path="/admin" element={<div>Painel Admin Redirect</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Painel Admin Redirect')).toBeInTheDocument();
    expect(weekliesApi.getCurrentWeekly).not.toHaveBeenCalled();
  });

  it('exibe alerta de erro quando a submissão (W05) ou reabertura (W06) falham', async () => {
    const user = userEvent.setup();
    const showAlertDialogMock = vi.fn();
    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: showAlertDialogMock,
      hideAlertDialog: vi.fn(),
    });

    vi.mocked(weekliesApi.getCurrentWeekly).mockResolvedValue(mockWeekly);
    vi.mocked(weekliesApi.submit).mockRejectedValueOnce(
      new Error('Erro de conexão ao enviar weekly'),
    );

    render(
      <MemoryRouter>
        <Weeklies />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Desenvolver login JWT')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button', {
      name: /enviar weekly \(w05\)/i,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(showAlertDialogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Erro ao enviar weekly',
          message: 'Erro de conexão ao enviar weekly',
        }),
      );
    });
  });
});
