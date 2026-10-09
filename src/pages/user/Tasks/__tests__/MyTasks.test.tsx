import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSectorContext } from '@/features/sectors/context/useSectorContext';
import { tasksApi } from '@/features/weeklies/api/tasksApi';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import MyTasks from '@/pages/user/Tasks/MyTasks';
import type { TaskResponse } from '@/types/weeklies';

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

vi.mock('@/features/sectors/context/useSectorContext', () => ({
  useSectorContext: vi.fn(),
}));

vi.mock('@/features/weeklies/api/tasksApi', () => ({
  tasksApi: {
    getMyTasks: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updatePrazo: vi.fn(),
  },
}));

describe('MyTasks Page', () => {
  const mockTasks: TaskResponse[] = [
    {
      id: 'task-1',
      usuario_id: 'user-1',
      setor_id: 'sec-1',
      origem_task_id: null,
      titulo: 'Refatorar autenticação',
      descricao: 'Adicionar refresh token e middleware',
      status: 'PENDENTE',
      prazo_conclusao: '2026-10-15',
      entrada_auditoria_em: null,
      criado_em: '2026-10-01T12:00:00Z',
      atualizado_em: '2026-10-01T12:00:00Z',
    },
    {
      id: 'task-2',
      usuario_id: 'user-1',
      setor_id: 'sec-1',
      origem_task_id: null,
      titulo: 'Criar testes de integração',
      descricao: 'Cobrir endpoints de setores',
      status: 'CONCLUIDA',
      prazo_conclusao: '2026-10-02',
      entrada_auditoria_em: null,
      criado_em: '2026-10-01T12:00:00Z',
      atualizado_em: '2026-10-02T12:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn(),
      hideAlertDialog: vi.fn(),
    });

    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [
        {
          id: 'sec-1',
          nome: 'Back-end Python',
          descricao: 'Desenvolvimento FastAPI',
          ativo: true,
          criado_em: '2026-01-01',
          qtd_membros: 4,
          qtd_lideres: 1,
        },
      ],
      selectedSectorId: 'sec-1',
      selectedSectorName: 'Back-end Python',
      selectedSector: null,
      mySectors: [
        {
          id: 'sec-1',
          nome: 'Back-end Python',
          descricao: 'Desenvolvimento FastAPI',
          ativo: true,
          papel: 'membro',
        },
      ],
      isMemberOf: vi.fn().mockReturnValue(true),
      getMyRole: vi.fn().mockReturnValue('membro'),
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    });

    vi.mocked(tasksApi.getMyTasks).mockResolvedValue({
      tasks: mockTasks,
      total: 2,
      pagina: 1,
      limite: 20,
    });
  });

  it('deve carregar lista de tarefas e exibir status, título e prazo civil (T01)', async () => {
    render(<MyTasks />);

    await waitFor(() => {
      expect(tasksApi.getMyTasks).toHaveBeenCalledWith({
        limite: 20,
        pagina: 1,
        setor_id: 'sec-1',
      });
    });

    expect(screen.getByText('Refatorar autenticação')).toBeInTheDocument();
    expect(
      screen.getByText('Adicionar refresh token e middleware'),
    ).toBeInTheDocument();
    expect(screen.getByText('Criar testes de integração')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Concluída')).toBeInTheDocument();
    expect(screen.getByText(/Prazo: 15\/10\/2026/)).toBeInTheDocument();
  });

  it('permite abrir modal de criação de tarefa avulsa (T02)', async () => {
    const user = userEvent.setup();
    render(<MyTasks />);

    await waitFor(() => {
      expect(screen.getByText('Refatorar autenticação')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', {
      name: /nova tarefa \(t02\)/i,
    });
    await user.click(createBtn);

    expect(screen.getByText('Nova Tarefa Avulsa')).toBeInTheDocument();
  });

  it('permite abrir modal de edição para tarefa pendente (T03)', async () => {
    const user = userEvent.setup();
    render(<MyTasks />);

    await waitFor(() => {
      expect(screen.getByText('Refatorar autenticação')).toBeInTheDocument();
    });

    const editBtn = screen.getByRole('button', {
      name: /editar \(t03\)/i,
    });
    await user.click(editBtn);

    expect(screen.getByText('Editar Tarefa')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Refatorar autenticação'),
    ).toBeInTheDocument();
  });

  it('exibe apenas setores do membro (mySectors) no filtro e no modal de criação', async () => {
    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [
        {
          id: 'sec-1',
          nome: 'Back-end Python',
          descricao: 'Desenvolvimento FastAPI',
          ativo: true,
          criado_em: '2026-01-01',
          qtd_membros: 4,
          qtd_lideres: 1,
        },
        {
          id: 'sec-2',
          nome: 'Setor Alheio',
          descricao: 'Setor que não faço parte',
          ativo: true,
          criado_em: '2026-01-01',
          qtd_membros: 5,
          qtd_lideres: 1,
        },
      ],
      selectedSectorId: 'sec-1',
      selectedSectorName: 'Back-end Python',
      selectedSector: null,
      mySectors: [
        {
          id: 'sec-1',
          nome: 'Back-end Python',
          descricao: 'Desenvolvimento FastAPI',
          ativo: true,
          papel: 'membro',
        },
      ],
      isMemberOf: vi.fn().mockReturnValue(true),
      getMyRole: vi.fn().mockReturnValue('membro'),
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    });

    const user = userEvent.setup();
    render(<MyTasks />);

    await waitFor(() => {
      expect(screen.getByText('Refatorar autenticação')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', {
      name: /nova tarefa \(t02\)/i,
    });
    await user.click(createBtn);

    expect(screen.getByText('Nova Tarefa Avulsa')).toBeInTheDocument();
    expect(screen.queryByText('Setor Alheio')).not.toBeInTheDocument();
  });

  it('exibe aviso e desabilita criação quando o membro não pertence a nenhum setor', async () => {
    vi.mocked(useSectorContext).mockReturnValue({
      sectors: [
        {
          id: 'sec-1',
          nome: 'Back-end Python',
          descricao: 'Desenvolvimento FastAPI',
          ativo: true,
          criado_em: '2026-01-01',
          qtd_membros: 4,
          qtd_lideres: 1,
        },
      ],
      selectedSectorId: null,
      selectedSectorName: null,
      selectedSector: null,
      mySectors: [],
      isMemberOf: vi.fn().mockReturnValue(false),
      getMyRole: vi.fn().mockReturnValue(null),
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    });

    const user = userEvent.setup();
    render(<MyTasks />);

    await waitFor(() => {
      expect(screen.getByText('Refatorar autenticação')).toBeInTheDocument();
    });

    const createBtn = screen.getByRole('button', {
      name: /nova tarefa \(t02\)/i,
    });
    await user.click(createBtn);

    expect(screen.getByText('Nova Tarefa Avulsa')).toBeInTheDocument();
    expect(
      screen.getByText(/Você não está vinculado a nenhum setor/i),
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', {
      name: /criar tarefa/i,
    });
    expect(submitBtn).toBeDisabled();
  });

  it('envia o parâmetro pagina correto ao navegar na paginação com mais de 20 tarefas', async () => {
    vi.mocked(tasksApi.getMyTasks).mockResolvedValue({
      tasks: mockTasks,
      total: 35,
      pagina: 1,
      limite: 20,
    });

    const user = userEvent.setup();
    render(<MyTasks />);

    await waitFor(() => {
      expect(tasksApi.getMyTasks).toHaveBeenCalledWith(
        expect.objectContaining({ pagina: 1, limite: 20 }),
      );
    });

    // Clica no botão de próxima página
    const nextBtn = screen.getByRole('button', { name: /^próxima$/i });
    await user.click(nextBtn);

    await waitFor(() => {
      expect(tasksApi.getMyTasks).toHaveBeenCalledWith(
        expect.objectContaining({ pagina: 2, limite: 20 }),
      );
    });
  });
});
