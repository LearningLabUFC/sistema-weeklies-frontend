import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WeeklyTaskItemCard } from '@/features/weeklies/components/WeeklyTaskItemCard';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import type { WeeklyTaskItemResponse } from '@/types/weeklies';

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

describe('WeeklyTaskItemCard Component', () => {
  let mockAlertConfig: { onConfirm?: () => Promise<void> | void } = {};
  const mockOnUpdate = vi.fn();
  const mockOnRemove = vi.fn();

  const baseTask: WeeklyTaskItemResponse = {
    id: 'wt-1',
    task_id: 'task-1',
    titulo: 'Desenvolver login JWT',
    descricao: 'Criar endpoints e validação de token',
    prazo_conclusao: '2026-10-10',
    concluida: false,
    impedimento: null,
    posicao: 1,
    origem: 'NOVA',
    status_task: 'PENDENTE',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAlertConfig = {};
    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn().mockImplementation(config => {
        mockAlertConfig = config;
      }),
      hideAlertDialog: vi.fn(),
    });
  });

  it('deve renderizar dados da tarefa, badge NOVA e prazo civil', () => {
    render(
      <WeeklyTaskItemCard
        taskItem={baseTask}
        isEditable={true}
        canRemoveHerdada={false}
        isLastItemInRejeitada={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByText('Desenvolver login JWT')).toBeInTheDocument();
    expect(
      screen.getByText('Criar endpoints e validação de token'),
    ).toBeInTheDocument();
    expect(screen.getByText('Nova')).toBeInTheDocument();
    expect(screen.getByText(/Prazo: 10\/10\/2026/)).toBeInTheDocument();
  });

  it('permite alternar conclusão chamando onUpdate com W10', async () => {
    const user = userEvent.setup();
    render(
      <WeeklyTaskItemCard
        taskItem={baseTask}
        isEditable={true}
        canRemoveHerdada={false}
        isLastItemInRejeitada={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {
      name: /marcar desenvolver login jwt como concluída/i,
    });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(mockOnUpdate).toHaveBeenCalledWith('wt-1', { concluida: true });
  });

  it('permite registrar impedimento com W10', async () => {
    const user = userEvent.setup();
    render(
      <WeeklyTaskItemCard
        taskItem={baseTask}
        isEditable={true}
        canRemoveHerdada={false}
        isLastItemInRejeitada={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />,
    );

    // Clica no botão de registrar impedimento
    const impedimentBtn = screen.getByRole('button', {
      name: /registrar impedimento/i,
    });
    await user.click(impedimentBtn);

    const textarea = screen.getByPlaceholderText(
      /explique detalhadamente o motivo/i,
    );
    await user.type(textarea, 'Aguardando aprovação de schema pelo time de BD');

    const saveBtn = screen.getByRole('button', {
      name: /salvar impedimento/i,
    });
    await user.click(saveBtn);

    expect(mockOnUpdate).toHaveBeenCalledWith('wt-1', {
      impedimento: 'Aguardando aprovação de schema pelo time de BD',
    });
  });

  it('permite remover tarefa NOVA com confirmação (W11)', async () => {
    const user = userEvent.setup();
    render(
      <WeeklyTaskItemCard
        taskItem={baseTask}
        isEditable={true}
        canRemoveHerdada={false}
        isLastItemInRejeitada={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />,
    );

    const removeBtn = screen.getByRole('button', {
      name: /remover tarefa da weekly/i,
    });
    await user.click(removeBtn);

    expect(mockAlertConfig.onConfirm).toBeDefined();
    await mockAlertConfig.onConfirm!();

    expect(mockOnRemove).toHaveBeenCalledWith('wt-1');
  });

  it('não deve permitir membro comum remover tarefa HERDADA', () => {
    const herdadaTask: WeeklyTaskItemResponse = {
      ...baseTask,
      origem: 'HERDADA',
    };

    render(
      <WeeklyTaskItemCard
        taskItem={herdadaTask}
        isEditable={true}
        canRemoveHerdada={false}
        isLastItemInRejeitada={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /remover tarefa da weekly/i }),
    ).not.toBeInTheDocument();
  });

  it('permite líder/admin remover tarefa HERDADA quando canRemoveHerdada é true', () => {
    const herdadaTask: WeeklyTaskItemResponse = {
      ...baseTask,
      origem: 'HERDADA',
    };

    render(
      <WeeklyTaskItemCard
        taskItem={herdadaTask}
        isEditable={true}
        canRemoveHerdada={true}
        isLastItemInRejeitada={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />,
    );

    expect(
      screen.getByRole('button', { name: /remover tarefa da weekly/i }),
    ).toBeInTheDocument();
  });

  it('não deve permitir remover quando for o último item de REJEITADA', () => {
    render(
      <WeeklyTaskItemCard
        taskItem={baseTask}
        isEditable={true}
        canRemoveHerdada={true}
        isLastItemInRejeitada={true}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /remover tarefa da weekly/i }),
    ).not.toBeInTheDocument();
  });

  it('exibe badge de status da tarefa no sistema (TaskStatusBadge)', () => {
    render(
      <WeeklyTaskItemCard
        taskItem={{
          ...baseTask,
          status_task: 'CONCLUIDA',
          concluida: true,
        }}
        isEditable={false}
        canRemoveHerdada={false}
        isLastItemInRejeitada={false}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />,
    );

    expect(screen.getByText('Concluída')).toBeInTheDocument();
  });
});
