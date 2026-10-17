import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { SectorProvider } from '@/features/sectors/context/SectorContext';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import AdminSectorDetail from '@/pages/admin/Sectors/AdminSectorDetail';

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: {
    list: vi.fn().mockResolvedValue({ setores: [] }),
    getById: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
  },
}));

describe('AdminSectorDetail Page', () => {
  let mockAlertConfig: { onConfirm?: () => void } = {};

  beforeEach(() => {
    vi.clearAllMocks();
    mockAlertConfig = {};

    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn().mockImplementation(config => {
        mockAlertConfig = config;
      }),
      hideAlertDialog: vi.fn(),
    });

    vi.mocked(sectorsApi.getById).mockResolvedValue({
      id: 'sec-123',
      nome: 'Back-end Python',
      descricao: 'Desenvolvimento FastAPI',
      ativo: true,
      criado_em: '2026-01-01T00:00:00Z',
      membros: [
        {
          id: 'u-1',
          nome_completo: 'Lucas Rocha',
          email: 'lucas@ufc.br',
          papel: 'membro',
        },
        {
          id: 'u-2',
          nome_completo: 'Mariana Lima',
          email: 'mariana@ufc.br',
          papel: 'lider',
        },
      ],
    });
  });

  it('deve carregar detalhes do setor e exibir lista de membros com papéis', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/setores/sec-123']}>
        <SectorProvider>
          <Routes>
            <Route
              path="/admin/setores/:sectorId"
              element={<AdminSectorDetail />}
            />
          </Routes>
        </SectorProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Back-end Python')).toBeInTheDocument();
    });

    expect(screen.getByText('Lucas Rocha')).toBeInTheDocument();
    expect(screen.getByText('Mariana Lima')).toBeInTheDocument();
    expect(screen.getByText('lucas@ufc.br')).toBeInTheDocument();
    expect(screen.getByText('mariana@ufc.br')).toBeInTheDocument();

    // Badges de papéis
    expect(screen.getByText('Membro')).toBeInTheDocument();
    expect(screen.getByText('Líder')).toBeInTheDocument();
  });

  it('permite alternar papel do membro com confirmação (S08)', async () => {
    const user = userEvent.setup();
    vi.mocked(sectorsApi.updateMemberRole).mockResolvedValueOnce({
      mensagem: 'Papel atualizado com sucesso.',
    });

    render(
      <MemoryRouter initialEntries={['/admin/setores/sec-123']}>
        <SectorProvider>
          <Routes>
            <Route
              path="/admin/setores/:sectorId"
              element={<AdminSectorDetail />}
            />
          </Routes>
        </SectorProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Lucas Rocha')).toBeInTheDocument();
    });

    // Clica em "Tornar líder" no Lucas Rocha
    const toggleBtn = screen.getByRole('button', { name: /tornar líder/i });
    await user.click(toggleBtn);

    expect(mockAlertConfig.onConfirm).toBeDefined();

    // Executa a confirmação
    await act(async () => {
      mockAlertConfig.onConfirm!();
    });

    expect(sectorsApi.updateMemberRole).toHaveBeenCalledWith('sec-123', 'u-1', {
      papel: 'lider',
    });
  });

  it('permite remover membro do setor com confirmação (S07)', async () => {
    const user = userEvent.setup();
    vi.mocked(sectorsApi.removeMember).mockResolvedValueOnce({
      mensagem: 'Membro removido com sucesso.',
    });

    render(
      <MemoryRouter initialEntries={['/admin/setores/sec-123']}>
        <SectorProvider>
          <Routes>
            <Route
              path="/admin/setores/:sectorId"
              element={<AdminSectorDetail />}
            />
          </Routes>
        </SectorProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Lucas Rocha')).toBeInTheDocument();
    });

    const removeBtns = screen.getAllByTitle(/remover do setor/i);
    await user.click(removeBtns[0]);

    expect(mockAlertConfig.onConfirm).toBeDefined();

    await act(async () => {
      mockAlertConfig.onConfirm!();
    });

    expect(sectorsApi.removeMember).toHaveBeenCalledWith('sec-123', 'u-1');
  });
});
