import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AuthProvider from '@/context/AuthProvider';
import { useError } from '@/context/Error';
import ErrorProvider from '@/context/ErrorProvider';

import Login from '@/pages/Login';

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

const ErrorReader = () => <div data-testid='error'>{useError().message}</div>;

const renderAt = (ui: ReactNode, path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ErrorProvider>
        <AuthProvider>
          <ErrorReader />
          {ui}
        </AuthProvider>
      </ErrorProvider>
    </MemoryRouter>,
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe('Login page', () => {
  it('labels its fields for password managers', () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    renderAt(<Login />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('surfaces a failed login through the error channel', async () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    mockPost.mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    renderAt(<Login />);

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(mockPost).toHaveBeenCalledWith('/api/users/login', { email: 'ada@example.com', password: 'wrong' });
    expect(await screen.findByTestId('error')).toHaveTextContent('Invalid email or password');
  });

  it('explains a failed provider sign-in it was sent back from', async () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    renderAt(<Login />, '/login?error=oauth_account_exists');
    expect(await screen.findByTestId('error')).toHaveTextContent('An account with this email already exists.');
  });

  it('offers a password reset and each sign-in provider', () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    renderAt(<Login />);
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/forgot-password');
    expect(screen.getByRole('link', { name: 'Continue with Google' })).toHaveAttribute('href', '/api/users/oauth/google');
  });
});
