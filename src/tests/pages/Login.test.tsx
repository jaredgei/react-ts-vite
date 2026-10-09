import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AuthProvider from '@/context/AuthProvider';
import { useError } from '@/context/Error';
import ErrorProvider from '@/context/ErrorProvider';

import Login from '@/pages/Login';

import { ApiError, get, post } from '@/utilities/api';

vi.mock('@/utilities/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utilities/api')>()),
  get: vi.fn(),
  post: vi.fn(),
}));

const mockGet = vi.mocked(get);
const mockPost = vi.mocked(post);

const ErrorReader = () => <div data-testid='error'>{useError().message}</div>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <ErrorProvider>
    <AuthProvider>
      <ErrorReader />
      {children}
    </AuthProvider>
  </ErrorProvider>
);

afterEach(() => {
  vi.clearAllMocks();
});

describe('Login page', () => {
  it('labels its fields for password managers', () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    render(<Login />, { wrapper });
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('surfaces a failed login through the error channel', async () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    mockPost.mockRejectedValue(new ApiError(401, 'Invalid email or password'));
    render(<Login />, { wrapper });

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(mockPost).toHaveBeenCalledWith('/api/users/login', { email: 'ada@example.com', password: 'wrong' });
    expect(await screen.findByTestId('error')).toHaveTextContent('Invalid email or password');
  });
});
