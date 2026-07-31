import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import { useAuth } from '@/context/AuthContext';
import { useAlertDialog } from '@/context/AlertDialogContext';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/context/AlertDialogContext', () => ({
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
