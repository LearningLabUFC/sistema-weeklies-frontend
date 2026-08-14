import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../RegisterForm';
import { useAuth } from '@/context/AuthContext';
import { useAlertDialog } from '@/context/AlertDialogContext';
import { api } from '@/lib/api';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/context/AlertDialogContext', () => ({
  useAlertDialog: vi.fn(),
}));
vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}));

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
});

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
      checkUserStatus: vi.fn(),
    });
    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: mockShowAlertDialog,
      hideAlertDialog: vi.fn(),
    });
    vi.mocked(api.get).mockResolvedValue({
      data: [{ id: '1', nome: 'Engenharia de Software', ativo: true }],
    });
  });

  const renderComponent = async () => {
    render(
      <MemoryRouter>
        <RegisterForm />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  };

  it('deve exibir erros de validação ao enviar um formulário vazio', async () => {
    await renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    await waitFor(() => {
      expect(
        screen.getByText('O nome completo é obrigatório'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Digite um endereço de email válido'),
      ).toBeInTheDocument();

      expect(screen.getAllByText('Mínimo de 8 caracteres')).toHaveLength(2);

      expect(
        screen.getByText('A matrícula deve ter no mínimo 6 dígitos'),
      ).toBeInTheDocument();
      expect(screen.getByText('Selecione um curso')).toBeInTheDocument();
    });

    expect(mockRegisterUser).not.toHaveBeenCalled();
  });

  it('deve formatar o input de matrícula para aceitar apenas números', async () => {
    await renderComponent();

    const matriculaInput = screen.getByLabelText(/número da matrícula/i);

    fireEvent.input(matriculaInput, { target: { value: '123ABC45' } });

    await waitFor(() => {
      expect((matriculaInput as HTMLInputElement).value).toBe('12345');
    });
  });

  it('deve exibir o AlertDialog em caso de erro na API', async () => {
    mockRegisterUser.mockRejectedValueOnce(
      new Error('E-mail já cadastrado no sistema'),
    );

    await renderComponent();

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Fulano de tal' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'fulano@teste.com' },
    });
    // Atualizado com maiúscula e caractere especial para passar pelo Regex do Zod
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'SenhaSegura123!' },
    });
    fireEvent.input(screen.getByLabelText(/número da matrícula/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), {
      target: { value: '2004-05-13' },
    });

    const selectTrigger = screen.getByRole('combobox');

    await waitFor(() => {
      expect(selectTrigger).not.toBeDisabled();
    });

    fireEvent.click(selectTrigger);

    const courseOption = await screen.findByRole('option', {
      name: 'Engenharia de Software',
    });
    fireEvent.click(courseOption);

    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    await waitFor(() => {
      expect(mockShowAlertDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Erro no cadastro',
          message: 'E-mail já cadastrado no sistema',
        }),
      );
    });
  });

  it('deve exibir erro específico abaixo do input quando a API retornar erro de matrícula', async () => {
    mockRegisterUser.mockRejectedValueOnce(
      new Error('Esta matrícula já pertence a outro usuário.'),
    );

    await renderComponent();

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Fulano de tal' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'fulano@teste.com' },
    });
    // Atualizado com maiúscula e caractere especial para passar pelo Regex do Zod
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'SenhaSegura123!' },
    });
    fireEvent.input(screen.getByLabelText(/número da matrícula/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), {
      target: { value: '2004-05-13' },
    });

    const selectTrigger = screen.getByRole('combobox');

    await waitFor(() => {
      expect(selectTrigger).not.toBeDisabled();
    });

    fireEvent.click(selectTrigger);

    const courseOption = await screen.findByRole('option', {
      name: 'Engenharia de Software',
    });
    fireEvent.click(courseOption);

    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));

    await waitFor(() => {
      expect(mockShowAlertDialog).not.toHaveBeenCalled();

      expect(
        screen.getByText('Esta matrícula já pertence a outro usuário.'),
      ).toBeInTheDocument();
    });
  });
});
