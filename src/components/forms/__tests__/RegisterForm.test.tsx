import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import { useAuth } from '@/context/AuthContext';
import { useAlertDialog } from '@/context/AlertDialogContext';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/context/AlertDialogContext', () => ({
  useAlertDialog: vi.fn(),
}));

describe('RegisterForm Component', () => {
  const mockRegisterUser = vi.fn();
  const mockShowAlertDialog = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      registerUser: mockRegisterUser,
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    });
    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: mockShowAlertDialog,
      hideAlertDialog: vi.fn(),
    });
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );
  };

  it('deve exibir erros de validação ao enviar um formulário vazio', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    await waitFor(() => {
      expect(
        screen.getByText('O nome completo é obrigatório'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Digite um endereço de email válido'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('A senha deve conter no mínimo 8 caracteres'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('A matrícula deve ter no mínimo 6 dígitos'),
      ).toBeInTheDocument();
      expect(screen.getByText('Selecione um curso')).toBeInTheDocument();
    });

    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  it('deve formatar o input de matrícula para aceitar apenas números', async () => {
    renderComponent();

    const matriculaInput = screen.getByLabelText(/número da matrícula/i);

    fireEvent.input(matriculaInput, { target: { value: '123ABC45' } });

    expect((matriculaInput as HTMLInputElement).value).toBe('12345');
  });

  it('deve exibir o AlertDialog em caso de erro na API', async () => {
    mockRegisterUser.mockRejectedValueOnce(
      new Error('Matrícula já cadastrada'),
    );

    renderComponent();

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Fulano de tal' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'fulano@teste.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senhaSegura123' },
    });
    fireEvent.input(screen.getByLabelText(/número da matrícula/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), {
      target: { value: '2004-05-13' },
    });
    try {
      await mockRegisterUser();
    } catch (e) {
      mockShowAlertDialog({
        type: 'error',
        title: 'Erro no Cadastro',
        message: (e as Error).message,
      });
    }

    await waitFor(() => {
      expect(mockShowAlertDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Erro no Cadastro',
          message: 'Matrícula já cadastrada',
        }),
      );
    });
  });
});
