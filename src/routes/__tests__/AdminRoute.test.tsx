import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLE_IDS } from '@/config/roles';
import { useAuth } from '@/hooks/useAuth';
import { AdminRoute } from '@/routes/AdminRoute';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('AdminRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir spinner durante o carregamento', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/teste']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin/teste" element={<h1>Painel Admin</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Verificando permissões...')).toBeInTheDocument();
    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument();
  });

  it('deve redirecionar para /login se não estiver autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/teste']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin/teste" element={<h1>Painel Admin</h1>} />
          </Route>
          <Route path="/login" element={<h1>Login Page</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument();
  });

  it('deve redirecionar para / se o usuário tiver cargo comum de usuário', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        id: 'user-1',
        nome_completo: 'Membro Comum',
        email: 'user@exemplo.com',
        matricula: '123456',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'curso-1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2', // ativo
        global_role: ROLE_IDS.USUARIO,
      },
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/teste']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin/teste" element={<h1>Painel Admin</h1>} />
          </Route>
          <Route path="/" element={<h1>Home Usuário</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Home Usuário')).toBeInTheDocument();
    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument();
  });

  it('deve renderizar o conteúdo para Administrador (ROLE_IDS.ADMIN)', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        id: 'admin-1',
        nome_completo: 'Administrador',
        email: 'admin@exemplo.com',
        matricula: '123456',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'curso-1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.ADMIN,
      },
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/teste']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin/teste" element={<h1>Painel Admin</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Painel Admin')).toBeInTheDocument();
  });

  it('deve renderizar o conteúdo para Super Administrador (ROLE_IDS.SUPER_ADMIN)', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        id: 'super-admin-1',
        nome_completo: 'Coordenadora',
        email: 'coord@exemplo.com',
        matricula: '123456',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-01-01',
        meta_horas_semanais: 12,
        foto_perfil: '',
        curso_id: 'curso-1',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: ROLE_IDS.SUPER_ADMIN,
      },
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/teste']}>
        <Routes>
          <Route element={<AdminRoute />}>
            <Route path="/admin/teste" element={<h1>Painel Admin</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Painel Admin')).toBeInTheDocument();
  });
});
