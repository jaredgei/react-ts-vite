import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AuthProvider from '@/context/AuthProvider';
import { useError } from '@/context/Error';
import ErrorProvider from '@/context/ErrorProvider';

import Register from '@/pages/Register';

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

describe('Register page', () => {
  it('labels its fields and enforces the password minimum', () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    renderAt(<Register />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('autocomplete', 'name');
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('Password')).toHaveAttribute('minlength', '8');
  });

  it('surfaces a failed registration through the error channel', async () => {
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    mockPost.mockRejectedValue(new ApiError(409, 'Resource already exists'));
    renderAt(<Register />);

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByTestId('error')).toHaveTextContent('Resource already exists');
  });

  it('renders a hidden verification challenge, reveals it for interaction, and replaces it after a failed attempt', async () => {
    const turnstile = { render: vi.fn<NonNullable<typeof window.turnstile>['render']>(() => 'widget-id'), remove: vi.fn() };
    window.turnstile = turnstile;
    mockGet.mockRejectedValue(new ApiError(401, 'Unauthorized'));
    mockPost.mockRejectedValue(new ApiError(409, 'An account with this email already exists'));
    renderAt(<Register />);
    document.querySelector('script[src*="challenges.cloudflare.com"]')?.dispatchEvent(new Event('load'));

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(1));
    expect(turnstile.render).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: '1x00000000000000000000AA', appearance: 'interaction-only', 'response-field-name': 'turnstileToken' }),
    );
    const [container, options] = turnstile.render.mock.calls[0] ?? [];
    expect(container).toHaveAttribute('hidden');
    const requireInteraction = options?.['before-interactive-callback'];
    act(() => {
      if (typeof requireInteraction === 'function') requireInteraction();
    });
    expect(container).not.toHaveAttribute('hidden');

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(2));
    expect(turnstile.remove).toHaveBeenCalledWith('widget-id');
    delete window.turnstile;
  });
});
