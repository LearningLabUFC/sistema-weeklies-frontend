import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PresenceForm from '../PresenceForm';

describe('PresenceForm Component', () => {
  it('deve renderizar o formulário ativo e permitir digitação', () => {
    render(<PresenceForm isPresenceActive={true} onSuccess={vi.fn()} />);

    const input = screen.getByLabelText(/Palavra-chave/i);
    const button = screen.getByRole('button', { name: /Confirmar Presença/i });

    expect(input).toBeInTheDocument();
    expect(input).not.toBeDisabled();
    expect(button).not.toBeDisabled();
    expect(
      screen.queryByText(/A presença está encerrada no momento/i),
    ).not.toBeInTheDocument();
  });

  it('deve desabilitar campos e exibir mensagem quando inativo', () => {
    render(<PresenceForm isPresenceActive={false} onSuccess={vi.fn()} />);

    const input = screen.getByLabelText(/Palavra-chave/i);
    const button = screen.getByRole('button', { name: /Confirmar Presença/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(
      screen.getByText(/A presença está encerrada no momento/i),
    ).toBeInTheDocument();
  });

  it('deve exibir erro de validação ao enviar vazio', async () => {
    render(<PresenceForm isPresenceActive={true} onSuccess={vi.fn()} />);

    const button = screen.getByRole('button', { name: /Confirmar Presença/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('A palavra-chave é obrigatória'),
      ).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando a palavra-chave estiver incorreta', async () => {
    render(<PresenceForm isPresenceActive={true} onSuccess={vi.fn()} />);

    const input = screen.getByLabelText(/Palavra-chave/i);
    const button = screen.getByRole('button', { name: /Confirmar Presença/i });

    fireEvent.change(input, { target: { value: 'palavraerrada' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText('Palavra incorreta. Tente novamente.'),
      ).toBeInTheDocument();
    });
  });

  it('deve chamar a função onSuccess quando a palavra-chave estiver correta', async () => {
    const mockOnSuccess = vi.fn();
    render(<PresenceForm isPresenceActive={true} onSuccess={mockOnSuccess} />);

    const input = screen.getByLabelText(/Palavra-chave/i);
    const button = screen.getByRole('button', { name: /Confirmar Presença/i });

    fireEvent.change(input, { target: { value: 'learninglab' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.any(Date));
    });
  });
});
