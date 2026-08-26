import { createContext } from 'react';

import type { RegisterData, User } from '@/types/user';

export interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  registerUser: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  checkUserStatus: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData | undefined>(
  undefined,
);
