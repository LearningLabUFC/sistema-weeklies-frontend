import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AppSidebar from '@/components/layout/Sidebar/AppSidebar';
import { ROLE_IDS } from '@/config/roles';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/user';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

const mockSetOpenMobile = vi.fn();

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: vi.fn(() => ({
    setOpenMobile: mockSetOpenMobile,
    isMobile: false,
  })),
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
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    asChild?: boolean;
  }) => {
    if (asChild) return <div onClick={onClick}>{children}</div>;
    return <button onClick={onClick}>{children}</button>;
  },
}));

describe('AppSidebar Component', () => {
  const mockLogout = vi.fn();
  const mockShowAlertDialog = vi.fn();
  const mockNavigate = vi.fn();

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
    global_role: ROLE_IDS.ALUNO,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_SHOW_ALL_LINKS', 'false');

    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

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

  it('deve chamar o AlertDialog e executar onConfirm ao fazer logout', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockBaseUser, global_role: ROLE_IDS.ALUNO },
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

    const alertConfig = mockShowAlertDialog.mock.calls[0][0];
    alertConfig.onConfirm();

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('deve fechar a sidebar no mobile ao clicar em um link', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { ...mockBaseUser, global_role: ROLE_IDS.ADMIN },
      isAuthenticated: true,
      logout: mockLogout,
      login: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      checkUserStatus: vi.fn(),
    });

    renderComponent();

    const link = screen.getByText('Projetos');
    fireEvent.click(link);

    expect(mockSetOpenMobile).toHaveBeenCalledWith(false);
  });
});
