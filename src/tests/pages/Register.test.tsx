import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AuthProvider from '@/context/AuthProvider';
import { useError } from '@/context/Error';
import ErrorProvider from '@/context/ErrorProvider';

import Register from '@/pages/Register';

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

describe('Register page', () => {
  it('labels its fields and enforces the password minimum', () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    render(<Register />, { wrapper });
    expect(screen.getByLabelText('Name')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('Password')).toHaveAttribute('minlength', '8');
  });

  it('surfaces a failed registration through the error channel', async () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    mockPost.mockRejectedValue(new ApiError(409, 'Resource already exists'));
    render(<Register />, { wrapper });

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByTestId('error')).toHaveTextContent('Resource already exists');
  });
});
