import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlertDialogProvider } from '@/context/AlertDialogProvider';
import { assignmentsApi } from '@/features/weeklies/api/assignmentsApi';
import { AssignmentsBox } from '@/features/weeklies/components/AssignmentsBox';
import type { TaskAssignmentListResponse } from '@/types/weeklies';

vi.mock('@/features/weeklies/api/assignmentsApi', () => ({
  assignmentsApi: {
    getMyAssignments: vi.fn(),
    accept: vi.fn(),
    reject: vi.fn(),
  },
}));

const mockReceivedAssignments: TaskAssignmentListResponse = {
  total: 2,
  pagina: 1,
  limite: 10,
  atribuicoes: [
    {
      id: 'as-1',
      task_id: 't-1',
      atribuido_id: 'u-me',
      atribuido_nome: 'Eu Mesmo',
      solicitante_id: 'u-sender-1',
      solicitante_nome: 'Mariana Souza',
      status: 'PENDENTE',
      criado_em: '2026-10-01T10:00:00Z',
      respondido_em: null,
      task_titulo: 'Desenvolver API de Pagamentos',
    },
    {
      id: 'as-2',
      task_id: 't-2',
      atribuido_id: 'u-me',
      atribuido_nome: 'Eu Mesmo',
      solicitante_id: 'u-sender-2',
      solicitante_nome: 'Lucas Lima',
      status: 'ACEITA',
      criado_em: '2026-09-30T10:00:00Z',
      respondido_em: '2026-09-30T12:00:00Z',
      task_titulo: 'Revisar documentação OpenAPI',
    },
  ],
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<AlertDialogProvider>{ui}</AlertDialogProvider>);
};

describe('AssignmentsBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carrega e renderiza a lista de convites recebidos com badges de status', async () => {
    vi.mocked(assignmentsApi.getMyAssignments).mockResolvedValue(
      mockReceivedAssignments,
    );

    renderWithProviders(<AssignmentsBox />);

    await waitFor(() => {
      expect(
        screen.getByText('Desenvolver API de Pagamentos'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Revisar documentação OpenAPI'),
      ).toBeInTheDocument();
      expect(screen.getByText('Mariana Souza')).toBeInTheDocument();
      expect(screen.getByText('Lucas Lima')).toBeInTheDocument();
    });

    // PENDENTE should have Aceitar and Recusar buttons
    expect(
      screen.getByRole('button', { name: /aceitar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /recusar/i }),
    ).toBeInTheDocument();
  });

  it('permite aceitar um convite pendente (C02)', async () => {
    vi.mocked(assignmentsApi.getMyAssignments).mockResolvedValue(
      mockReceivedAssignments,
    );
    vi.mocked(assignmentsApi.accept).mockResolvedValue({
      id: 'as-1',
      status: 'ACEITA',
      task_id: 't-1',
      task_titulo: 'Desenvolver API de Pagamentos',
      atribuido_id: 'u-me',
      atribuido_nome: 'Eu Mesmo',
      solicitante_id: 'u-sender-1',
      solicitante_nome: 'Mariana Souza',
      criado_em: '2026-10-01T10:00:00Z',
      respondido_em: '2026-10-01T11:00:00Z',
    });

    const onAction = vi.fn();
    renderWithProviders(<AssignmentsBox onAssignmentAction={onAction} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /aceitar/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /aceitar/i }));

    // Confirm dialog
    expect(
      screen.getByText('Aceitar convite de colaboração?'),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Aceitar Convite' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(assignmentsApi.accept).toHaveBeenCalledWith('as-1');
      expect(onAction).toHaveBeenCalled();
    });
  });

  it('permite recusar um convite pendente (C03)', async () => {
    vi.mocked(assignmentsApi.getMyAssignments).mockResolvedValue(
      mockReceivedAssignments,
    );
    vi.mocked(assignmentsApi.reject).mockResolvedValue({
      id: 'as-1',
      status: 'RECUSADA',
      task_id: 't-1',
      task_titulo: 'Desenvolver API de Pagamentos',
      atribuido_id: 'u-me',
      atribuido_nome: 'Eu Mesmo',
      solicitante_id: 'u-sender-1',
      solicitante_nome: 'Mariana Souza',
      criado_em: '2026-10-01T10:00:00Z',
      respondido_em: '2026-10-01T11:00:00Z',
    });

    const onAction = vi.fn();
    renderWithProviders(<AssignmentsBox onAssignmentAction={onAction} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /recusar/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /recusar/i }));

    // Confirm dialog
    expect(
      screen.getByText('Recusar convite de colaboração?'),
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Recusar Convite' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(assignmentsApi.reject).toHaveBeenCalledWith('as-1');
      expect(onAction).toHaveBeenCalled();
    });
  });

  it('alterna para a aba de convites enviados e não exibe botões de ação', async () => {
    vi.mocked(assignmentsApi.getMyAssignments).mockResolvedValue({
      total: 1,
      pagina: 1,
      limite: 10,
      atribuicoes: [
        {
          id: 'as-sent-1',
          task_id: 't-9',
          atribuido_id: 'u-target-1',
          atribuido_nome: 'Gabriel Costa',
          solicitante_id: 'u-me',
          solicitante_nome: 'Eu Mesmo',
          status: 'PENDENTE',
          criado_em: '2026-10-02T10:00:00Z',
          respondido_em: null,
          task_titulo: 'Configurar monitoramento Datadog',
        },
      ],
    });

    renderWithProviders(<AssignmentsBox />);

    const enviadasTab = screen.getByRole('button', { name: /enviados/i });
    fireEvent.click(enviadasTab);

    await waitFor(() => {
      expect(assignmentsApi.getMyAssignments).toHaveBeenCalledWith({
        tipo: 'enviadas',
        status: undefined,
        pagina: 1,
        limite: 10,
      });
      expect(
        screen.getByText('Configurar monitoramento Datadog'),
      ).toBeInTheDocument();
      expect(screen.getByText('Gabriel Costa')).toBeInTheDocument();
    });

    // Should NOT have accept/reject buttons for sent assignments
    expect(
      screen.queryByRole('button', { name: /aceitar/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /recusar/i }),
    ).not.toBeInTheDocument();
  });
});
