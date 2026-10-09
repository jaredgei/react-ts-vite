import { createMemoryRouter, RouterProvider } from 'react-router';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RouteError from '@/components/RouteError';

const renderAtErroringRoute = (thrown: unknown) => {
  const router = createMemoryRouter([
    {
      path: '/',
      loader: () => {
        throw thrown;
      },
      element: <div>never shown</div>,
      errorElement: <RouteError />,
    },
  ]);
  return render(<RouterProvider router={router} />);
};

describe('RouteError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('shows a thrown Error message', async () => {
    renderAtErroringRoute(new Error('loader failed'));
    expect(await screen.findByText('loader failed')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('hides a thrown Error message in production', async () => {
    vi.stubEnv('DEV', false);
    renderAtErroringRoute(new Error('loader failed'));
    expect(await screen.findByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    expect(screen.queryByText('loader failed')).not.toBeInTheDocument();
  });

  it('shows status and text for a route error response', async () => {
    renderAtErroringRoute(new Response('', { status: 404, statusText: 'Not Found' }));
    expect(await screen.findByText('404 Not Found')).toBeInTheDocument();
  });

  it('renders a Go Home link', async () => {
    renderAtErroringRoute(new Error('x'));
    expect(await screen.findByRole('link', { name: 'Go Home' })).toHaveAttribute('href', '/');
  });
});
