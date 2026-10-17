import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlertDialogProvider } from '@/context/AlertDialogProvider';
import { AuditTaskCard } from '@/features/weeklies/components/AuditTaskCard';
import type { TaskResponse } from '@/types/weeklies';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<AlertDialogProvider>{ui}</AlertDialogProvider>);
};

describe('AuditTaskCard', () => {
  const baseTask: TaskResponse = {
    id: 't-123',
    usuario_id: 'u-membro-456',
    setor_id: 's-eng',
    origem_task_id: null,
    titulo: 'Desenvolver componente de auditoria',
    descricao: 'Auditoria técnica das tarefas concluídas',
    status: 'EM_AUDITORIA',
    prazo_conclusao: '2026-10-15',
    entrada_auditoria_em: '2026-10-01T14:30:00Z',
    criado_em: '2026-09-25T10:00:00Z',
    atualizado_em: '2026-10-01T14:30:00Z',
  };

  const defaultProps = {
    task: baseTask,
    currentUserId: 'u-leader-999',
    onUpdatePrazo: vi.fn(),
    onConclude: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exibe título, autor por ID sem inventar nome, status e prazo da tarefa', () => {
    renderWithProviders(<AuditTaskCard {...defaultProps} />);

    expect(
      screen.getByText('Desenvolver componente de auditoria'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Autor: u-membro-456/i)).toBeInTheDocument();
    expect(screen.getAllByText(/em auditoria/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/15\/10\/2026/i)).toBeInTheDocument();
    expect(
      screen.getByText('Auditoria técnica das tarefas concluídas'),
    ).toBeInTheDocument();
  });

  it('aciona onUpdatePrazo ao clicar em Prorrogar Prazo', () => {
    renderWithProviders(<AuditTaskCard {...defaultProps} />);

    const prazoBtn = screen.getByRole('button', { name: /prorrogar prazo/i });
    fireEvent.click(prazoBtn);

    expect(defaultProps.onUpdatePrazo).toHaveBeenCalledWith(baseTask);
  });

  it('permite conclusão direta por gestor com diálogo de confirmação e chama onConclude', async () => {
    renderWithProviders(<AuditTaskCard {...defaultProps} />);

    const concludeBtn = screen.getByRole('button', {
      name: /concluir tarefa/i,
    });
    fireEvent.click(concludeBtn);

    // Diálogo de confirmação
    expect(
      screen.getByText(/Concluir tarefa diretamente\?/i),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /concluir tarefa/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(defaultProps.onConclude).toHaveBeenCalledWith('t-123');
    });
  });

  it('bloqueia auto-conclusão quando o autor da tarefa for o usuário atual', () => {
    renderWithProviders(
      <AuditTaskCard
        {...defaultProps}
        currentUserId="u-membro-456" // Mesmo que task.usuario_id
      />,
    );

    expect(screen.getByText('Sua tarefa')).toBeInTheDocument();

    const concludeBtn = screen.getByRole('button', {
      name: /concluir tarefa/i,
    });
    expect(concludeBtn).toBeDisabled();
    expect(defaultProps.onConclude).not.toHaveBeenCalled();
  });

  it('solicita confirmação e executa onDelete ao clicar em Remover', async () => {
    renderWithProviders(<AuditTaskCard {...defaultProps} />);

    const deleteBtn = screen.getByRole('button', {
      name: /^remover$/i,
    });
    fireEvent.click(deleteBtn);

    expect(
      screen.getByText(/Remover tarefa do sistema\?/i),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', {
      name: /remover definitivamente/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(defaultProps.onDelete).toHaveBeenCalledWith('t-123');
    });
  });
});
