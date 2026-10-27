import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useViewportMoves, useViewportTracker } from '@/hooks/useViewportTracker';

describe('useViewportTracker', () => {
  it('returns the current viewport dimensions', () => {
    const { result } = renderHook(() => useViewportTracker());
    expect(result.current.width).toBe(window.innerWidth);
    expect(result.current.height).toBe(window.innerHeight);
  });

  it('updates on scroll', async () => {
    const { result } = renderHook(() => useViewportTracker());
    act(() => {
      window.scrollY = 250;
      window.dispatchEvent(new Event('scroll'));
    });
    await waitFor(() => expect(result.current.scrollY).toBe(250));
  });

  it('updates on resize', async () => {
    const { result } = renderHook(() => useViewportTracker());
    act(() => {
      window.innerWidth = 500;
      window.dispatchEvent(new Event('resize'));
    });
    await waitFor(() => expect(result.current.width).toBe(500));
  });

  it('keeps the same viewport when an element scrolls, while counting the move', async () => {
    const { result } = renderHook(() => ({ viewport: useViewportTracker(), moves: useViewportMoves() }));
    const { viewport, moves } = result.current;
    act(() => {
      document.body.dispatchEvent(new Event('scroll'));
    });
    await waitFor(() => expect(result.current.moves).toBeGreaterThan(moves));
    expect(result.current.viewport).toBe(viewport);
  });

  it('counts no moves when disabled', () => {
    const { result } = renderHook(() => useViewportMoves(false));
    const before = result.current;
    act(() => {
      window.scrollY = 999;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(before);
  });
});
