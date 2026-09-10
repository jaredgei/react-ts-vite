import { describe, it, expect } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';

import { createSafeContext } from 'utilities/context';

type Value = { count: number };

describe('createSafeContext', () => {
  it('returns a context and a hook that reads its value', () => {
    const [Context, useValue] = createSafeContext<Value>('Value');
    const wrapper = ({ children }: { children: ReactNode }) => <Context value={{ count: 7 }}>{children}</Context>;
    const { result } = renderHook(() => useValue(), { wrapper });
    expect(result.current.count).toBe(7);
  });

  it('throws a named error when used outside its provider', () => {
    const [, useValue] = createSafeContext<Value>('Value');
    const Consumer = () => {
      useValue();
      return null;
    };
    expect(() => render(<Consumer />)).toThrow('useValue must be used within an ValueProvider');
  });
});
