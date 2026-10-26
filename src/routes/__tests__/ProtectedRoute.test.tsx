import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve exibir a tela de loading enquanto verifica a autenticação', () => {
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
      <MemoryRouter initialEntries={['/rota-protegida']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/rota-protegida" element={<h1>Conteúdo Secreto</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Secreto')).not.toBeInTheDocument();
  });

  it('deve redirecionar para "/login" se o usuário NÃO estiver autenticado', () => {
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
      <MemoryRouter initialEntries={['/rota-protegida']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/rota-protegida" element={<h1>Conteúdo Secreto</h1>} />
          </Route>
          <Route path="/login" element={<h1>Página de Login</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Página de Login')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Secreto')).not.toBeInTheDocument();
  });

  it('deve renderizar o conteúdo (Outlet) se o usuário ESTIVER autenticado e ATIVO', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        nome_completo: 'João Silva',
        email: 'joao@exemplo.com',
        matricula: '512345',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-05-20',
        meta_horas_semanais: 12,
        foto_perfil: 'avatar_padrao.png',
        curso_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: '1fa85f64-5717-4562-b3fc-2c963f66afa1',
      },
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/rota-protegida']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/rota-protegida" element={<h1>Conteúdo Secreto</h1>} />
          </Route>
          <Route path="/login" element={<h1>Página de Login</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Conteúdo Secreto')).toBeInTheDocument();
    expect(screen.queryByText('Página de Login')).not.toBeInTheDocument();
  });

  it('deve redirecionar para "/pending-approval" se o usuário estiver PENDENTE', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        nome_completo: 'João Silva',
        email: 'joao@exemplo.com',
        matricula: '512345',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-05-20',
        meta_horas_semanais: 12,
        foto_perfil: 'avatar_padrao.png',
        curso_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa1',
        global_role: '1fa85f64-5717-4562-b3fc-2c963f66afa1',
      },
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/rota-protegida']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/rota-protegida" element={<h1>Conteúdo Secreto</h1>} />
          </Route>
          <Route path="/pending-approval" element={<h1>Tela de Espera</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Tela de Espera')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo Secreto')).not.toBeInTheDocument();
  });

  it('deve redirecionar para "/" se o usuário ATIVO tentar acessar a tela de pendente', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: {
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        nome_completo: 'João Silva',
        email: 'joao@exemplo.com',
        matricula: '512345',
        data_nascimento: '2000-01-01',
        data_ingresso: '2024-05-20',
        meta_horas_semanais: 12,
        foto_perfil: 'avatar_padrao.png',
        curso_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        status_id: '1fa85f64-5717-4562-b3fc-2c963f66afa2',
        global_role: '1fa85f64-5717-4562-b3fc-2c963f66afa1',
      },
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/pending-approval']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/pending-approval" element={<h1>Tela de Espera</h1>} />
            <Route path="/" element={<h1>Página Inicial</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Página Inicial')).toBeInTheDocument();
    expect(screen.queryByText('Tela de Espera')).not.toBeInTheDocument();
  });
});
