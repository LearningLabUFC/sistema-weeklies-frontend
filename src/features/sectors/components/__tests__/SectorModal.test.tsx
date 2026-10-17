import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { SectorModal } from '@/features/sectors/components/SectorModal';
import { useAlertDialog } from '@/hooks/useAlertDialog';

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

describe('SectorModal Component', () => {
  const mockShowAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: mockShowAlert,
      hideAlertDialog: vi.fn(),
    });
  });

  it('deve validar nome obrigatório no envio', async () => {
    const user = userEvent.setup();
    render(<SectorModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: /criar setor/i });
    expect(submitBtn).toBeDisabled();

    const nomeInput = screen.getByLabelText(/nome do setor/i);
    await user.type(nomeInput, '   ');
    expect(submitBtn).toBeDisabled();
  });

  it('deve chamar create ao submeter novo setor', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    vi.mocked(sectorsApi.create).mockResolvedValueOnce({
      mensagem: 'Setor criado com sucesso.',
    });

    render(
      <SectorModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />,
    );

    await user.type(screen.getByLabelText(/nome do setor/i), 'Robótica');
    await user.type(screen.getByLabelText(/descrição/i), 'Equipe de hardware');

    const submitBtn = screen.getByRole('button', { name: /criar setor/i });
    await user.click(submitBtn);

    expect(sectorsApi.create).toHaveBeenCalledWith({
      nome: 'Robótica',
      descricao: 'Equipe de hardware',
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('deve enviar descricao vazia como "" ao limpar descrição na edição', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    vi.mocked(sectorsApi.update).mockResolvedValueOnce({
      mensagem: 'Setor atualizado com sucesso.',
    });

    render(
      <SectorModal
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
        sectorToEdit={{
          id: 'sec-1',
          nome: 'Design',
          descricao: 'Descrição antiga',
          ativo: true,
          criado_em: '2026-01-01T00:00:00Z',
          qtd_membros: 3,
          qtd_lideres: 1,
        }}
      />,
    );

    const descInput = screen.getByLabelText(/descrição/i);
    await user.clear(descInput);

    const submitBtn = screen.getByRole('button', {
      name: /salvar alterações/i,
    });
    await user.click(submitBtn);

    expect(sectorsApi.update).toHaveBeenCalledWith('sec-1', {
      nome: 'Design',
      descricao: '',
      ativo: true,
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
