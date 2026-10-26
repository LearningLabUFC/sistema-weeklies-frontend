import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlertDialogProvider } from '@/context/AlertDialogProvider';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { InviteCollaboratorModal } from '@/features/weeklies/components/InviteCollaboratorModal';
import type { EligibleCollaborator } from '@/types/weeklies';

vi.mock('@/features/weeklies/api/tasksApi', () => ({
  tasksApi: {
    assign: vi.fn(),
    listEligibleCollaborators: vi.fn(),
  },
}));

const mockCollaborators: EligibleCollaborator[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    nome_completo: 'Maria Desenvolvedora',
    email: 'maria@lab.ufc.br',
    matricula: '123456',
    setores: ['Desenvolvimento Web', 'Inteligência Artificial'],
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    nome_completo: 'João Designer',
    email: 'joao@lab.ufc.br',
    matricula: '654321',
    setores: ['Design e UX'],
  },
];

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<AlertDialogProvider>{ui}</AlertDialogProvider>);
};

describe('InviteCollaboratorModal', () => {
  const defaultProps = {
    isOpen: true,
    taskId: '11111111-1111-1111-1111-111111111111',
    taskTitulo: 'Implementar autenticação JWT',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tasksApi.listEligibleCollaborators).mockResolvedValue({
      colaboradores: mockCollaborators,
      total: 2,
      pagina: 1,
      limite: 20,
    });
  });

  it('renderiza o título, campo de busca e lista de colaboradores elegíveis', async () => {
    renderWithProviders(<InviteCollaboratorModal {...defaultProps} />);

    expect(
      screen.getByRole('heading', { name: 'Convidar Colaborador' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Implementar autenticação JWT/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Buscar por nome, e-mail ou matrícula.../i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Maria Desenvolvedora')).toBeInTheDocument();
      expect(screen.getByText('João Designer')).toBeInTheDocument();
      expect(screen.getByText('123456')).toBeInTheDocument();
    });
  });

  it('permite selecionar um colaborador e exibe o card de confirmação com dados', async () => {
    renderWithProviders(<InviteCollaboratorModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Desenvolvedora')).toBeInTheDocument();
    });

    const selectBtn = screen.getByText('Maria Desenvolvedora');
    fireEvent.click(selectBtn);

    await waitFor(() => {
      expect(screen.getByText('Colaborador selecionado:')).toBeInTheDocument();
      expect(screen.getByText('maria@lab.ufc.br')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /trocar/i }),
      ).toBeInTheDocument();
    });
  });

  it('permite trocar o colaborador selecionado para escolher outro', async () => {
    renderWithProviders(<InviteCollaboratorModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Desenvolvedora')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Maria Desenvolvedora'));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /trocar/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /trocar/i }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/Buscar por nome, e-mail ou matrícula.../i),
      ).toBeInTheDocument();
    });
  });

  it('envia convite com sucesso para o colaborador selecionado e chama onSuccess', async () => {
    vi.mocked(tasksApi.assign).mockResolvedValue({
      id: 'as-1',
      task_id: defaultProps.taskId,
      task_titulo: defaultProps.taskTitulo,
      solicitante_id: 'u-me',
      solicitante_nome: 'Solicitante',
      atribuido_id: mockCollaborators[0].id,
      atribuido_nome: mockCollaborators[0].nome_completo,
      status: 'PENDENTE',
      criado_em: '2026-10-01T10:00:00Z',
      respondido_em: null,
    });

    renderWithProviders(<InviteCollaboratorModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Desenvolvedora')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Maria Desenvolvedora'));

    const submitBtn = screen.getByRole('button', {
      name: /enviar convite/i,
    });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(tasksApi.assign).toHaveBeenCalledWith(defaultProps.taskId, {
        atribuido_id: mockCollaborators[0].id,
      });
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('exibe alerta de erro quando a API rejeita a atribuição', async () => {
    vi.mocked(tasksApi.assign).mockRejectedValue(
      new Error('Já existe um convite pendente para este membro nesta tarefa.'),
    );

    renderWithProviders(<InviteCollaboratorModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Maria Desenvolvedora')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Maria Desenvolvedora'));

    const submitBtn = screen.getByRole('button', {
      name: /enviar convite/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Já existe um convite pendente para este membro nesta tarefa.',
        ),
      ).toBeInTheDocument();
    });
  });
});
