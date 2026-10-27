import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext, type User } from '@/context/Auth';
import { useError } from '@/context/Error';

import { ApiError, get, post, setUnauthorizedHandler } from '@/utilities/api';

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useError();

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    const controller = new AbortController();
    const bootstrap = async () => {
      try {
        const { user } = await get('/api/users/me', { signal: controller.signal });
        setUser(user);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (!(error instanceof ApiError && error.status === 401)) showError(error);
      }
      setLoading(false);
    };
    void bootstrap();
    return () => controller.abort();
  }, [showError]);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await post('/api/users/login', { email, password });
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, turnstileToken: string) => {
    const { user } = await post('/api/users/register', { name, email, password, turnstileToken });
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    await post('/api/users/logout');
    setUser(null);
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    const { user } = await post('/api/users/verify-email', { token });
    setUser((current) => (current?.id === user.id ? user : current));
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    const { user } = await post('/api/users/reset-password', { token, password });
    setUser(user);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, logout, verifyEmail, resetPassword }),
    [user, loading, login, register, logout, verifyEmail, resetPassword],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
};

export default AuthProvider;
