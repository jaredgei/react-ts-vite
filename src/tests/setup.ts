/// <reference types="@testing-library/jest-dom" />
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub;

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}

if (!HTMLElement.prototype.togglePopover) {
  HTMLElement.prototype.togglePopover = function (force?: boolean | { force?: boolean }) {
    const next = typeof force === 'object' ? force.force : force;
    const open = next ?? this.style.display === 'none';
    this.style.display = open ? 'block' : 'none';
    const event = new Event('toggle');
    Object.assign(event, { newState: open ? 'open' : 'closed', oldState: open ? 'closed' : 'open' });
    this.dispatchEvent(event);
    return open;
  };
}
