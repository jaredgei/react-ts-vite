import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from 'context/Auth';
import { ErrorProvider, useError } from 'context/Error';

import Login from 'pages/Login';

import { get, post } from 'utilities/api';

vi.mock('utilities/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

const mockGet = vi.mocked(get);
const mockPost = vi.mocked(post);
const user = { id: '1', name: 'Ada', email: 'ada@example.com', createdAt: '', updatedAt: '' };

const ErrorReader = () => {
  const { error } = useError();
  return <div>{error?.message ?? 'no error'}</div>;
};

const renderLogin = () => {
  mockGet.mockRejectedValue(new Error('Unauthorized'));
  return render(
    <ErrorProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <ErrorReader />
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/' element={<div>home page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ErrorProvider>,
  );
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('Login page', () => {
  it('submits credentials and navigates home on success', async () => {
    mockPost.mockResolvedValue({ user });
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(mockPost).toHaveBeenCalledWith('/api/users/login', { email: 'ada@example.com', password: 'secret' });
    expect(await screen.findByText('home page')).toBeInTheDocument();
  });

  it('surfaces a failed login through the error channel', async () => {
    mockPost.mockRejectedValue(new Error('Invalid email or password'));
    renderLogin();

    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
