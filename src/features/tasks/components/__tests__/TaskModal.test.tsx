import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLE_IDS } from '@/config/roles';
import { AuthContext } from '@/features/auth/context/AuthContext';
import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { TaskResponse } from '@/types/weeklies';

import { TaskModal } from '../TaskModal';

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

vi.mock('@/features/sectors/context/useSectorContext', () => ({
  useSectorContext: vi.fn(),
}));

vi.mock('@/features/weeklies/api/tasksApi', () => ({
  tasksApi: {
    create: vi.fn(),
    update: vi.fn(),
    updatePrazo: vi.fn(),
  },
}));

describe('TaskModal Component', () => {
  const mockTask: TaskResponse = {
    id: 'task-100',
    usuario_id: 'user-1',
    setor_id: 'sec-1',
    origem_task_id: null,
    titulo: 'Implementar testes E2E',
    descricao: 'Cobrir fluxos de weeklies',
    status: 'PENDENTE',
    prazo_conclusao: '2026-10-15',
    entrada_auditoria_em: null,
    criado_em: '2026-10-01T10:00:00Z',
    atualizado_em: '2026-10-01T10:00:00Z',
  };

  const defaultSector = {
    id: 'sec-1',
    nome: 'Engenharia de Software',
    descricao: 'Setor de dev',
    ativo: true,
    papel: 'membro' as const,
  };

  const renderWithAuth = (
    ui: React.ReactElement,
    authValue: { global_role?: string; id?: string },
  ) => {
    return render(
      <AuthContext.Provider
        value={{
          user: {
            id: authValue.id || 'user-1',
            nome_completo: 'Test User',
            email: 'test@ufc.br',
            global_role: authValue.global_role || ROLE_IDS.USUARIO,
          } as never,
          isAuthenticated: true,
          loading: false,
          login: vi.fn(),
          registerUser: vi.fn(),
          logout: vi.fn(),
          checkUserStatus: vi.fn(),
        }}
      >
        {ui}
      </AuthContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn().mockImplementation(config => {
        config.onConfirm?.();
      }),
      hideAlertDialog: vi.fn(),
    });

    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [],
      selectedSectorId: 'sec-1',
      selectedSectorName: 'Engenharia de Software',
      selectedSector: null,
      mySectors: [defaultSector],
      isMemberOf: vi.fn().mockReturnValue(true),
      getMyRole: vi.fn().mockReturnValue('membro'),
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    });
  });

  it('desabilita o campo de prazo para membros comuns e não chama updatePrazo ao salvar alterações de título/descrição', async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();

    vi.mocked(tasksApi.update).mockResolvedValueOnce({
      ...mockTask,
      titulo: 'Título Atualizado pelo Membro',
    });

    renderWithAuth(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        taskToEdit={mockTask}
        onSuccess={handleSuccess}
      />,
      { global_role: ROLE_IDS.USUARIO },
    );

    expect(screen.getByText('Editar Tarefa')).toBeInTheDocument();

    // Campo de data deve estar desabilitado
    const prazoInput = screen.getByLabelText(/prazo estimado de conclusão/i);
    expect(prazoInput).toBeDisabled();

    // Mensagem explicativa para membros comuns
    expect(
      screen.getByText(
        'Apenas o líder do setor ou administrador pode alterar o prazo de uma tarefa existente.',
      ),
    ).toBeInTheDocument();

    // Edita o título
    const tituloInput = screen.getByLabelText(/título da tarefa/i);
    await user.clear(tituloInput);
    await user.type(tituloInput, 'Título Atualizado pelo Membro');

    // Submete o formulário
    const saveBtn = screen.getByRole('button', { name: /salvar alterações/i });
    await user.click(saveBtn);

    await waitFor(() => {
      // Deve chamar update com novo título e descrição
      expect(tasksApi.update).toHaveBeenCalledWith('task-100', {
        titulo: 'Título Atualizado pelo Membro',
        descricao: 'Cobrir fluxos de weeklies',
      });
      // NÃO deve chamar updatePrazo para evitar 403 e salvar parcial
      expect(tasksApi.updatePrazo).not.toHaveBeenCalled();
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it('permite que o líder do setor edite o prazo e chama updatePrazo se houver alteração', async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();

    // Usuário é líder no setor da task
    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [],
      selectedSectorId: 'sec-1',
      selectedSectorName: 'Engenharia de Software',
      selectedSector: null,
      mySectors: [{ ...defaultSector, papel: 'lider' }],
      isMemberOf: vi.fn().mockReturnValue(true),
      getMyRole: vi.fn().mockReturnValue('lider'),
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    });

    vi.mocked(tasksApi.update).mockResolvedValueOnce(mockTask);
    vi.mocked(tasksApi.updatePrazo).mockResolvedValueOnce({
      ...mockTask,
      prazo_conclusao: '2026-10-30',
    });

    renderWithAuth(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        taskToEdit={mockTask}
        onSuccess={handleSuccess}
      />,
      { global_role: ROLE_IDS.USUARIO },
    );

    const prazoInput = screen.getByLabelText(/prazo estimado de conclusão/i);
    expect(prazoInput).not.toBeDisabled();

    // Altera o prazo
    fireEvent.change(prazoInput, { target: { value: '2026-10-30' } });

    const saveBtn = screen.getByRole('button', { name: /salvar alterações/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(tasksApi.update).toHaveBeenCalledWith('task-100', {
        titulo: 'Implementar testes E2E',
        descricao: 'Cobrir fluxos de weeklies',
      });
      expect(tasksApi.updatePrazo).toHaveBeenCalledWith('task-100', {
        prazo_conclusao: '2026-10-30',
      });
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it('permite que o administrador edite o prazo de qualquer tarefa', async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();

    vi.mocked(tasksApi.update).mockResolvedValueOnce(mockTask);
    vi.mocked(tasksApi.updatePrazo).mockResolvedValueOnce({
      ...mockTask,
      prazo_conclusao: '2026-10-25',
    });

    renderWithAuth(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        taskToEdit={mockTask}
        onSuccess={handleSuccess}
      />,
      { global_role: ROLE_IDS.ADMIN },
    );

    const prazoInput = screen.getByLabelText(/prazo estimado de conclusão/i);
    expect(prazoInput).not.toBeDisabled();

    fireEvent.change(prazoInput, { target: { value: '2026-10-25' } });

    const saveBtn = screen.getByRole('button', { name: /salvar alterações/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(tasksApi.update).toHaveBeenCalled();
      expect(tasksApi.updatePrazo).toHaveBeenCalledWith('task-100', {
        prazo_conclusao: '2026-10-25',
      });
      expect(handleSuccess).toHaveBeenCalled();
    });
  });

  it('permite que membros definam prazo na criação de nova tarefa', async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();

    vi.mocked(tasksApi.create).mockResolvedValueOnce(mockTask);

    renderWithAuth(
      <TaskModal
        isOpen={true}
        onClose={vi.fn()}
        taskToEdit={null}
        defaultSectorId="sec-1"
        onSuccess={handleSuccess}
      />,
      { global_role: ROLE_IDS.USUARIO },
    );

    expect(screen.getByText('Nova Tarefa Avulsa')).toBeInTheDocument();

    const prazoInput = screen.getByLabelText(/prazo estimado de conclusão/i);
    expect(prazoInput).not.toBeDisabled();

    const tituloInput = screen.getByLabelText(/título da tarefa/i);
    await user.type(tituloInput, 'Criar testes automatizados');

    const submitBtn = screen.getByRole('button', { name: /criar tarefa/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(tasksApi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: 'Criar testes automatizados',
          setor_id: 'sec-1',
        }),
      );
      expect(handleSuccess).toHaveBeenCalled();
    });
  });
});
