import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from 'context/Auth';
import { ErrorProvider } from 'context/Error';

import Header from 'components/Header';

import { get, post } from 'utilities/api';

vi.mock('utilities/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

const mockGet = vi.mocked(get);
const mockPost = vi.mocked(post);
const user = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '', updatedAt: '' };

const renderHeader = () =>
  render(
    <ErrorProvider>
      <AuthProvider>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </AuthProvider>
    </ErrorProvider>,
  );

afterEach(() => {
  vi.clearAllMocks();
});

describe('Header', () => {
  it('renders a banner with a home link', () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'));
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Logo' })).toHaveAttribute('href', '/');
  });

  it('hides the logout button when logged out', async () => {
    mockGet.mockRejectedValue(new Error('Unauthorized'));
    renderHeader();
    await screen.findByRole('link', { name: 'Logo' });
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
  });

  it('logs out when the logout button is clicked', async () => {
    mockGet.mockResolvedValue({ user });
    mockPost.mockResolvedValue({ success: true });
    renderHeader();

    const logout = await screen.findByRole('button', { name: 'Logout' });
    await userEvent.click(logout);

    expect(mockPost).toHaveBeenCalledWith('/api/users/logout');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument());
  });
});
