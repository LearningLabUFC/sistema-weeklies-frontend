import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLE_IDS } from '@/config/roles';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { SectorProvider } from '@/features/sectors/context/SectorContext';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAuth } from '@/hooks/useAuth';
import AdminSectorsList from '@/pages/admin/Sectors/AdminSectorsList';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AdminSectorsList Page', () => {
  const mockShowAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: mockShowAlert,
      hideAlertDialog: vi.fn(),
    });

    vi.mocked(sectorsApi.list).mockResolvedValue({
      setores: [
        {
          id: 'sec-1',
          nome: 'Front-end',
          descricao: 'Setor de interfaces',
          ativo: true,
          criado_em: '2026-01-01T00:00:00Z',
          qtd_membros: 4,
          qtd_lideres: 1,
        },
      ],
      total: 1,
      pagina: 1,
      limite: 10,
    });
  });

  it('deve listar setores e permitir abrir modal de novo setor', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        nome_completo: 'Admin',
        email: 'admin@ufc.br',
        matricula: '1',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'c1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.ADMIN,
      },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter>
        <SectorProvider>
          <AdminSectorsList />
        </SectorProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Front-end')).toBeInTheDocument();
    });

    expect(screen.getByText('Setor de interfaces')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    const novoBtn = screen.getByRole('button', { name: /novo setor/i });
    await user.click(novoBtn);

    expect(screen.getByText('Criar Novo Setor')).toBeInTheDocument();
  });

  it('deve exibir botão de exclusão apenas para Super Admin (S05)', async () => {
    // 1. Regular Admin não deve ter botão de exclusão S05
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        nome_completo: 'Admin',
        email: 'admin@ufc.br',
        matricula: '1',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'c1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.ADMIN,
      },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    const { rerender } = render(
      <MemoryRouter>
        <SectorProvider>
          <AdminSectorsList />
        </SectorProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Front-end')).toBeInTheDocument();
    });

    expect(
      screen.queryByTitle(/desativar setor \(soft delete\)/i),
    ).not.toBeInTheDocument();

    // 2. Super Admin deve ter botão de exclusão S05
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'super-1',
        nome_completo: 'Super Admin',
        email: 'super@ufc.br',
        matricula: '1',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'c1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.SUPER_ADMIN,
      },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    rerender(
      <MemoryRouter>
        <SectorProvider>
          <AdminSectorsList />
        </SectorProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByTitle(/desativar setor \(soft delete\)/i),
    ).toBeInTheDocument();
  });
});
