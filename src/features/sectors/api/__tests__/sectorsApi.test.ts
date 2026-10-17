import { describe, expect, it, vi } from 'vitest';

import { sectorsApi } from '@/features/sectors/api/sectorsApi';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('sectorsApi (S01 - S08)', () => {
  it('S01: list chama GET /sectors com parâmetros de paginação', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { setores: [], total: 0, pagina: 1, limite: 20 },
    });

    const res = await sectorsApi.list({ pagina: 2, limite: 10 });
    expect(api.get).toHaveBeenCalledWith('/sectors', {
      params: { pagina: 2, limite: 10 },
    });
    expect(res.pagina).toBe(1);
  });

  it('S02: create chama POST /sectors com nome e descricao', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { mensagem: 'Setor criado com sucesso.' },
    });

    const res = await sectorsApi.create({
      nome: 'Desenvolvimento',
      descricao: 'Setor de TI',
    });
    expect(api.post).toHaveBeenCalledWith('/sectors', {
      nome: 'Desenvolvimento',
      descricao: 'Setor de TI',
    });
    expect(res.mensagem).toBe('Setor criado com sucesso.');
  });

  it('S03: getById chama GET /sectors/{id}', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { id: 'sec-1', nome: 'Dev', membros: [] },
    });

    const res = await sectorsApi.getById('sec-1');
    expect(api.get).toHaveBeenCalledWith('/sectors/sec-1');
    expect(res.id).toBe('sec-1');
  });

  it('S04: update chama PATCH /sectors/{id}', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({
      data: { mensagem: 'Setor atualizado.' },
    });

    const res = await sectorsApi.update('sec-1', { ativo: false });
    expect(api.patch).toHaveBeenCalledWith('/sectors/sec-1', { ativo: false });
    expect(res.mensagem).toBe('Setor atualizado.');
  });

  it('S05: delete chama DELETE /sectors/{id}', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({
      data: { mensagem: 'Setor desativado.' },
    });

    const res = await sectorsApi.delete('sec-1');
    expect(api.delete).toHaveBeenCalledWith('/sectors/sec-1');
    expect(res.mensagem).toBe('Setor desativado.');
  });

  it('S06: addMember chama POST /sectors/{id}/members', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { mensagem: 'Membro adicionado.' },
    });

    const res = await sectorsApi.addMember('sec-1', {
      usuario_id: 'user-1',
      papel: 'lider',
    });
    expect(api.post).toHaveBeenCalledWith('/sectors/sec-1/members', {
      usuario_id: 'user-1',
      papel: 'lider',
    });
    expect(res.mensagem).toBe('Membro adicionado.');
  });

  it('S07: removeMember chama DELETE /sectors/{id}/members/{userId}', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({
      data: { mensagem: 'Membro removido.' },
    });

    const res = await sectorsApi.removeMember('sec-1', 'user-1');
    expect(api.delete).toHaveBeenCalledWith('/sectors/sec-1/members/user-1');
    expect(res.mensagem).toBe('Membro removido.');
  });

  it('S08: updateMemberRole chama PATCH /sectors/{id}/members/{userId}/role', async () => {
    vi.mocked(api.patch).mockResolvedValueOnce({
      data: { mensagem: 'Papel atualizado.' },
    });

    const res = await sectorsApi.updateMemberRole('sec-1', 'user-1', {
      papel: 'lider',
    });
    expect(api.patch).toHaveBeenCalledWith(
      '/sectors/sec-1/members/user-1/role',
      {
        papel: 'lider',
      },
    );
    expect(res.mensagem).toBe('Papel atualizado.');
  });

  it('S01b: getMySectors chama GET /sectors/me', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: [{ id: 'sec-1', nome: 'Dev', papel: 'membro', ativo: true }],
    });

    const res = await sectorsApi.getMySectors();
    expect(api.get).toHaveBeenCalledWith('/sectors/me');
    expect(res).toHaveLength(1);
    expect(res[0].nome).toBe('Dev');
  });
});
