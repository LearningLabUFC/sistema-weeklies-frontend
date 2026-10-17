import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLE_IDS } from '@/config/roles';
import { useAuth } from '@/hooks/useAuth';
import { HomeRoute } from '@/routes/HomeRoute';
import type { User } from '@/types/user';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/pages/user/Weeklies/Weeklies', () => ({
  default: () => <div data-testid="mock-weeklies-page">Tela de Weeklies</div>,
}));

describe('HomeRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve redirecionar para /admin se o usuário for super_admin (Coordenadora)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'coord-1',
        nome_completo: 'Coordenadora Geral',
        email: 'coord@ufc.br',
        global_role: ROLE_IDS.SUPER_ADMIN,
      } as unknown as User,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/admin" element={<div>Painel Admin</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Painel Admin')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-weeklies-page')).not.toBeInTheDocument();
  });

  it('deve redirecionar para /admin se o usuário for admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        nome_completo: 'Administrador',
        email: 'admin@ufc.br',
        global_role: ROLE_IDS.ADMIN,
      } as unknown as User,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/admin" element={<div>Painel Admin</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Painel Admin')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-weeklies-page')).not.toBeInTheDocument();
  });

  it('deve renderizar a tela de Weeklies se o usuário for membro comum', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-1',
        nome_completo: 'Membro Teste',
        email: 'membro@ufc.br',
        global_role: ROLE_IDS.USUARIO,
      } as unknown as User,
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      registerUser: vi.fn(),
      checkUserStatus: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/admin" element={<div>Painel Admin</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('mock-weeklies-page')).toBeInTheDocument();
    expect(screen.queryByText('Painel Admin')).not.toBeInTheDocument();
  });
});
