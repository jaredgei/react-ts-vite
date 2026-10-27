import { MemoryRouter } from 'react-router';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AuthProvider from '@/context/AuthProvider';
import ErrorProvider from '@/context/ErrorProvider';

import UserSettings from '@/pages/UserSettings';

import ErrorToast from '@/components/ErrorToast';

import { ApiError } from '@/utilities/api';

const { mockGet, mockPost, mockPatch, mockDel } = vi.hoisted(() => ({
  mockGet: vi.fn<(path: string, options?: unknown) => Promise<unknown>>(),
  mockPost: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(),
  mockPatch: vi.fn<(path: string, body?: unknown) => Promise<unknown>>(),
  mockDel: vi.fn<(path: string) => Promise<unknown>>(),
}));

vi.mock('@/utilities/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utilities/api')>()),
  get: mockGet,
  post: mockPost,
  patch: mockPatch,
  del: mockDel,
}));

const user = { id: '1', name: 'Ada Lovelace', email: 'ada@example.com', emailVerifiedAt: null, role: 'user', createdAt: '', updatedAt: '' };

const renderPage = async () => {
  mockGet.mockResolvedValue({ user });
  render(
    <MemoryRouter>
      <ErrorProvider>
        <AuthProvider>
          <ErrorToast />
          <UserSettings />
        </AuthProvider>
      </ErrorProvider>
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { name: 'User Settings' });
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('UserSettings', () => {
  it('saves a new name', async () => {
    mockPatch.mockResolvedValue({ user: { ...user, name: 'Ada King' } });
    await renderPage();
    const name = screen.getByLabelText('Name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Ada King');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(mockPatch).toHaveBeenCalledWith('/api/users/me', { name: 'Ada King' });
    expect(await screen.findByRole('status')).toHaveTextContent('Saved');
  });

  it('shows the email without letting it be edited', async () => {
    await renderPage();
    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
  });

  it('emails a password reset link to the account address', async () => {
    mockPost.mockResolvedValue(undefined);
    await renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Email me a reset link' }));

    expect(mockPost).toHaveBeenCalledWith('/api/users/forgot-password', { email: 'ada@example.com' });
    expect(await screen.findByRole('status')).toHaveTextContent('Sent to ada@example.com');
  });

  it('deletes the account and signs out only once the email is typed to confirm', async () => {
    mockDel.mockResolvedValue(undefined);
    await renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete your account?' });
    const confirm = within(dialog).getByRole('textbox', { name: 'Email' });

    await userEvent.type(confirm, 'someone@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }));
    expect(confirm).toBeInvalid();
    expect(mockDel).not.toHaveBeenCalled();

    await userEvent.clear(confirm);
    await userEvent.type(confirm, 'ADA@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }));
    expect(mockDel).toHaveBeenCalledWith('/api/users/me');
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'User Settings' })).not.toBeInTheDocument());
  });

  it('signs out to sign in again when the sign-in is too old to delete the account', async () => {
    mockDel.mockRejectedValue(new ApiError(403, 'Sign in again to delete your account'));
    mockPost.mockResolvedValue(undefined);
    await renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    await userEvent.type(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Email' }), 'ada@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Sign in again to delete your account');
    expect(mockPost).toHaveBeenCalledWith('/api/users/logout');
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'User Settings' })).not.toBeInTheDocument());
  });

  it('explains why the account cannot be deleted yet', async () => {
    mockDel.mockRejectedValue(new ApiError(409, 'Wait for your export to finish'));
    await renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Delete account' }));
    await userEvent.type(within(screen.getByRole('dialog')).getByRole('textbox', { name: 'Email' }), 'ada@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Delete forever' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Wait for your export to finish');
  });
});
