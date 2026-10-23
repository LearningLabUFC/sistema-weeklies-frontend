import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AlertDialogProvider } from '@/context/AlertDialogProvider';
import { weekliesApi } from '@/features/weeklies/api/weekliesApi';
import { EvaluateWeeklyModal } from '@/features/weeklies/components/EvaluateWeeklyModal';
import * as dateUtils from '@/features/weeklies/utils/dateUtils';
import type { WeeklyResponse } from '@/types/weeklies';

vi.mock('@/features/weeklies/api/weekliesApi', () => ({
  weekliesApi: {
    evaluate: vi.fn(),
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<AlertDialogProvider>{ui}</AlertDialogProvider>);
};

describe('EvaluateWeeklyModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    weeklyId: 'w-100',
    semanaReferencia: '2026-09-28',
    membroNome: 'Carlos Eduardo',
    membroId: 'u-carlos',
    currentUserId: 'u-leader',
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(dateUtils, 'podeRejeitarWeekly').mockReturnValue(true);
  });

  it('renderiza opções de aprovação e rejeição para o líder', () => {
    renderWithProviders(<EvaluateWeeklyModal {...defaultProps} />);

    expect(screen.getByText('Avaliar Relatório Semanal')).toBeInTheDocument();
    expect(screen.getByText(/Carlos Eduardo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Aprovar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rejeitar/i)).toBeInTheDocument();
  });

  it('permite aprovação com feedback opcional e chama weekliesApi.evaluate', async () => {
    vi.mocked(weekliesApi.evaluate).mockResolvedValue({
      id: 'w-100',
      status: 'APROVADA',
    } as WeeklyResponse);

    renderWithProviders(<EvaluateWeeklyModal {...defaultProps} />);

    const submitBtn = screen.getByRole('button', {
      name: /confirmar aprovação/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(weekliesApi.evaluate).toHaveBeenCalledWith('w-100', {
        status: 'APROVADA',
        observacao_lider: null,
      });
      expect(defaultProps.onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'w-100', status: 'APROVADA' }),
      );
    });
  });

  it('exige feedback obrigatório ao selecionar Rejeitar', async () => {
    renderWithProviders(<EvaluateWeeklyModal {...defaultProps} />);

    const rejectRadio = screen.getByLabelText(/Rejeitar/i);
    fireEvent.click(rejectRadio);

    const submitBtn = screen.getByRole('button', {
      name: /confirmar rejeição/i,
    });
    fireEvent.click(submitBtn);

    expect(
      screen.getByText(
        /O feedback da liderança é obrigatório ao rejeitar uma weekly/i,
      ),
    ).toBeInTheDocument();
    expect(weekliesApi.evaluate).not.toHaveBeenCalled();

    // Digita feedback e submete com sucesso
    const textarea = screen.getByPlaceholderText(
      /descreva os motivos da rejeição/i,
    );
    fireEvent.change(textarea, {
      target: {
        value: 'Favor detalhar os impedimentos relatados na tarefa 2.',
      },
    });

    vi.mocked(weekliesApi.evaluate).mockResolvedValue({
      id: 'w-100',
      status: 'REJEITADA',
    } as WeeklyResponse);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(weekliesApi.evaluate).toHaveBeenCalledWith('w-100', {
        status: 'REJEITADA',
        observacao_lider:
          'Favor detalhar os impedimentos relatados na tarefa 2.',
      });
      expect(defaultProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('bloqueia autoavaliação quando membroId for igual ao currentUserId', () => {
    renderWithProviders(
      <EvaluateWeeklyModal
        {...defaultProps}
        membroId="u-same-user"
        currentUserId="u-same-user"
      />,
    );

    expect(screen.getByText(/Autoavaliação bloqueada/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /As regras do sistema impedem que um membro ou líder avalie a própria weekly/i,
      ),
    ).toBeInTheDocument();

    const closeButtons = screen.getAllByRole('button', {
      name: /fechar/i,
    });
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('desabilita opção de rejeitar quando o prazo de rejeição expirou', () => {
    vi.spyOn(dateUtils, 'podeRejeitarWeekly').mockReturnValue(false);

    renderWithProviders(<EvaluateWeeklyModal {...defaultProps} />);

    expect(
      screen.getByText(
        /A opção de rejeição fica indisponível após quarta-feira/i,
      ),
    ).toBeInTheDocument();

    const rejectRadio = screen.getByLabelText(/Rejeitar/i);
    expect(rejectRadio).toBeDisabled();
  });
});
