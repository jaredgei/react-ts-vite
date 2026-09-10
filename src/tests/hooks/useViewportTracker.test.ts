import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useViewportTracker } from 'hooks/useViewportTracker';

describe('useViewportTracker', () => {
  it('returns the current viewport dimensions', () => {
    const { result } = renderHook(() => useViewportTracker());
    expect(result.current.width).toBe(window.innerWidth);
    expect(result.current.height).toBe(window.innerHeight);
    expect(result.current.scrollY).toBe(Math.max(0, window.scrollY));
  });

  it('updates on scroll', () => {
    const { result } = renderHook(() => useViewportTracker());
    act(() => {
      window.scrollY = 250;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.scrollY).toBe(250);
  });

  it('updates on resize', () => {
    const { result } = renderHook(() => useViewportTracker());
    act(() => {
      window.innerWidth = 500;
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.width).toBe(500);
  });

  it('does not subscribe when disabled', () => {
    const { result } = renderHook(() => useViewportTracker(false));
    const before = result.current;
    act(() => {
      window.scrollY = 999;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(before);
  });
});
