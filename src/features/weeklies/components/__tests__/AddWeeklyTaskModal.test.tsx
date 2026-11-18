import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { AddWeeklyTaskModal } from '@/features/weeklies/components/AddWeeklyTaskModal';
import { useAlertDialog } from '@/hooks/useAlertDialog';

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

vi.mock('@/features/weeklies/api/weekliesApi', () => ({
  weekliesApi: {
    addTask: vi.fn(),
  },
}));

vi.mock('@/features/weeklies/api/tasksApi', () => ({
  tasksApi: {
    getMyTasks: vi.fn(),
    listEligibleCollaborators: vi.fn(),
    assign: vi.fn(),
  },
}));

describe('AddWeeklyTaskModal Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn(),
      hideAlertDialog: vi.fn(),
    });

    vi.mocked(tasksApi.getMyTasks).mockResolvedValue({
      tasks: [
        {
          id: 'task-1',
          usuario_id: 'user-1',
          setor_id: 'sec-1',
          origem_task_id: null,
          titulo: 'Configurar CI/CD',
          descricao: 'Pipeline GitHub Actions',
          status: 'PENDENTE',
          prazo_conclusao: '2026-10-15',
          entrada_auditoria_em: null,
          criado_em: '2026-10-01T00:00:00Z',
          atualizado_em: '2026-10-01T00:00:00Z',
        },
      ],
      total: 1,
      pagina: 1,
      limite: 50,
    });
  });

  it('permite criar nova tarefa inline na weekly (W09)', async () => {
    const user = userEvent.setup();
    vi.mocked(weekliesApi.addTask).mockResolvedValueOnce({
      id: 'wt-1',
      task_id: 'new-task-1',
      titulo: 'Criar documentação da API',
      descricao: 'Swagger e OpenAPI',
      status_task: 'PENDENTE',
      prazo_conclusao: '2026-10-20',
      concluida: false,
      impedimento: null,
      posicao: 1,
      origem: 'NOVA',
    });

    render(
      <AddWeeklyTaskModal
        isOpen={true}
        onClose={mockOnClose}
        weeklyId="weekly-1"
        sectorId="sec-1"
        existingTaskIds={[]}
        onSuccess={mockOnSuccess}
      />,
    );

    const titleInput = screen.getByLabelText(/título da tarefa/i);
    const descInput = screen.getByLabelText(/descrição/i);
    const prazoInput = screen.getByLabelText(/prazo sugerido/i);

    await user.type(titleInput, 'Criar documentação da API');
    await user.type(descInput, 'Swagger e OpenAPI');
    await user.type(prazoInput, '2026-10-20');

    const submitBtn = screen.getByRole('button', {
      name: /adicionar tarefa/i,
    });
    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);

    expect(weekliesApi.addTask).toHaveBeenCalledWith('weekly-1', {
      titulo: 'Criar documentação da API',
      descricao: 'Swagger e OpenAPI',
      prazo_conclusao: '2026-10-20',
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('permite vincular tarefa existente pendente à weekly (W09)', async () => {
    const user = userEvent.setup();
    vi.mocked(weekliesApi.addTask).mockResolvedValueOnce({
      id: 'wt-2',
      task_id: 'task-1',
      titulo: 'Configurar CI/CD',
      descricao: 'Pipeline GitHub Actions',
      status_task: 'PENDENTE',
      prazo_conclusao: '2026-10-15',
      concluida: false,
      impedimento: null,
      posicao: 2,
      origem: 'NOVA',
    });

    render(
      <AddWeeklyTaskModal
        isOpen={true}
        onClose={mockOnClose}
        weeklyId="weekly-1"
        sectorId="sec-1"
        existingTaskIds={[]}
        onSuccess={mockOnSuccess}
      />,
    );

    await waitFor(() => {
      expect(tasksApi.getMyTasks).toHaveBeenCalled();
    });

    // Clica na aba "Vincular Existente"
    const tabBtn = screen.getByRole('button', {
      name: /vincular existente/i,
    });
    await user.click(tabBtn);

    // Seleciona a tarefa existente via combobox
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await user.keyboard('{Enter}');

    const submitBtn = screen.getByRole('button', {
      name: /vincular tarefa/i,
    });
    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);

    expect(weekliesApi.addTask).toHaveBeenCalledWith('weekly-1', {
      task_id: 'task-1',
    });

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('exibe modo de entrega realizada e envia concluida: true quando defaultCompleted é true', async () => {
    const user = userEvent.setup();
    vi.mocked(weekliesApi.addTask).mockResolvedValueOnce({
      id: 'wt-3',
      task_id: 'new-task-2',
      titulo: 'Corrigir bug urgente em produção',
      descricao: null,
      status_task: 'PENDENTE',
      prazo_conclusao: null,
      concluida: true,
      impedimento: null,
      posicao: 3,
      origem: 'NOVA',
    });

    render(
      <AddWeeklyTaskModal
        isOpen={true}
        onClose={mockOnClose}
        weeklyId="weekly-1"
        sectorId="sec-1"
        existingTaskIds={[]}
        defaultCompleted={true}
        onSuccess={mockOnSuccess}
      />,
    );

    expect(screen.getByText('Adicionar Entrega Realizada')).toBeInTheDocument();
    expect(screen.queryByLabelText(/prazo sugerido/i)).not.toBeInTheDocument();

    const titleInput = screen.getByLabelText(/título da tarefa/i);
    await user.type(titleInput, 'Corrigir bug urgente em produção');

    const submitBtn = screen.getByRole('button', {
      name: /adicionar tarefa/i,
    });
    await user.click(submitBtn);

    expect(weekliesApi.addTask).toHaveBeenCalledWith('weekly-1', {
      titulo: 'Corrigir bug urgente em produção',
      descricao: undefined,
      prazo_conclusao: undefined,
      concluida: true,
    });
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('permite convidar colaborador opcionalmente no ato de adicionar nova tarefa', async () => {
    const user = userEvent.setup();
    vi.mocked(tasksApi.listEligibleCollaborators).mockResolvedValueOnce({
      colaboradores: [
        {
          id: 'colab-1',
          nome_completo: 'Maria Colaboradora',
          email: 'maria@ufc.br',
          matricula: '554433',
          setores: ['Desenvolvimento'],
        },
      ],
      total: 1,
      pagina: 1,
      limite: 15,
    });
    vi.mocked(weekliesApi.addTask).mockResolvedValueOnce({
      id: 'wt-4',
      task_id: 'task-created-4',
      titulo: 'Implementar cache distribuído',
      descricao: null,
      status_task: 'PENDENTE',
      prazo_conclusao: null,
      concluida: false,
      impedimento: null,
      posicao: 4,
      origem: 'NOVA',
    });
    vi.mocked(tasksApi.assign).mockResolvedValueOnce({
      id: 'assign-1',
      task_id: 'task-created-4',
      task_titulo: 'Implementar cache distribuído',
      solicitante_id: 'user-1',
      solicitante_nome: 'Usuário Teste',
      atribuido_id: 'colab-1',
      atribuido_nome: 'Maria Colaboradora',
      status: 'PENDENTE',
      criado_em: '2026-10-02T10:00:00Z',
      respondido_em: null,
    });

    render(
      <AddWeeklyTaskModal
        isOpen={true}
        onClose={mockOnClose}
        weeklyId="weekly-1"
        sectorId="sec-1"
        existingTaskIds={[]}
        onSuccess={mockOnSuccess}
      />,
    );

    await user.type(
      screen.getByLabelText(/título da tarefa/i),
      'Implementar cache distribuído',
    );

    await user.click(
      screen.getByRole('button', { name: /convidar colaborador/i }),
    );

    const colabBtn = await screen.findByText('Maria Colaboradora');
    await user.click(colabBtn);

    await user.click(screen.getByRole('button', { name: /adicionar tarefa/i }));

    await waitFor(() => {
      expect(weekliesApi.addTask).toHaveBeenCalledWith(
        'weekly-1',
        expect.objectContaining({
          titulo: 'Implementar cache distribuído',
        }),
      );
      expect(tasksApi.assign).toHaveBeenCalledWith('task-created-4', {
        atribuido_id: 'colab-1',
      });
    });
  });
});
