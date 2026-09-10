import { describe, it, expect } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';

import { ErrorProvider, useError } from 'context/Error';

const wrapper = ({ children }: { children: ReactNode }) => <ErrorProvider>{children}</ErrorProvider>;

describe('Error context', () => {
  it('starts with no error', () => {
    const { result } = renderHook(() => useError(), { wrapper });
    expect(result.current.error).toBeNull();
  });

  it('updates the error via setError', () => {
    const { result } = renderHook(() => useError(), { wrapper });
    act(() => result.current.setError(new Error('boom')));
    expect(result.current.error?.message).toBe('boom');
  });

  it('shares state across consumers under the same provider', async () => {
    const Setter = () => {
      const { setError } = useError();
      return <button onClick={() => setError(new Error('shared'))}>set</button>;
    };
    const Reader = () => {
      const { error } = useError();
      return <div>{error?.message ?? 'none'}</div>;
    };
    render(
      <ErrorProvider>
        <Setter />
        <Reader />
      </ErrorProvider>,
    );
    expect(screen.getByText('none')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'set' }));
    expect(screen.getByText('shared')).toBeInTheDocument();
  });

  it('throws when used outside a provider', () => {
    const Consumer = () => {
      useError();
      return null;
    };
    expect(() => render(<Consumer />)).toThrow('useError must be used within an ErrorProvider');
  });
});
