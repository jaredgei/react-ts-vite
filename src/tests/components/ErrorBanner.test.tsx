import { type ReactNode, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { useError } from '@/context/Error';
import ErrorProvider from '@/context/ErrorProvider';

import ErrorBanner from '@/components/ErrorBanner';

const wrapper = ({ children }: { children: ReactNode }) => <ErrorProvider>{children}</ErrorProvider>;

const Trigger = ({ message }: { message: string }) => {
  const { showError } = useError();
  return (
    <button type='button' onClick={() => showError(message)}>
      trigger
    </button>
  );
};

describe('ErrorBanner', () => {
  it('renders nothing visible when there is no error', () => {
    render(<ErrorBanner />, { wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent('');
    expect(screen.queryByRole('button', { name: 'Dismiss error' })).not.toBeInTheDocument();
  });

  it('shows the error message when present', () => {
    const Harness = () => {
      const { showError } = useError();
      useEffect(() => showError(new Error('something failed')), [showError]);
      return <ErrorBanner />;
    };
    render(<Harness />, { wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent('something failed');
  });

  it('keeps every line of a multi-line message', async () => {
    render(
      <>
        <Trigger message={'First problem\nSecond problem'} />
        <ErrorBanner />
      </>,
      { wrapper },
    );
    await userEvent.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByText(/First problem\s+Second problem/)).toBeInTheDocument();
  });

  it('clears the error when dismissed', async () => {
    render(
      <>
        <Trigger message='boom' />
        <ErrorBanner />
      </>,
      { wrapper },
    );
    await userEvent.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByText('boom')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(screen.queryByText('boom')).not.toBeInTheDocument();
  });
});
