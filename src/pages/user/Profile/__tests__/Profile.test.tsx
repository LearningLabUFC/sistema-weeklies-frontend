import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ROLE_IDS } from '@/config/roles';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { api } from '@/lib/api';
import Profile from '@/pages/user/Profile/Profile';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

vi.mock('@/features/weeklies/components/WarningsList', () => ({
  WarningsList: ({ mode }: { mode: string }) => (
    <div data-testid={`mock-warnings-list-${mode}`}>Advertências ({mode})</div>
  ),
}));

vi.mock('@/features/auth/components/forms/ChangePasswordForm', () => ({
  default: () => <div data-testid="change-password-form">Form Troca Senha</div>,
}));

vi.mock('@/components/shared/ThemeToggle/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

describe('Profile Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn(),
      hideAlertDialog: vi.fn(),
    });
  });

  const mockUserProfile = (roleId: string) => ({
    id: 'user-1',
    nome_completo: 'Fulano da Silva',
    email: 'fulano@ufc.br',
    matricula: '512345',
    data_nascimento: '2000-01-01',
    data_ingresso: '2024-01-01',
    meta_horas_semanais: 12,
    foto_perfil: 'avatar.png',
    curso_id: 'curso-1',
    status_id: 'status-1',
    global_role: roleId,
    setores: ['Desenvolvimento'],
  });

  it('deve renderizar a seção de advertências pessoais para membros comuns (usuario)', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { usuario: mockUserProfile(ROLE_IDS.USUARIO) },
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Fulano da Silva')).toBeInTheDocument();
    });

    expect(screen.getByTestId('mock-warnings-list-me')).toBeInTheDocument();
  });

  it('não deve renderizar a seção de advertências pessoais para super_admin (Coordenadora)', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { usuario: mockUserProfile(ROLE_IDS.SUPER_ADMIN) },
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Fulano da Silva')).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId('mock-warnings-list-me'),
    ).not.toBeInTheDocument();
  });

  it('não deve renderizar a seção de advertências pessoais para administrador', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { usuario: mockUserProfile(ROLE_IDS.ADMIN) },
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Fulano da Silva')).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId('mock-warnings-list-me'),
    ).not.toBeInTheDocument();
  });
});
