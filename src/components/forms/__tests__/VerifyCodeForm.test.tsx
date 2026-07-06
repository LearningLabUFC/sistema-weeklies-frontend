import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { VerifyCodeForm } from '../VerifyCodeForm';
import { useAlertDialog } from '@/context/AlertDialogContext';

vi.mock('@/context/AlertDialogContext', () => ({
  useAlertDialog: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn() },
}));

describe('VerifyCodeForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn(),
      hideAlertDialog: vi.fn(),
    });
  });

  it('deve renderizar 6 inputs de código', () => {
    render(
      <MemoryRouter>
        <VerifyCodeForm email="teste@exemplo.com" />
      </MemoryRouter>,
    );

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('deve habilitar o botão de submit apenas quando os 6 dígitos forem preenchidos', () => {
    render(
      <MemoryRouter>
        <VerifyCodeForm email="teste@exemplo.com" />
      </MemoryRouter>,
    );

    const submitBtn = screen.getByRole('button', { name: /verificar código/i });
    expect(submitBtn).toBeDisabled();

    const inputs = screen.getAllByRole('textbox');

    inputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: index.toString() } });
    });

    expect(submitBtn).not.toBeDisabled();
  });

  it('deve lidar com o evento de paste (colar) corretamente', () => {
    render(
      <MemoryRouter>
        <VerifyCodeForm email="teste@exemplo.com" />
      </MemoryRouter>,
    );

    const firstInput = screen.getAllByRole('textbox')[0];

    fireEvent.paste(firstInput, {
      clipboardData: { getData: () => '123456' },
      preventDefault: vi.fn(),
    });

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs[0].value).toBe('1');
    expect(inputs[5].value).toBe('6');
  });
});
