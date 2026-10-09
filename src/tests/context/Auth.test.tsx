import type { ReactNode } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAuth } from '@/context/Auth';
import AuthProvider from '@/context/AuthProvider';
import { useError } from '@/context/Error';
import ErrorProvider from '@/context/ErrorProvider';

import { ApiError, get, post } from '@/utilities/api';

vi.mock('@/utilities/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utilities/api')>()),
  get: vi.fn(),
  post: vi.fn(),
}));

const mockGet = vi.mocked(get);
const mockPost = vi.mocked(post);

const user = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '', updatedAt: '' };
const unauthorized = new ApiError(401, 'Unauthorized');

const wrapper = ({ children }: { children: ReactNode }) => (
  <ErrorProvider>
    <AuthProvider>{children}</AuthProvider>
  </ErrorProvider>
);

const useAuthAndError = () => ({ ...useAuth(), ...useError() });

afterEach(() => {
  vi.clearAllMocks();
});

describe('Auth context', () => {
  it('bootstraps the user from /me and clears loading', async () => {
    mockGet.mockResolvedValue({ user });
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(user);
    expect(mockGet.mock.calls[0]?.[0]).toBe('/api/users/me');
    expect(mockGet.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('stays logged out silently when /me is unauthorized', async () => {
    mockGet.mockRejectedValue(unauthorized);
    const { result } = renderHook(useAuthAndError, { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.message).toBeNull();
  });

  it('surfaces non-auth bootstrap failures', async () => {
    mockGet.mockRejectedValue(new ApiError(500, 'Server down'));
    const { result } = renderHook(useAuthAndError, { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.message).toBe('Server down');
  });

  it('sets the user on login', async () => {
    mockGet.mockRejectedValue(unauthorized);
    mockPost.mockResolvedValue({ user });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.login('ada@example.com', 'secret'));
    expect(mockPost).toHaveBeenCalledWith('/api/users/login', { email: 'ada@example.com', password: 'secret' });
    expect(result.current.user).toEqual(user);
  });

  it('sets the user on register', async () => {
    mockGet.mockRejectedValue(unauthorized);
    mockPost.mockResolvedValue({ user });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.register('Ada', 'ada@example.com', 'secret'));
    expect(mockPost).toHaveBeenCalledWith('/api/users/register', { name: 'Ada', email: 'ada@example.com', password: 'secret' });
    expect(result.current.user).toEqual(user);
  });

  it('clears the user on logout', async () => {
    mockGet.mockResolvedValue({ user });
    mockPost.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(user));

    await act(() => result.current.logout());
    expect(mockPost).toHaveBeenCalledWith('/api/users/logout');
    expect(result.current.user).toBeNull();
  });

  it('throws when used outside a provider', () => {
    const Consumer = () => {
      useAuth();
      return null;
    };
    expect(() => render(<Consumer />)).toThrow('useAuth must be used within an AuthProvider');
  });
});
