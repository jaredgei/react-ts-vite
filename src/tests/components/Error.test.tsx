import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

import { ErrorProvider, useError } from 'context/Error';

import Error from 'components/Error';

const wrapper = ({ children }: { children: ReactNode }) => <ErrorProvider>{children}</ErrorProvider>;

describe('Error', () => {
  it('renders nothing visible when there is no error', () => {
    render(<Error error={null} />, { wrapper });
    expect(screen.queryByRole('button', { name: 'Close error' })).not.toBeInTheDocument();
  });

  it('shows the error message when present', () => {
    render(<Error error={new window.Error('something failed')} />, { wrapper });
    expect(screen.getByText('something failed')).toBeInTheDocument();
  });

  it('clears the error when the close button is clicked', async () => {
    const Harness = () => {
      const { error, setError } = useError();
      return (
        <>
          <button onClick={() => setError(new window.Error('boom'))}>trigger</button>
          <Error error={error} />
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
