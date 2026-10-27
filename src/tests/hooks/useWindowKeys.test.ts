import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useWindowKeys } from '@/hooks/useWindowKeys';

const press = (key: string, target: EventTarget = window) =>
  act(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  });

const mount = (html: string) => {
  document.body.innerHTML = html;
  return document.body.firstElementChild ?? document.body;
};

describe('useWindowKeys', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('hears keys pressed anywhere on the page', () => {
    const onKey = vi.fn();
    renderHook(() => useWindowKeys('keydown', onKey));

    press('Escape');

    expect(onKey).toHaveBeenCalledOnce();
  });

  it('leaves typing keys to a text field, but not Escape', () => {
    const onKey = vi.fn();
    renderHook(() => useWindowKeys('keydown', onKey));
    const input = mount('<input type="text" />');

    press(' ', input);
    press('Escape', input);

    expect(onKey).toHaveBeenCalledOnce();
    expect(onKey.mock.calls[0]?.[0]).toMatchObject({ key: 'Escape' });
  });

  it('leaves every key to an open menu', () => {
    const onKey = vi.fn();
    renderHook(() => useWindowKeys('keydown', onKey));
    const menu = mount('<div popover="auto"><button>Rename</button></div>');

    press('Escape', menu.querySelector('button') ?? menu);

    expect(onKey).not.toHaveBeenCalled();
  });

  it('leaves every key to an open dialog', () => {
    const onKey = vi.fn();
    renderHook(() => useWindowKeys('keydown', onKey));
    mount('<dialog open></dialog>');

    press('Escape');

    expect(onKey).not.toHaveBeenCalled();
  });

  it('leaves a key that something else already handled', () => {
    const onKey = vi.fn();
    renderHook(() => useWindowKeys('keydown', onKey));
    const input = mount('<input type="text" />');
    input.addEventListener('keydown', (event) => event.preventDefault());

    press('Escape', input);

    expect(onKey).not.toHaveBeenCalled();
  });

  it('stops hearing keys once unmounted', () => {
    const onKey = vi.fn();
    const { unmount } = renderHook(() => useWindowKeys('keydown', onKey));

    unmount();
    press('Escape');

    expect(onKey).not.toHaveBeenCalled();
  });
});
