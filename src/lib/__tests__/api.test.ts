import { type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@/lib/api';

interface AxiosInterceptorHandlers {
  handlers: Array<{
    fulfilled: (
      config: InternalAxiosRequestConfig,
    ) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  }>;
}

describe('Axios API Instance', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('deve injetar o token de autorização no header se existir no localStorage', async () => {
    const fakeToken = 'meu_token_jwt_falso';
    localStorage.setItem('@LearningLab:token', fakeToken);

    const config = { headers: {} } as InternalAxiosRequestConfig;

    const requestHandler = (
      api.interceptors.request as unknown as AxiosInterceptorHandlers
    ).handlers[0].fulfilled;

    const result = await requestHandler(config);

    expect(result.headers.Authorization).toBe(`Bearer ${fakeToken}`);
  });

  it('não deve injetar o header de autorização se não houver token', async () => {
    const config = { headers: {} } as InternalAxiosRequestConfig;

    const requestHandler = (
      api.interceptors.request as unknown as AxiosInterceptorHandlers
    ).handlers[0].fulfilled;

    const result = await requestHandler(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});
