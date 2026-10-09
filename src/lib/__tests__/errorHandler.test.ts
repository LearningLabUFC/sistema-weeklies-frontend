import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { parseApiError } from '@/lib/errorHandler';

function createAxiosError(status?: number, data?: unknown): AxiosError {
  const headers = new AxiosHeaders();
  const config = { headers };
  const request = {};
  const response = status
    ? {
        data,
        status,
        statusText: 'Error',
        headers: {},
        config,
      }
    : undefined;

  const error = new AxiosError(
    'Request failed',
    status ? `ERR_BAD_REQUEST` : 'ERR_NETWORK',
    config,
    request,
    response,
  );
  return error;
}

describe('parseApiError', () => {
  it('deve identificar erro de rede quando não houver response', () => {
    const error = createAxiosError(undefined, undefined);
    const parsed = parseApiError(error);

    expect(parsed.isNetworkError).toBe(true);
    expect(parsed.message).toContain('Não foi possível conectar ao servidor');
  });

  it('deve extrair mensagem do campo detail como string', () => {
    const error = createAxiosError(403, {
      detail: 'Você não tem permissão para acessar este setor.',
    });
    const parsed = parseApiError(error);

    expect(parsed.status).toBe(403);
    expect(parsed.isForbidden).toBe(true);
    expect(parsed.message).toBe(
      'Você não tem permissão para acessar este setor.',
    );
  });

  it('deve extrair e formatar lista de erros de validação 422 do Pydantic', () => {
    const error = createAxiosError(422, {
      detail: [
        { loc: ['body', 'titulo'], msg: 'O campo não pode ser vazio' },
        { loc: ['body', 'setor_id'], msg: 'UUID inválido' },
      ],
    });
    const parsed = parseApiError(error);

    expect(parsed.status).toBe(422);
    expect(parsed.isValidationError).toBe(true);
    expect(parsed.message).toContain('titulo: O campo não pode ser vazio');
    expect(parsed.message).toContain('setor_id: UUID inválido');
    expect(parsed.validationErrors).toEqual({
      titulo: ['O campo não pode ser vazio'],
      setor_id: ['UUID inválido'],
    });
  });

  it('deve extrair mensagem do campo mensagem quando presente', () => {
    const error = createAxiosError(409, {
      mensagem: 'Setor com este nome já existe.',
    });
    const parsed = parseApiError(error);

    expect(parsed.status).toBe(409);
    expect(parsed.isConflict).toBe(true);
    expect(parsed.message).toBe('Setor com este nome já existe.');
  });

  it('deve fornecer mensagem padrão coerente para 404 quando sem body detalhado', () => {
    const error = createAxiosError(404, {});
    const parsed = parseApiError(error);

    expect(parsed.status).toBe(404);
    expect(parsed.isNotFound).toBe(true);
    expect(parsed.message).toBe('O recurso solicitado não foi encontrado.');
  });

  it('deve fornecer mensagem padrão coerente para 400 Bad Request', () => {
    const error = createAxiosError(400, {});
    const parsed = parseApiError(error);

    expect(parsed.status).toBe(400);
    expect(parsed.isBadRequest).toBe(true);
    expect(parsed.message).toBe(
      'Requisição inválida. Verifique os dados informados.',
    );
  });

  it('deve tratar instâncias de Error genéricas', () => {
    const err = new Error('Falha no cliente');
    const parsed = parseApiError(err);

    expect(parsed.message).toBe('Falha no cliente');
    expect(parsed.isNetworkError).toBe(false);
  });
});
