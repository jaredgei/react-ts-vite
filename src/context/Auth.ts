import type { ApiResponse } from '@/utilities/api';
import { createSafeContext } from '@/utilities/context';

export type User = ApiResponse<'get', '/api/users/me'>['user'];

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, turnstileToken: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
};

export const [AuthContext, useAuth] = createSafeContext<AuthContextType>('Auth');
