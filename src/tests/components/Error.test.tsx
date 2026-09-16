import { ReactNode, useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ErrorProvider, useError } from 'context/Error';

import Error from 'components/Error';

const wrapper = ({ children }: { children: ReactNode }) => <ErrorProvider>{children}</ErrorProvider>;

describe('Error', () => {
  it('renders nothing visible when there is no error', () => {
    render(<Error />, { wrapper });
    expect(screen.queryByRole('button', { name: 'Close error' })).not.toBeInTheDocument();
  });

  it('shows the error message when present', () => {
    const Harness = () => {
      const { setError } = useError();
      useEffect(() => {
        setError(new window.Error('something failed'));
      }, [setError]);
      return <Error />;
    };
    render(<Harness />, { wrapper });
    expect(screen.getByText('something failed')).toBeInTheDocument();
  });

  it('clears the error when the close button is clicked', async () => {
    const Harness = () => {
      const { setError } = useError();
      return (
        <>
          <button onClick={() => setError(new window.Error('boom'))}>trigger</button>
          <Error />
        </>
      );
    };
    render(<Harness />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: 'trigger' }));
    expect(screen.getByText('boom')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close error' }));
    expect(screen.queryByText('boom')).not.toBeInTheDocument();
  });
});
