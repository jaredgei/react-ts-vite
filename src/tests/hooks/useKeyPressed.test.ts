import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useKeyPressed } from 'hooks/useKeyPressed';

describe('useKeyPressed', () => {
  it('triggers callback when target key is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPressed('Escape', callback));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(callback).toHaveBeenCalledOnce();
  });

  it('does not trigger when a different key is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyPressed('Escape', callback));

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKeyPressed('Escape', callback));

    unmount();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
