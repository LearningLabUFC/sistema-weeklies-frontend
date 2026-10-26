import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { AddMemberModal } from '@/features/sectors/components/AddMemberModal';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

vi.mock('@/features/sectors/api/sectorsApi', () => ({
  sectorsApi: {
    addMember: vi.fn(),
  },
}));

vi.mock('@/hooks/useAlertDialog', () => ({
  useAlertDialog: vi.fn(),
}));

describe('AddMemberModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAlertDialog).mockReturnValue({
      showAlertDialog: vi.fn(),
      hideAlertDialog: vi.fn(),
    });

    vi.mocked(api.get).mockResolvedValue({
      data: {
        usuarios: [
          {
            id: 'user-1',
            nome_completo: 'Carlos Silva',
            email: 'carlos@ufc.br',
          },
          { id: 'user-2', nome_completo: 'Ana Costa', email: 'ana@ufc.br' },
        ],
      },
    });
  });

  it('deve carregar usuários ativos e permitir submissão', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    vi.mocked(sectorsApi.addMember).mockResolvedValueOnce({
      mensagem: 'Membro adicionado com sucesso.',
    });

    render(
      <AddMemberModal
        isOpen={true}
        onClose={onClose}
        sectorId="sector-1"
        onSuccess={onSuccess}
      />,
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    const triggers = screen.getAllByRole('combobox');
    await user.click(triggers[0]);
    await user.keyboard('{Enter}');

    const submitBtn = screen.getByRole('button', {
      name: /adicionar ao setor/i,
    });
    expect(submitBtn).toBeEnabled();

    await user.click(submitBtn);

    expect(sectorsApi.addMember).toHaveBeenCalledWith('sector-1', {
      usuario_id: 'user-1',
      papel: 'membro',
      data_ingresso: undefined,
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('não reinicia a busca quando existingMemberIds prop recebe uma nova instância', async () => {
    const { rerender } = render(
      <AddMemberModal
        isOpen={true}
        onClose={vi.fn()}
        sectorId="sector-1"
        onSuccess={vi.fn()}
        existingMemberIds={['user-3']}
      />,
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    // Re-renderiza com nova referência de array idêntico
    rerender(
      <AddMemberModal
        isOpen={true}
        onClose={vi.fn()}
        sectorId="sector-1"
        onSuccess={vi.fn()}
        existingMemberIds={['user-3']}
      />,
    );

    await new Promise(r => setTimeout(r, 350));

    // Não deve ter disparado nova consulta à API
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  it('pagina e agrega usuários quando total for maior que o limite da primeira página', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: {
          usuarios: [
            { id: 'u-1', nome_completo: 'User 1', email: 'u1@ufc.br' },
          ],
          total: 2,
          pagina: 1,
          limite: 1,
        },
      })
      .mockResolvedValueOnce({
        data: {
          usuarios: [
            { id: 'u-2', nome_completo: 'User 2', email: 'u2@ufc.br' },
          ],
          total: 2,
          pagina: 2,
          limite: 1,
        },
      });

    render(
      <AddMemberModal
        isOpen={true}
        onClose={vi.fn()}
        sectorId="sector-1"
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('2 disponíveis')).toBeInTheDocument();
    });

    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it('exibe alerta de erro na tela quando requisição falha e permite repetir', async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockRejectedValueOnce(
      new Error('Erro interno ao buscar usuários do sistema'),
    );

    render(
      <AddMemberModal
        isOpen={true}
        onClose={vi.fn()}
        sectorId="sector-1"
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Erro interno ao buscar usuários do sistema/i),
      ).toBeInTheDocument();
    });

    // Simula recuperação na segunda tentativa
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        usuarios: [
          { id: 'u-rec', nome_completo: 'Recuperado', email: 'rec@ufc.br' },
        ],
      },
    });

    const retryBtn = screen.getByRole('button', { name: /repetir/i });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(
        screen.queryByText(/Erro interno ao buscar usuários/i),
      ).not.toBeInTheDocument();
      expect(screen.getByText('1 disponível')).toBeInTheDocument();
    });
  });

  it('não deve exibir usuários com papel super_admin na lista de membros disponíveis', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        usuarios: [
          {
            id: 'user-admin',
            nome_completo: 'Super Administrador',
            email: 'super@ufc.br',
            role_nome: 'super_admin',
          },
          {
            id: 'user-normal',
            nome_completo: 'Membro Comum',
            email: 'comum@ufc.br',
            role_nome: 'usuario',
          },
        ],
        total: 2,
        pagina: 1,
        limite: 100,
      },
    });

    render(
      <AddMemberModal
        isOpen={true}
        onClose={vi.fn()}
        sectorId="sector-1"
        onSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('1 disponível')).toBeInTheDocument();
    });

    expect(screen.queryByText(/Super Administrador/i)).not.toBeInTheDocument();
  });
});
