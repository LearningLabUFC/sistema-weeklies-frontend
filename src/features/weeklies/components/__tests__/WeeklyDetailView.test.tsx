import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlertDialogProvider } from '@/context/AlertDialogProvider';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { WeeklyDetailView } from '@/features/weeklies/components/WeeklyDetailView';
import type { WeeklyResponse } from '@/types/weeklies';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<AlertDialogProvider>{ui}</AlertDialogProvider>);
};

vi.mock('@/features/weeklies/api/weekliesApi', () => ({
  weekliesApi: {
    getById: vi.fn(),
    submit: vi.fn(),
    reopen: vi.fn(),
    updateTask: vi.fn(),
    removeTask: vi.fn(),
    evaluate: vi.fn(),
  },
}));

describe('WeeklyDetailView', () => {
  const baseWeekly: WeeklyResponse = {
    id: 'w-456',
    usuario_id: 'u-1',
    membro_nome: 'Maria Silva',
    setor_id: 's-1',
    semana_referencia: '2026-09-28',
    status: 'APROVADA',
    enviada_em: '2026-09-28T18:00:00Z',
    avaliada_em: '2026-09-29T10:00:00Z',
    avaliada_por: 'u-leader',
    observacao_lider: 'Parabéns pelas entregas da semana!',
    motivo_expiracao: null,
    detalhe_expiracao: null,
    criado_em: '2026-09-25T08:00:00Z',
    atualizado_em: '2026-09-29T10:00:00Z',
    tasks: [
      {
        id: 'wt-1',
        task_id: 't-1',
        titulo: 'Tarefa Snapshot Original',
        descricao: 'Descrição histórica persistida',
        status_task: 'CONCLUIDA',
        prazo_conclusao: '2026-10-02',
        concluida: true,
        impedimento: null,
        posicao: 0,
        origem: 'NOVA',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carrega weekly via W04 e exibe snapshots, status e feedback da liderança', async () => {
    vi.mocked(weekliesApi.getById).mockResolvedValue(baseWeekly);

    renderWithProviders(<WeeklyDetailView weeklyId="w-456" />);

    expect(screen.getByTestId('weekly-detail-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Semana de 28/09/2026')).toBeInTheDocument();
    });

    expect(screen.getByText('Aprovada')).toBeInTheDocument();
    expect(screen.getByText('Feedback da Liderança')).toBeInTheDocument();
    expect(
      screen.getByText('Parabéns pelas entregas da semana!'),
    ).toBeInTheDocument();

    // Snapshot da tarefa intacto
    expect(screen.getByText('Tarefa Snapshot Original')).toBeInTheDocument();
    expect(
      screen.getByText('Descrição histórica persistida'),
    ).toBeInTheDocument();
  });

  it('exibe motivo e detalhe de expiração quando status for EXPIRADA', async () => {
    const expiredWeekly: WeeklyResponse = {
      ...baseWeekly,
      status: 'EXPIRADA',
      motivo_expiracao: 'CORRECAO_NAO_ENVIADA',
      detalhe_expiracao: 'O membro não submeteu correções dentro das 24 horas.',
      expirada_em: '2026-09-30T12:00:00Z',
    } as WeeklyResponse & { expirada_em?: string };

    vi.mocked(weekliesApi.getById).mockResolvedValue(expiredWeekly);

    renderWithProviders(<WeeklyDetailView weeklyId="w-456" />);

    await waitFor(() => {
      expect(screen.getByText('Weekly Expirada')).toBeInTheDocument();
    });

    expect(screen.getByText(/CORRECAO_NAO_ENVIADA/i)).toBeInTheDocument();
    expect(
      screen.getByText(/O membro não submeteu correções dentro das 24 horas./i),
    ).toBeInTheDocument();
  });

  it('permite reenvio de weekly REJEITADA durante o prazo de carência de 24h', async () => {
    // Avaliada há 2 horas (dentro das 24h)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const rejectedWeekly: WeeklyResponse = {
      ...baseWeekly,
      status: 'REJEITADA',
      avaliada_em: twoHoursAgo,
      observacao_lider: 'Ajuste os impedimentos na tarefa 1.',
    };

    vi.mocked(weekliesApi.getById).mockResolvedValue(rejectedWeekly);
    vi.mocked(weekliesApi.submit).mockResolvedValue({
      ...rejectedWeekly,
      status: 'ENVIADA',
    });

    const handleUpdated = vi.fn();
    renderWithProviders(
      <WeeklyDetailView weeklyId="w-456" onWeeklyUpdated={handleUpdated} />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Carência de 24 horas ativa para correção/i),
      ).toBeInTheDocument();
    });

    const resubmitBtn = screen.getByRole('button', {
      name: /reenviar weekly corrigida/i,
    });
    expect(resubmitBtn).toBeInTheDocument();

    fireEvent.click(resubmitBtn);

    await waitFor(() => {
      expect(weekliesApi.submit).toHaveBeenCalledWith('w-456');
      expect(handleUpdated).toHaveBeenCalled();
    });
  });

  it('não exibe ações de edição ou reenvio para avaliador/admin visualizando weekly rejeitada de outro membro', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const rejectedWeekly: WeeklyResponse = {
      ...baseWeekly,
      usuario_id: 'u-membro-rai',
      status: 'REJEITADA',
      avaliada_em: twoHoursAgo,
      observacao_lider: 'Você não vai poder fazer isso',
    };

    vi.mocked(weekliesApi.getById).mockResolvedValue(rejectedWeekly);

    renderWithProviders(
      <WeeklyDetailView
        weeklyId="w-456"
        isLeaderOrAdmin={true}
        currentUserId="u-super-admin"
        isModal={true}
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Aguardando correção do membro/i),
      ).toBeInTheDocument();
    });

    // Não deve exibir o banner instruindo o leitor a corrigir
    expect(
      screen.queryByText(/Carência de 24 horas ativa para correção/i),
    ).not.toBeInTheDocument();

    // Não deve exibir botão de adicionar tarefa nem reenviar weekly
    expect(
      screen.queryByRole('button', { name: /adicionar tarefa/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /reenviar weekly corrigida/i }),
    ).not.toBeInTheDocument();

    // Checkbox da tarefa deve estar desabilitado para o avaliador
    const checkbox = screen.getByRole('checkbox', {
      name: /marcar tarefa snapshot original como concluída/i,
    });
    expect(checkbox).toBeDisabled();

    // Botão Fechar deve estar visível no rodapé do modal
    expect(
      screen.getByRole('button', { name: /^fechar$/i }),
    ).toBeInTheDocument();
  });

  it('dispara onWeeklyUpdated após avaliação da weekly pelo líder', async () => {
    const sentWeekly: WeeklyResponse = {
      ...baseWeekly,
      status: 'ENVIADA',
      usuario_id: 'u-membro',
    };
    const approvedWeekly: WeeklyResponse = {
      ...sentWeekly,
      status: 'APROVADA',
    };

    vi.mocked(weekliesApi.getById).mockResolvedValue(sentWeekly);
    vi.mocked(weekliesApi.evaluate).mockResolvedValue(approvedWeekly);

    const handleUpdated = vi.fn();
    renderWithProviders(
      <WeeklyDetailView
        weeklyId="w-456"
        isLeaderOrAdmin={true}
        currentUserId="u-leader"
        onWeeklyUpdated={handleUpdated}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Semana de 28/09/2026')).toBeInTheDocument();
    });

    const evalBtn = screen.getByRole('button', { name: /avaliar weekly/i });
    fireEvent.click(evalBtn);

    expect(screen.getByText('Avaliar Relatório Semanal')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', {
      name: /confirmar aprovação/i,
    });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(weekliesApi.evaluate).toHaveBeenCalledWith(
        'w-456',
        expect.objectContaining({ status: 'APROVADA' }),
      );
      expect(handleUpdated).toHaveBeenCalledWith(approvedWeekly);
    });
  });

  it('não deve exibir botão de fechar no cabeçalho quando renderizado dentro de modal (isModal=true)', async () => {
    vi.mocked(weekliesApi.getById).mockResolvedValue(baseWeekly);

    const handleClose = vi.fn();
    renderWithProviders(
      <WeeklyDetailView
        weeklyId="w-456"
        isModal={true}
        onClose={handleClose}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Semana de 28/09/2026')).toBeInTheDocument();
    });

    // O botão com X no cabeçalho não deve existir para evitar duplicidade com o DialogContent
    expect(
      screen.queryByRole('button', { name: /fechar detalhe/i }),
    ).not.toBeInTheDocument();

    // Mas o botão Fechar no rodapé do modal continua presente
    expect(
      screen.getByRole('button', { name: /^fechar$/i }),
    ).toBeInTheDocument();
  });

  it('bloqueia e desabilita o reenvio da weekly enquanto houver alteração de impedimento pendente de salvamento', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const rejectedWeekly: WeeklyResponse = {
      ...baseWeekly,
      status: 'REJEITADA',
      avaliada_em: twoHoursAgo,
      observacao_lider: 'Favor justificar atrasos e corrigir pendências.',
      tasks: [
        {
          id: 'wt-1',
          task_id: 't-1',
          titulo: 'Tarefa Rejeitada',
          descricao: 'Descrição',
          status_task: 'PENDENTE',
          prazo_conclusao: '2026-10-02',
          concluida: false,
          impedimento: null,
          posicao: 0,
          origem: 'NOVA',
        },
      ],
    };

    vi.mocked(weekliesApi.getById).mockResolvedValue(rejectedWeekly);
    vi.mocked(weekliesApi.submit).mockResolvedValue({
      ...rejectedWeekly,
      status: 'ENVIADA',
    });

    renderWithProviders(<WeeklyDetailView weeklyId="w-456" />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /reenviar weekly corrigida/i }),
      ).toBeEnabled();
    });

    // Abre seção de impedimento e digita texto não salvo
    const addImpedimentBtn = screen.getByRole('button', {
      name: /registrar impedimento/i,
    });
    fireEvent.click(addImpedimentBtn);

    const textarea = screen.getByPlaceholderText(
      /explique detalhadamente o motivo/i,
    );
    fireEvent.change(textarea, {
      target: { value: 'Bloqueio externo na API' },
    });

    // Botão de reenvio deve ficar desabilitado e exibir mensagem de aviso
    expect(
      screen.getByText(/salve as alterações pendentes antes de enviar/i),
    ).toBeInTheDocument();

    const resubmitBtn = screen.getByRole('button', {
      name: /reenviar weekly corrigida/i,
    });
    expect(resubmitBtn).toBeDisabled();

    fireEvent.click(resubmitBtn);
    expect(weekliesApi.submit).not.toHaveBeenCalled();

    // Cancelar restaura o estado e libera o reenvio
    const cancelBtn = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelBtn);

    expect(
      screen.queryByText(/salve as alterações pendentes antes de enviar/i),
    ).not.toBeInTheDocument();
    expect(resubmitBtn).toBeEnabled();
  });

  it('permite que líderes e administradores removam tarefas herdadas de outro membro em weekly RASCUNHO ou REJEITADA', async () => {
    const draftWeeklyOtherMember: WeeklyResponse = {
      ...baseWeekly,
      usuario_id: 'u-membro-outro',
      status: 'RASCUNHO',
      tasks: [
        {
          id: 'wt-herdada',
          task_id: 't-10',
          titulo: 'Tarefa Herdada de Outro Membro',
          descricao: 'Rollover',
          status_task: 'PENDENTE',
          prazo_conclusao: '2026-10-02',
          concluida: false,
          impedimento: null,
          posicao: 0,
          origem: 'HERDADA',
        },
        {
          id: 'wt-nova',
          task_id: 't-11',
          titulo: 'Segunda Tarefa',
          descricao: 'Nova',
          status_task: 'PENDENTE',
          prazo_conclusao: '2026-10-02',
          concluida: false,
          impedimento: null,
          posicao: 1,
          origem: 'NOVA',
        },
      ],
    };

    vi.mocked(weekliesApi.getById).mockResolvedValue(draftWeeklyOtherMember);
    vi.mocked(weekliesApi.removeTask).mockResolvedValue({
      mensagem: 'Tarefa removida da weekly com sucesso.',
    });

    renderWithProviders(
      <WeeklyDetailView
        weeklyId="w-456"
        isLeaderOrAdmin={true}
        currentUserId="u-lider-setor"
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Tarefa Herdada de Outro Membro'),
      ).toBeInTheDocument();
    });

    // Deve exibir botão de remover tarefa mesmo sendo herdada de outro membro
    const removeButtons = screen.getAllByRole('button', {
      name: /remover tarefa da weekly/i,
    });
    expect(removeButtons.length).toBeGreaterThan(0);

    // Clica no botão de remover da tarefa herdada
    fireEvent.click(removeButtons[0]);

    // Diálogo de confirmação do AlertDialog deve aparecer
    const confirmBtn = screen.getByRole('button', { name: /^remover$/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(weekliesApi.removeTask).toHaveBeenCalledWith(
        'w-456',
        'wt-herdada',
      );
    });
  });
});
