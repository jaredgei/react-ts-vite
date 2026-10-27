import { type ReactNode, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { useError } from '@/context/Error';
import ErrorProvider from '@/context/ErrorProvider';

import ErrorToast from '@/components/ErrorToast';

const wrapper = ({ children }: { children: ReactNode }) => <ErrorProvider>{children}</ErrorProvider>;

const Trigger = ({ message }: { message: string }) => {
  const { showError } = useError();
  return (
    <button type='button' onClick={() => showError(message)}>
      trigger
    </button>
  );
};

describe('ErrorToast', () => {
  it('stays hidden when there is no error', () => {
    render(<ErrorToast />, { wrapper });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the error message when present', () => {
    const Harness = () => {
      const { showError } = useError();
      useEffect(() => showError(new Error('something failed')), [showError]);
      return <ErrorToast />;
    };
    render(<Harness />, { wrapper });
    expect(screen.getByRole('alert')).toHaveTextContent('something failed');
  });

  it('keeps every line of a multi-line message', async () => {
    render(
      <>
        <Trigger message={'First problem\nSecond problem'} />
        <ErrorToast />
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
        <ErrorToast />
      </>,
      { wrapper },
    );
    await userEvent.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByText('boom')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss error' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
