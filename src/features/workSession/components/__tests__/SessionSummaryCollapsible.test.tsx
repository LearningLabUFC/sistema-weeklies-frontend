import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SectorContext } from '@/features/sectors/context/sectorContextDef';
import { SessionSummaryCollapsible } from '@/features/workSession/components/SessionSummaryCollapsible';
import { useAuth } from '@/hooks/useAuth';
import { workSessionService } from '@/services/workSessionService';
import type { WorkSessionSummaryResponse } from '@/types/workSession';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/services/workSessionService', () => ({
  workSessionService: {
    getSummary: vi.fn(),
  },
}));

describe('SessionSummaryCollapsible Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-1',
        nome_completo: 'Aluno Teste',
        email: 'aluno@learninglab.com',
        matricula: '123456',
        data_nascimento: '2000-01-01',
        data_ingresso: '2023-01-01',
        meta_horas_semanais: 20, // Meta de 20h semanais
        foto_perfil: '',
        curso_id: 'curso-1',
        status_id: 'ativo-1',
        global_role: 'aluno',
      },
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      isAuthenticated: true,
      checkUserStatus: vi.fn(),
    });
  });

  const mockSummary: WorkSessionSummaryResponse = {
    usuario_id: 'user-1',
    inicio: '2026-10-12T00:00:00Z',
    fim: '2026-10-18T23:59:59Z',
    tempo_trabalhado_segundos: 36000, // 10h (50% de 20h)
  };

  it('deve buscar e exibir o resumo e a barra de progresso da meta ao expandir', async () => {
    vi.mocked(workSessionService.getSummary).mockResolvedValueOnce(mockSummary);

    render(<SessionSummaryCollapsible />);

    expect(workSessionService.getSummary).not.toHaveBeenCalled();

    // Expande o menu retrátil
    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(workSessionService.getSummary).toHaveBeenCalledTimes(1);
      expect(screen.getAllByText('10h 00m')[0]).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('50% concluído')).toBeInTheDocument();
      expect(screen.getByText('/ 20h')).toBeInTheDocument();
    });
  });

  it('deve repassar setor_id quando fornecido initialSectorId', async () => {
    vi.mocked(workSessionService.getSummary).mockResolvedValueOnce({
      ...mockSummary,
      setor_id: 'setor-dev',
    });

    render(<SessionSummaryCollapsible initialSectorId="setor-dev" />);

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(workSessionService.getSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          setor_id: 'setor-dev',
        }),
      );
    });
  });

  it('deve permitir que líder/admin filtre por usuário específico', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        nome_completo: 'Admin Teste',
        email: 'admin@learninglab.com',
        matricula: '999999',
        data_nascimento: '1990-01-01',
        data_ingresso: '2020-01-01',
        meta_horas_semanais: 0,
        foto_perfil: '',
        curso_id: 'curso-1',
        status_id: 'ativo-1',
        global_role: 'admin',
      },
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      isAuthenticated: true,
      checkUserStatus: vi.fn(),
    });

    vi.mocked(workSessionService.getSummary).mockResolvedValue(mockSummary);

    render(<SessionSummaryCollapsible />);

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(
          /uuid do usuário ou deixe vazio para você/i,
        ),
      ).toBeInTheDocument();
    });

    const userInput = screen.getByPlaceholderText(
      /uuid do usuário ou deixe vazio para você/i,
    );
    fireEvent.change(userInput, { target: { value: 'colaborador-uuid' } });
    fireEvent.click(screen.getByRole('button', { name: /^filtrar$/i }));

    await waitFor(() => {
      expect(workSessionService.getSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          usuario_id: 'colaborador-uuid',
        }),
      );
    });
  });

  it('deve alternar para filtro de mês e buscar novo resumo', async () => {
    vi.mocked(workSessionService.getSummary).mockResolvedValue(mockSummary);

    render(<SessionSummaryCollapsible />);

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(screen.getAllByText('10h 00m')[0]).toBeInTheDocument();
    });

    // Clica no botão "Este Mês"
    fireEvent.click(screen.getByRole('button', { name: /este mês/i }));

    await waitFor(() => {
      expect(workSessionService.getSummary).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Total em Horas Decimais')).toBeInTheDocument();
    });
  });

  it('deve exibir indicador de erro com opção de tentar novamente', async () => {
    vi.mocked(workSessionService.getSummary).mockRejectedValueOnce({
      response: { data: { detail: 'Não foi possível carregar o resumo.' } },
    });

    render(<SessionSummaryCollapsible />);

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Não foi possível carregar o resumo.'),
      ).toBeInTheDocument();
    });

    vi.mocked(workSessionService.getSummary).mockResolvedValueOnce(mockSummary);

    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }));

    await waitFor(() => {
      expect(screen.getAllByText('10h 00m')[0]).toBeInTheDocument();
    });
  });

  it('deve exibir indicador de "Meta atingida!" quando ultrapassar ou igualar 100%', async () => {
    const metaAtingidaSummary: WorkSessionSummaryResponse = {
      ...mockSummary,
      tempo_trabalhado_segundos: 72000, // 20h
    };
    vi.mocked(workSessionService.getSummary).mockResolvedValue(
      metaAtingidaSummary,
    );

    render(<SessionSummaryCollapsible />);

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(screen.getByText('Meta atingida!')).toBeInTheDocument();
    });
  });

  it('não deve vazar setores da organização para membro comum sem setores vinculados', async () => {
    vi.mocked(workSessionService.getSummary).mockResolvedValue(mockSummary);

    const mockSectorContextValue = {
      sectors: [
        {
          id: 'setor-dev',
          nome: 'Desenvolvimento',
          descricao: '',
          criado_em: '',
          atualizado_em: '',
          ativo: true,
          qtd_membros: 0,
          qtd_lideres: 0,
        },
        {
          id: 'setor-mkt',
          nome: 'Marketing',
          descricao: '',
          criado_em: '',
          atualizado_em: '',
          ativo: true,
          qtd_membros: 0,
          qtd_lideres: 0,
        },
      ],
      mySectors: [],
      isMemberOf: vi.fn(),
      getMyRole: vi.fn(),
      selectedSectorId: null,
      selectedSectorName: null,
      selectedSector: null,
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    };

    render(
      <SectorContext.Provider value={mockSectorContextValue}>
        <SessionSummaryCollapsible />
      </SectorContext.Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(screen.getByText('Nenhum setor vinculado')).toBeInTheDocument();
      expect(screen.queryByText('Desenvolvimento')).not.toBeInTheDocument();
      expect(screen.queryByText('Marketing')).not.toBeInTheDocument();
    });

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });

  it('deve permitir filtrar estritamente pelos setores vinculados ao membro', async () => {
    vi.mocked(workSessionService.getSummary).mockResolvedValue(mockSummary);

    const mockSectorContextValue = {
      sectors: [
        {
          id: 'setor-dev',
          nome: 'Desenvolvimento',
          descricao: '',
          criado_em: '',
          atualizado_em: '',
          ativo: true,
          qtd_membros: 0,
          qtd_lideres: 0,
        },
        {
          id: 'setor-design',
          nome: 'Design UI/UX',
          descricao: '',
          criado_em: '',
          atualizado_em: '',
          ativo: true,
          qtd_membros: 0,
          qtd_lideres: 0,
        },
      ],
      mySectors: [
        {
          id: 'setor-design',
          nome: 'Design UI/UX',
          descricao: '',
          papel: 'membro' as const,
          criado_em: '',
          ativo: true,
        },
      ],
      isMemberOf: vi.fn(),
      getMyRole: vi.fn(),
      selectedSectorId: null,
      selectedSectorName: null,
      selectedSector: null,
      selectSector: vi.fn(),
      setSelectedSectorId: vi.fn(),
      clearSelectedSector: vi.fn(),
      isLoading: false,
      refreshSectors: vi.fn(),
    };

    render(
      <SectorContext.Provider value={mockSectorContextValue}>
        <SessionSummaryCollapsible />
      </SectorContext.Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /resumo de horas/i }));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(
      await screen.findByRole('option', { name: 'Design UI/UX' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Desenvolvimento' }),
    ).not.toBeInTheDocument();
  });
});
