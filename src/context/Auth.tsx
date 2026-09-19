import { ReactNode, useCallback, useEffect, useState } from 'react';

import { get, post } from 'utilities/api';
import { createSafeContext } from 'utilities/context';

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const [AuthContext, useAuth] = createSafeContext<AuthContextType>('Auth');

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { user } = await get<{ user: User }>('/api/users/me');
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await post<{ user: User }>('/api/users/login', { email, password });
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user } = await post<{ user: User }>('/api/users/register', { name, email, password });
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await post('/api/users/logout');
    setUser(null);
  }, []);

  return <AuthContext value={{ user, loading, login, register, logout }}>{children}</AuthContext>;
};

export { AuthProvider, useAuth };
