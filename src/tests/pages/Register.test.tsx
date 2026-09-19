import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from 'context/Auth';
import { ErrorProvider, useError } from 'context/Error';

import Register from 'pages/Register';

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

const renderRegister = () => {
  mockGet.mockRejectedValue(new Error('Unauthorized'));
  return render(
    <ErrorProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <ErrorReader />
          <Routes>
            <Route path='/register' element={<Register />} />
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

describe('Register page', () => {
  it('submits details and navigates home on success', async () => {
    mockPost.mockResolvedValue({ user });
    renderRegister();

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(mockPost).toHaveBeenCalledWith('/api/users/register', { name: 'Ada', email: 'ada@example.com', password: 'secret' });
    expect(await screen.findByText('home page')).toBeInTheDocument();
  });

  it('surfaces a failed registration through the error channel', async () => {
    mockPost.mockRejectedValue(new Error('Email is already registered'));
    renderRegister();

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByText('Email is already registered')).toBeInTheDocument();
  });
});
