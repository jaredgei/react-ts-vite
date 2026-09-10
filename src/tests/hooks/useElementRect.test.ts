import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createRef } from 'react';

import { useElementRect } from 'hooks/useElementRect';

describe('useElementRect', () => {
  it('returns null when the ref is unattached', () => {
    const ref = createRef<HTMLDivElement>();
    const { result } = renderHook(() => useElementRect(ref));
    expect(result.current).toBeNull();
  });

  it('reads the element rect once the ref is attached', () => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => ({ x: 1, y: 2, width: 3, height: 4, top: 2, left: 1, right: 4, bottom: 6, toJSON: () => ({}) });
    const ref = { current: element };
    const { result } = renderHook(() => useElementRect(ref));
    expect(result.current?.width).toBe(3);
    expect(result.current?.x).toBe(1);
  });

  it('returns null when disabled', () => {
    const element = document.createElement('div');
    const ref = { current: element };
    const { result } = renderHook(() => useElementRect(ref, false));
    expect(result.current).toBeNull();
  });
});
