import { ReactNode } from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider, useAuth } from 'context/Auth';

import { get, post } from 'utilities/api';

vi.mock('utilities/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

const mockGet = vi.mocked(get);
const mockPost = vi.mocked(post);

const user = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '', updatedAt: '' };

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

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
    expect(mockGet).toHaveBeenCalledWith('/api/users/me');
  });

  it('stays logged out when /me fails', async () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('sets the user on login', async () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'));
    mockPost.mockResolvedValue({ user });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.login('ada@example.com', 'secret'));
    expect(mockPost).toHaveBeenCalledWith('/api/users/login', { email: 'ada@example.com', password: 'secret' });
    expect(result.current.user).toEqual(user);
  });

  it('sets the user on register', async () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'));
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
