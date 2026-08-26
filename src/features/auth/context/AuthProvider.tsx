import { AxiosError } from 'axios';
import { type ReactNode, useState } from 'react';

import { AuthContext } from '@/features/auth/context/AuthContext';
import { api } from '@/lib/api';
import type { RegisterData, User } from '@/types/user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storagedUser = localStorage.getItem('@LearningLab:user');
    const storagedToken = localStorage.getItem('@LearningLab:token');

    if (storagedToken && storagedUser) {
      try {
        return JSON.parse(storagedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, senha });
      const { token_acesso, usuario } = response.data;

      localStorage.setItem('@LearningLab:token', token_acesso);
      localStorage.setItem('@LearningLab:user', JSON.stringify(usuario));

      setUser(usuario);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', data);
      const { token_acesso, usuario } = response.data;

      localStorage.setItem('@LearningLab:token', token_acesso);
      localStorage.setItem('@LearningLab:user', JSON.stringify(usuario));

      setUser(usuario);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const apiMessage = error.response?.data?.mensagem;
      const apiDetail = error.response?.data?.detail;

      if (apiMessage) {
        throw new Error(apiMessage, { cause: error });
      } else if (apiDetail) {
        if (typeof apiDetail === 'string') {
          throw new Error(apiDetail, { cause: error });
        }

        throw new Error('Erro de validação nos dados enviados.', {
          cause: error,
        });
      }
    }
    throw new Error(
      'Erro ao conectar com o servidor. Tente novamente mais tarde.',
      { cause: error },
    );
  };

  const logout = () => {
    localStorage.removeItem('@LearningLab:token');
    localStorage.removeItem('@LearningLab:user');
    setUser(null);
  };

  const checkUserStatus = async () => {
    try {
      const response = await api.get('/users/me');
      const updatedUser = response.data.usuario;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('@LearningLab:user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Erro ao verificar status do usuário:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        registerUser,
        logout,
        loading,
        checkUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
