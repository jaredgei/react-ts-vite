import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AuthProvider from '@/context/AuthProvider';
import ErrorProvider from '@/context/ErrorProvider';

import Header from '@/components/Header';

import { ApiError } from '@/utilities/api';

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn<(path: string, options?: { signal?: AbortSignal }) => Promise<unknown>>(),
  mockPost: vi.fn<(path: string, body?: unknown, options?: { signal?: AbortSignal }) => Promise<unknown>>(),
}));

vi.mock('@/utilities/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utilities/api')>()),
  get: mockGet,
  post: mockPost,
}));
const user = {
  id: '1',
  name: 'Ada',
  email: 'ada@example.com',
  emailVerifiedAt: '2026-01-01T00:00:00.000Z',
  role: 'user',
  createdAt: '',
  updatedAt: '',
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <ErrorProvider>
    <AuthProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </AuthProvider>
  </ErrorProvider>
);

afterEach(() => {
  vi.clearAllMocks();
});

describe('Header', () => {
  it('renders a banner with a home link', async () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    render(<Header />, { wrapper });
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Logo' })).toHaveAttribute('href', '/');
  });

  it('offers sign-in once it knows the visitor is signed out', async () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    render(<Header />, { wrapper });
    expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('button', { name: 'Account' })).not.toBeInTheDocument();
  });

  it('logs out from the account menu', async () => {
    mockGet.mockResolvedValue({ user });
    mockPost.mockResolvedValue(null);
    render(<Header />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: 'Account' }));
    expect(screen.queryByRole('menuitem', { name: 'Admin' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Log out' }));

    expect(mockPost).toHaveBeenCalledWith('/api/users/logout');
    expect(await screen.findByRole('link', { name: 'Log in' })).toBeInTheDocument();
  });

  it('offers the admin page only to admins', async () => {
    mockGet.mockResolvedValue({ user: { ...user, role: 'admin' } });
    render(<Header />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: 'Account' }));
    expect(screen.getByRole('menuitem', { name: 'Admin' })).toBeInTheDocument();
  });
});
