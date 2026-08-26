import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginForm from '@/features/auth/components/forms/LoginForm';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useAuth } from '@/hooks/useAuth';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

describe('LoginForm Component', () => {
  const mockLogin = vi.fn();
  const mockShowAlertDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
      registerUser: vi.fn(),
      loading: false,
      checkUserStatus: vi.fn(),
    });

    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: mockShowAlertDialog,
      hideAlertDialog: vi.fn(),
    });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );
  };

  it('deve exibir mensagens de erro do Zod ao enviar formulário vazio', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Digite um endereço de email válido'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('A senha deve ter pelo menos 8 caracteres'),
      ).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('deve chamar a função login com os dados corretos em caso de sucesso', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'teste@exemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senhaSegura123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        'teste@exemplo.com',
        'senhaSegura123',
      );
    });
  });

  it('deve exibir o AlertDialog se o login falhar', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciais inválidas'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'teste@exemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senhaSegura123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockShowAlertDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Falha no Login',
          message: 'Credenciais inválidas',
        }),
      );
    });
  });
});
