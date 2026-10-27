import { createMemoryRouter, RouterProvider } from 'react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/utilities/api';

import Providers from '@/Providers';
import { routes } from '@/routes';

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

const loggedOut = () => mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
const unverifiedUser = { ...user, emailVerifiedAt: null };

const signedInAs = (account: typeof user | typeof unverifiedUser) => mockGet.mockResolvedValue({ user: account });
const loggedIn = () => signedInAs(user);

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
    expect(mockPost).toHaveBeenCalledWith('/api/users/register', {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password123',
      turnstileToken: '',
    });
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

describe('Email verification', () => {
  it('asks unverified users to verify and resends the link', async () => {
    signedInAs(unverifiedUser);
    mockPost.mockResolvedValue(undefined);
    await renderAt('/');
    expect(await screen.findByText(/Verify your email address/)).toHaveTextContent('ada@example.com');

    await userEvent.click(screen.getByRole('button', { name: 'Resend email' }));
    expect(mockPost).toHaveBeenCalledWith('/api/users/resend-verification');
    expect(await screen.findByText(/We sent a new link to/)).toHaveTextContent('ada@example.com');
    expect(screen.getByRole('button', { name: 'Resend email' })).toBeEnabled();
  });

  it('surfaces a failed resend', async () => {
    signedInAs(unverifiedUser);
    mockPost.mockRejectedValue(new ApiError(429, 'Too many attempts, please try again later'));
    await renderAt('/');
    await userEvent.click(await screen.findByRole('button', { name: 'Resend email' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many attempts, please try again later');
    expect(screen.getByRole('button', { name: 'Resend email' })).toBeEnabled();
  });

  it('does not nag verified users', async () => {
    loggedIn();
    await renderAt('/');
    await screen.findByRole('heading', { name: 'Dashboard' });
    expect(screen.queryByText(/Verify your email/)).not.toBeInTheDocument();
  });

  it('verifies from the emailed link', async () => {
    signedInAs(unverifiedUser);
    mockPost.mockResolvedValue({ user });
    await renderAt('/verify-email?token=abc');
    expect(await screen.findByRole('heading', { name: 'Email verified' })).toBeInTheDocument();
    expect(mockPost).toHaveBeenCalledWith('/api/users/verify-email', { token: 'abc' });
  });

  it('explains a rejected link without the resend banner', async () => {
    signedInAs(unverifiedUser);
    mockPost.mockRejectedValue(new ApiError(400, 'This link is invalid or has expired'));
    await renderAt('/verify-email?token=expired');
    expect(await screen.findByRole('heading', { name: 'Verification failed' })).toBeInTheDocument();
    expect(screen.getByText('This link is invalid or has expired')).toBeInTheDocument();
    expect(screen.queryByText(/Verify your email/)).not.toBeInTheDocument();
  });

  it('rejects a link without a token without calling the server', async () => {
    loggedOut();
    await renderAt('/verify-email');
    expect(await screen.findByRole('heading', { name: 'Verification failed' })).toBeInTheDocument();
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe('Password reset', () => {
  it('links from login to a reset request that confirms without revealing the account', async () => {
    loggedOut();
    mockPost.mockResolvedValue(undefined);
    await renderAt('/login');
    await userEvent.click(await screen.findByRole('link', { name: 'Forgot password?' }));
    await screen.findByRole('heading', { name: 'Forgot your password?' });

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(mockPost).toHaveBeenCalledWith('/api/users/forgot-password', { email: 'ada@example.com' });
    expect(await screen.findByText(/If an account exists for ada@example.com/)).toHaveAttribute('role', 'status');
  });

  it('sets a new password from the emailed link and signs in', async () => {
    loggedOut();
    mockPost.mockResolvedValue({ user });
    await renderAt('/reset-password?token=abc');
    await userEvent.type(await screen.findByLabelText('New password'), 'new-password-456');
    await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    expect(mockPost).toHaveBeenCalledWith('/api/users/reset-password', { token: 'abc', password: 'new-password-456' });
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('opens the emailed link even while signed in', async () => {
    loggedIn();
    await renderAt('/reset-password?token=abc');
    expect(await screen.findByRole('heading', { name: 'Choose a new password' })).toBeInTheDocument();
  });

  it('explains a rejected link and offers a new one', async () => {
    loggedOut();
    mockPost.mockRejectedValue(new ApiError(400, 'This link is invalid or has expired'));
    await renderAt('/reset-password?token=expired');
    await userEvent.type(await screen.findByLabelText('New password'), 'new-password-456');
    await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('This link is invalid or has expired');
    expect(screen.getByRole('link', { name: 'Request a new one' })).toHaveAttribute('href', '/forgot-password');
  });
});

describe('Admin', () => {
  it('opens the admin page for an admin', async () => {
    signedInAs({ ...user, role: 'admin' });
    await renderAt('/admin');
    expect(await screen.findByRole('heading', { name: 'Admin' })).toBeInTheDocument();
  });

  it('hides the admin page from everyone else', async () => {
    loggedIn();
    await renderAt('/admin');
    expect(await screen.findByText('Page not found')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Admin' })).not.toBeInTheDocument();
  });
});
