import { createMemoryRouter, RouterProvider } from 'react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, get, post } from '@/utilities/api';

import Providers from '@/Providers';
import { routes } from '@/routes';

vi.mock('@/utilities/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utilities/api')>()),
  get: vi.fn(),
  post: vi.fn(),
}));

const mockGet = vi.mocked(get);
const mockPost = vi.mocked(post);
const user = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '', updatedAt: '' };

const loggedOut = () => mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
const loggedIn = () => mockGet.mockResolvedValue({ user });

const renderAt = async (path: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  await act(async () => {
    render(
      <Providers>
        <RouterProvider router={router} />
      </Providers>,
    );
  });
  return router;
};

const fillLogin = async (password = 'secret') => {
  await userEvent.type(await screen.findByLabelText('Email'), 'ada@example.com');
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Login' }));
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('App routing', () => {
  it('shows Home at / when logged out', async () => {
    loggedOut();
    await renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Home' })).toBeInTheDocument();
  });

  it('shows Dashboard at / when logged in', async () => {
    loggedIn();
    await renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('redirects away from /login to / when logged in', async () => {
    loggedIn();
    await renderAt('/login');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('renders a protected route when logged in', async () => {
    loggedIn();
    await renderAt('/settings');
    expect(await screen.findByRole('heading', { name: 'User Settings' })).toBeInTheDocument();
  });

  it('redirects a protected route to /login when logged out', async () => {
    loggedOut();
    await renderAt('/settings');
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument());
    expect(screen.queryByRole('heading', { name: 'User Settings' })).not.toBeInTheDocument();
  });

  it('shows an error when the session check fails for a reason other than auth', async () => {
    mockGet.mockRejectedValue(new ApiError(500, 'Server unavailable'));
    await renderAt('/');
    expect(await screen.findByRole('alert')).toHaveTextContent('Server unavailable');
  });

  it('logs in and navigates home', async () => {
    loggedOut();
    mockPost.mockResolvedValue({ user });
    await renderAt('/login');
    await fillLogin();
    expect(mockPost).toHaveBeenCalledWith('/api/users/login', { email: 'ada@example.com', password: 'secret' });
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('returns to the full original location after login', async () => {
    loggedOut();
    mockPost.mockResolvedValue({ user });
    const router = await renderAt('/settings?tab=billing#card');
    await fillLogin();
    expect(await screen.findByRole('heading', { name: 'User Settings' })).toBeInTheDocument();
    expect(router.state.location).toMatchObject({ pathname: '/settings', search: '?tab=billing', hash: '#card' });
  });

  it('ignores a non-local redirect target', async () => {
    loggedOut();
    mockPost.mockResolvedValue({ user });
    const router = createMemoryRouter(routes, { initialEntries: [{ pathname: '/login', state: { from: { pathname: '//evil.example' } } }] });
    await act(async () => {
      render(
        <Providers>
          <RouterProvider router={router} />
        </Providers>,
      );
    });
    await fillLogin();
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('keeps the email after a failed login and clears the error on the next attempt', async () => {
    loggedOut();
    mockPost.mockRejectedValueOnce(new ApiError(401, 'Invalid email or password'));
    await renderAt('/login');
    await fillLogin('wrong');
    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();

    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('');

    mockPost.mockResolvedValue({ user });
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
  });

  it('registers and navigates home', async () => {
    loggedOut();
    mockPost.mockResolvedValue({ user });
    await renderAt('/register');
    await userEvent.type(await screen.findByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));
    expect(mockPost).toHaveBeenCalledWith('/api/users/register', { name: 'Ada', email: 'ada@example.com', password: 'password123' });
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('clears an error when navigating to another page', async () => {
    loggedOut();
    mockPost.mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    const router = await renderAt('/login');
    await fillLogin('wrong');
    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    await act(() => router.navigate('/register'));
    expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
  });
});
