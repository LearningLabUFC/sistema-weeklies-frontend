import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { warningsApi } from '@/features/weeklies/api/warningsApi';
import { WarningsList } from '@/features/weeklies/components/WarningsList';
import type { WeeklyWarningListResponse } from '@/types/weeklies';

vi.mock('@/features/weeklies/api/warningsApi', () => ({
  warningsApi: {
    getMyWarnings: vi.fn(),
    getSectorWarnings: vi.fn(),
  },
}));

const mockMyWarnings: WeeklyWarningListResponse = {
  total: 2,
  pagina: 1,
  limite: 10,
  advertencias: [
    {
      id: 'warn-1',
      usuario_id: 'u-me',
      usuario_nome: 'Eu Mesmo',
      setor_id: 'sec-1',
      setor_nome: 'Marketing',
      tipo: '1a_ADVERTENCIA',
      semana_referencia: '2026-09-21',
      semanas_ausentes: 1,
      criado_em: '2026-09-22T08:00:00Z',
    },
    {
      id: 'warn-2',
      usuario_id: 'u-me',
      usuario_nome: 'Eu Mesmo',
      setor_id: 'sec-1',
      setor_nome: 'Marketing',
      tipo: '2a_ADVERTENCIA',
      semana_referencia: '2026-09-28',
      semanas_ausentes: 2,
      criado_em: '2026-09-29T08:00:00Z',
    },
  ],
};

const mockSectorWarnings: WeeklyWarningListResponse = {
  total: 1,
  pagina: 1,
  limite: 10,
  advertencias: [
    {
      id: 'warn-3',
      usuario_id: 'u-other',
      usuario_nome: 'Juliana Paes',
      tipo: 'DESLIGAMENTO',
      semana_referencia: '2026-09-28',
      semanas_ausentes: 3,
      criado_em: '2026-09-29T08:00:00Z',
      setor_id: 'sec-1',
      setor_nome: 'Engenharia',
    },
  ],
};

describe('WarningsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no modo "me" (A01), busca advertências do usuário e renderiza badges de severidade', async () => {
    vi.mocked(warningsApi.getMyWarnings).mockResolvedValue(mockMyWarnings);

    render(<WarningsList mode="me" />);

    expect(
      screen.getByText(/Minhas Advertências \(A01\)/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(warningsApi.getMyWarnings).toHaveBeenCalledWith({
        pagina: 1,
        limite: 10,
      });
      expect(screen.getByText('1ª Advertência')).toBeInTheDocument();
      expect(screen.getByText('2ª Advertência')).toBeInTheDocument();
      expect(screen.getByText(/1 ausência consecutiva/i)).toBeInTheDocument();
      expect(screen.getByText(/2 ausências consecutivas/i)).toBeInTheDocument();
    });
  });

  it('no modo "sector" (A02), busca advertências do setor com o nome do membro', async () => {
    vi.mocked(warningsApi.getSectorWarnings).mockResolvedValue(
      mockSectorWarnings,
    );

    render(<WarningsList mode="sector" sectorId="sec-1" />);

    expect(
      screen.getByText(/Advertências de Membros do Setor \(A02\)/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(warningsApi.getSectorWarnings).toHaveBeenCalledWith('sec-1', {
        pagina: 1,
        limite: 10,
      });
      expect(screen.getByText('Desligamento')).toBeInTheDocument();
      expect(screen.getByText('Juliana Paes')).toBeInTheDocument();
      expect(screen.getByText(/3 ausências consecutivas/i)).toBeInTheDocument();
    });
  });

  it('exibe estado vazio quando não há advertências cadastradas', async () => {
    vi.mocked(warningsApi.getMyWarnings).mockResolvedValue({
      total: 0,
      pagina: 1,
      limite: 10,
      advertencias: [],
    });

    render(<WarningsList mode="me" />);

    await waitFor(() => {
      expect(
        screen.getByText('Nenhuma advertência registrada'),
      ).toBeInTheDocument();
    });
  });

  it('permite recarregar a lista clicando em Atualizar', async () => {
    vi.mocked(warningsApi.getMyWarnings).mockResolvedValue(mockMyWarnings);

    render(<WarningsList mode="me" />);

    await waitFor(() => {
      expect(screen.getByText('1ª Advertência')).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole('button', { name: /atualizar/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(warningsApi.getMyWarnings).toHaveBeenCalledTimes(2);
    });
  });
});
