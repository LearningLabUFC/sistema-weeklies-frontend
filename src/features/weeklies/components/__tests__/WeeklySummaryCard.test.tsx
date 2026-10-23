import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WeeklySummaryCard } from '@/features/weeklies/components/WeeklySummaryCard';
import type { WeeklySummaryResponse } from '@/types/weeklies';

describe('WeeklySummaryCard', () => {
  const mockWeekly: WeeklySummaryResponse = {
    id: 'w-123',
    usuario_id: 'u-1',
    membro_nome: 'João Silva',
    setor_id: 's-1',
    semana_referencia: '2026-09-28',
    status: 'ENVIADA',
    enviada_em: '2026-09-28T14:30:00Z',
    total_tasks: 4,
    total_concluidas: 3,
    total_impedimentos: 1,
    motivo_expiracao: null,
    criado_em: '2026-09-25T10:00:00Z',
  };

  it('renderiza semana de referência, setor, contadores e status', () => {
    const handleViewDetails = vi.fn();
    render(
      <WeeklySummaryCard
        weekly={mockWeekly}
        sectorName="Desenvolvimento"
        onViewDetails={handleViewDetails}
      />,
    );

    // Semana formatada DD/MM/YYYY
    expect(screen.getByText('Semana de 28/09/2026')).toBeInTheDocument();
    expect(screen.getByText('Desenvolvimento')).toBeInTheDocument();
    expect(screen.getByText('Enviada')).toBeInTheDocument();

    // Contadores
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Click Ver detalhes
    const viewBtn = screen.getByRole('button', { name: /ver detalhes/i });
    fireEvent.click(viewBtn);
    expect(handleViewDetails).toHaveBeenCalledWith('w-123');
  });

  it('exibe motivo de expiração quando a weekly estiver EXPIRADA', () => {
    const expiredWeekly: WeeklySummaryResponse = {
      ...mockWeekly,
      status: 'EXPIRADA',
      motivo_expiracao: 'OMISSAO_LIDERANCA',
    };

    render(
      <WeeklySummaryCard weekly={expiredWeekly} onViewDetails={vi.fn()} />,
    );

    expect(screen.getByText('Expirada')).toBeInTheDocument();
    expect(screen.getByText(/OMISSAO_LIDERANCA/i)).toBeInTheDocument();
  });
});
