import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { api } from '@/lib/api';
import React from 'react';

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn() },
}));

const mockUser = {
  id: '123',
  nome_completo: 'Test User',
  email: 'test@test.com',
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('deve inicializar com o usuário do localStorage, se existir', () => {
    localStorage.setItem('@LearningLab:token', 'fake-token');
    localStorage.setItem('@LearningLab:user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.nome_completo).toBe('Test User');
  });

  it('deve realizar login, atualizar estado e salvar no localStorage', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { token_acesso: 'new-token', usuario: mockUser },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@test.com', 'password');
    });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      senha: 'password',
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('@LearningLab:token')).toBe('new-token');
  });

  it('deve limpar os dados ao fazer logout', () => {
    localStorage.setItem('@LearningLab:token', 'fake-token');
    localStorage.setItem('@LearningLab:user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('@LearningLab:token')).toBeNull();
    expect(localStorage.getItem('@LearningLab:user')).toBeNull();
  });
});
