import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import AppSidebar from '../AppSidebar';

import { useAuth } from '@/context/AuthContext';
import { useAlertDialog } from '@/context/AlertDialogContext';
import type { User } from '@/types/user';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/context/AlertDialogContext', () => ({
  useAlertDialog: vi.fn(),
}));

interface SidebarMenuButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  asChild?: boolean;
}

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(() => ({ setOpenMobile: vi.fn() })),
  Sidebar: ({ children }: { children: React.ReactNode }) => (
    <aside>{children}</aside>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <footer>{children}</footer>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <header>{children}</header>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuButton: ({
    children,
    onClick,
    asChild,
  }: SidebarMenuButtonProps) => {
    if (asChild) return <>{children}</>;
    return <button onClick={onClick}>{children}</button>;
  },
}));

describe('AppSidebar Component', () => {
  const mockLogout = vi.fn();
  const mockShowAlertDialog = vi.fn();

  const mockBaseUser: User = {
    id: '123456',
    nome_completo: 'Usuário Teste',
    email: 'teste@exemplo.com',
    matricula: '123456',
    data_nascimento: '2000-01-01',
    data_ingresso: '2024-01-01',
    meta_horas_semanais: 12,
    foto_perfil: 'avatar_padrao.png',
    curso_id: 'curso-123',
    status_id: 'ativo',
    global_role: 'aluno',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubEnv('VITE_SHOW_ALL_LINKS', 'false');

    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: mockShowAlertDialog,
      hideAlertDialog: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>,
    );
  };

  it('não deve renderizar a sidebar se o usuário não estiver autenticado', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: mockLogout,
      login: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      checkUserStatus: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter>
        <AppSidebar />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('deve renderizar os links e a badge de Administrador corretamente', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockBaseUser, global_role: 'admin' },
      isAuthenticated: true,
      logout: mockLogout,
      login: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      checkUserStatus: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Administrador')).toBeInTheDocument();

    expect(screen.getByText('Gerenciar admins')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar presença')).toBeInTheDocument();
  });

  it('deve renderizar os links e a badge de Líder corretamente', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockBaseUser, global_role: 'leader' },
      isAuthenticated: true,
      logout: mockLogout,
      login: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      checkUserStatus: vi.fn(),
    });

    renderComponent();

    expect(screen.getByText('Líder')).toBeInTheDocument();

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Meu projeto')).toBeInTheDocument();

    expect(screen.queryByText('Gerenciar admins')).not.toBeInTheDocument();
  });

  it('deve chamar o AlertDialog de confirmação ao clicar no botão "Sair"', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockBaseUser, global_role: 'aluno' },
      isAuthenticated: true,
      logout: mockLogout,
      login: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      checkUserStatus: vi.fn(),
    });

    renderComponent();

    const logoutButton = screen.getByText('Sair');
    fireEvent.click(logoutButton);

    expect(mockShowAlertDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'confirm',
        title: 'Sair da conta',
        message: 'Você tem certeza que deseja sair do sistema?',
        confirmText: 'Sim',
        cancelText: 'Não',
      }),
    );
  });
});
