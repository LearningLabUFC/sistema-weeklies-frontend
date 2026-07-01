import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

import type { User } from '@/types/user';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedToken = localStorage.getItem('@LearningLab:token');
    const storagedUser = localStorage.getItem('@LearningLab:user');

    if (storagedToken && storagedUser) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storagedToken}`;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const response = await api.post('/auth/login', { email, senha });

      const { token_acesso, usuario } = response.data;

      localStorage.setItem('@LearningLab:token', token_acesso);
      localStorage.setItem('@LearningLab:user', JSON.stringify(usuario));

      api.defaults.headers.common['Authorization'] = `Bearer ${token_acesso}`;

      setUser(usuario);
    } catch (error) {
      if (error instanceof AxiosError) {
        const apiMessage = error.response?.data?.mensagem;
        const apiDetail = error.response?.data?.details;

        if (apiMessage) {
          throw new Error(apiMessage, { cause: error });
        } else if (apiDetail) {
          throw new Error('Erro de validação nos dados enviados.', {
            cause: error,
          });
        }
      }
      throw new Error(
        'Erro ao conectar com o servidor. Tente novamente mais tarde.',
        { cause: error },
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('@LearningLab:token');
    localStorage.removeItem('@LearningLab:user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
