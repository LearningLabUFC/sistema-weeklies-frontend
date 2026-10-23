import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLE_IDS } from '@/config/roles';
import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { SectorCard } from '@/features/sectors/components/SectorCard';
import { SectorProvider } from '@/features/sectors/context/SectorContext';
import { useAuth } from '@/hooks/useAuth';
import type { SectorListItem, SectorListResponse } from '@/types/sectors';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: {
    list: vi.fn().mockResolvedValue({ setores: [], total: 0 }),
    getMySectors: vi.fn().mockResolvedValue([
      {
        id: 'sector-123',
        nome: 'Inteligência Artificial',
        descricao: 'Pesquisa e desenvolvimento em IA',
        ativo: true,
        papel: 'membro',
      },
    ]),
  },
}));

const mockSector: SectorListItem = {
  id: 'sector-123',
  nome: 'Inteligência Artificial',
  descricao: 'Pesquisa e desenvolvimento em IA',
  ativo: true,
  criado_em: '2026-01-01T00:00:00Z',
  qtd_membros: 8,
  qtd_lideres: 2,
};

describe('SectorCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(sectorsApi.list).mockResolvedValue({
      setores: [],
      total: 0,
      pagina: 1,
      limite: 10,
    } as SectorListResponse);
    vi.mocked(sectorsApi.getMySectors).mockResolvedValue([
      {
        id: 'sector-123',
        nome: 'Inteligência Artificial',
        descricao: 'Pesquisa e desenvolvimento em IA',
        ativo: true,
        papel: 'membro',
      },
    ]);
  });

  it('deve renderizar nome, descrição e contadores separados de membros e líderes', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'u1',
        nome_completo: 'User',
        email: 'u@test.com',
        matricula: '1',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'c1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.USUARIO,
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
          <SectorCard sector={mockSector} />
        </SectorProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Inteligência Artificial')).toBeInTheDocument();
    expect(
      screen.getByText('Pesquisa e desenvolvimento em IA'),
    ).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('membros')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('líderes')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();

    // Usuário comum não vê botão de gerenciar
    expect(screen.queryByText('Gerenciar')).not.toBeInTheDocument();
  });

  it('deve exibir botão Gerenciar para usuários com perfil de Admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        nome_completo: 'Admin',
        email: 'admin@test.com',
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
          <SectorCard sector={mockSector} />
        </SectorProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Gerenciar')).toBeInTheDocument();
  });

  it('permite clicar em Selecionar', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'u1',
        nome_completo: 'User',
        email: 'u@test.com',
        matricula: '1',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'c1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.USUARIO,
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
          <SectorCard sector={mockSector} />
        </SectorProvider>
      </MemoryRouter>,
    );

    const selectBtn = await screen.findByRole('button', {
      name: /selecionar/i,
    });
    await user.click(selectBtn);
    expect(screen.getByText('Selecionado')).toBeInTheDocument();
  });

  it('exibe botão Conhecer Setor e omite Selecionar para setores aos quais o usuário não pertence', async () => {
    vi.mocked(sectorsApi.getMySectors).mockResolvedValueOnce([]); // usuário não pertence a nenhum setor

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'u-externo',
        nome_completo: 'User Externo',
        email: 'externo@test.com',
        matricula: '2',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'c1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.USUARIO,
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
          <SectorCard sector={mockSector} />
        </SectorProvider>
      </MemoryRouter>,
    );

    // Botão Conhecer Setor sempre existe
    expect(screen.getByText('Conhecer Setor')).toBeInTheDocument();

    // Como o usuário não é membro deste setor, Selecionar não deve ser exibido
    expect(
      screen.queryByRole('button', { name: /^selecionar$/i }),
    ).not.toBeInTheDocument();
  });

  it('deve exibir botão Acompanhamento Setorial para administradores', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        nome_completo: 'Admin',
        email: 'admin@test.com',
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
          <SectorCard sector={mockSector} />
        </SectorProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: /acompanhamento setorial/i }),
    ).toBeInTheDocument();
  });

  it('deve exibir botão Acompanhamento Setorial para líderes do setor', async () => {
    vi.mocked(sectorsApi.getMySectors).mockResolvedValueOnce([
      {
        id: 'sector-123',
        nome: 'Inteligência Artificial',
        descricao: 'Pesquisa e desenvolvimento em IA',
        ativo: true,
        papel: 'lider',
      },
    ]);

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'lider-1',
        nome_completo: 'Líder',
        email: 'lider@test.com',
        matricula: '1',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'c1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.USUARIO,
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
          <SectorCard sector={mockSector} />
        </SectorProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('button', { name: /acompanhamento setorial/i }),
    ).toBeInTheDocument();
  });

  it('não deve exibir botão Acompanhamento Setorial para membros comuns', async () => {
    vi.mocked(sectorsApi.getMySectors).mockResolvedValueOnce([
      {
        id: 'sector-123',
        nome: 'Inteligência Artificial',
        descricao: 'Pesquisa e desenvolvimento em IA',
        ativo: true,
        papel: 'membro',
      },
    ]);

    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'u1',
        nome_completo: 'User Comum',
        email: 'u@test.com',
        matricula: '1',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'c1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.USUARIO,
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
          <SectorCard sector={mockSector} />
        </SectorProvider>
      </MemoryRouter>,
    );

    // Aguarda resolução inicial do SectorProvider
    await screen.findByRole('button', { name: /selecionar/i });

    expect(
      screen.queryByRole('button', { name: /acompanhamento setorial/i }),
    ).not.toBeInTheDocument();
  });
});
