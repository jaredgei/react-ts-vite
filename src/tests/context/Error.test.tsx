import type { ReactNode } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useError } from '@/context/Error';
import ErrorProvider from '@/context/ErrorProvider';

import { ApiError } from '@/utilities/api';

const wrapper = ({ children }: { children: ReactNode }) => <ErrorProvider>{children}</ErrorProvider>;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Error context', () => {
  it('always shows API error messages', () => {
    vi.stubEnv('DEV', false);
    const { result } = renderHook(() => useError(), { wrapper });
    act(() => result.current.showError(new ApiError(409, 'Resource already exists')));
    expect(result.current.message).toBe('Resource already exists');
  });

  it('hides unexpected error details in production', () => {
    vi.stubEnv('DEV', false);
    const { result } = renderHook(() => useError(), { wrapper });
    act(() => result.current.showError(new TypeError("Cannot read properties of undefined (reading 'id')")));
    expect(result.current.message).toBe('An unexpected error occurred. Please try again.');
  });

  it('starts with no error', () => {
    const { result } = renderHook(() => useError(), { wrapper });
    expect(result.current.message).toBeNull();
  });

  it('normalizes any thrown value through showError', () => {
    const { result } = renderHook(() => useError(), { wrapper });
    act(() => result.current.showError('boom'));
    expect(result.current.message).toBe('boom');
  });

  it('clears the error', () => {
    const { result } = renderHook(() => useError(), { wrapper });
    act(() => result.current.showError(new Error('boom')));
    act(() => result.current.clearError());
    expect(result.current.message).toBeNull();
  });

  it('shares state across consumers under the same provider', async () => {
    const Setter = () => {
      const { showError } = useError();
      return <button onClick={() => showError(new Error('shared'))}>set</button>;
    };
    const Reader = () => {
      const { message } = useError();
      return <div>{message ?? 'none'}</div>;
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
