import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AuthProvider from '@/context/AuthProvider';
import ErrorProvider from '@/context/ErrorProvider';

import Header from '@/components/Header';

import { ApiError, get, post } from '@/utilities/api';

vi.mock('@/utilities/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utilities/api')>()),
  get: vi.fn(),
  post: vi.fn(),
}));

const mockGet = vi.mocked(get);
const mockPost = vi.mocked(post);
const user = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '', updatedAt: '' };

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

  it('hides the logout button when logged out', async () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    render(<Header />, { wrapper });
    await screen.findByRole('link', { name: 'Logo' });
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
  });

  it('logs out when the logout button is clicked', async () => {
    mockGet.mockResolvedValue({ user });
    mockPost.mockResolvedValue({ success: true });
    render(<Header />, { wrapper });

    await userEvent.click(await screen.findByRole('button', { name: 'Logout' }));

    expect(mockPost).toHaveBeenCalledWith('/api/users/logout');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument());
  });
});
