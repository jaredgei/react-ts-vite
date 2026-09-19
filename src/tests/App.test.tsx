import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import { routes } from 'App';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from 'context/Auth';
import { ErrorProvider } from 'context/Error';

import { get } from 'utilities/api';

vi.mock('utilities/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

const mockGet = vi.mocked(get);
const user = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '', updatedAt: '' };

const renderAt = async (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  await act(async () => {
    render(
      <ErrorProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ErrorProvider>,
    );
  });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('App routing', () => {
  it('shows Home at / when logged out', async () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'));
    await renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('shows Dashboard at / when logged in', async () => {
    mockGet.mockResolvedValue({ user });
    await renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders the login form when logged out', async () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'));
    await renderAt('/login');
    expect(await screen.findByRole('heading', { name: 'Login' })).toBeInTheDocument();
  });

  it('redirects away from /login to / when logged in', async () => {
    mockGet.mockResolvedValue({ user });
    await renderAt('/login');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('renders a protected route when logged in', async () => {
    mockGet.mockResolvedValue({ user });
    await renderAt('/settings');
    expect(await screen.findByRole('heading', { name: 'User Settings' })).toBeInTheDocument();
  });

  it('redirects a protected route to / when logged out', async () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'));
    await renderAt('/settings');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: 'User Settings' })).not.toBeInTheDocument();
  });
});
