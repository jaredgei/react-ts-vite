/// <reference types="@testing-library/jest-dom" />
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import { FakeResizeObserver } from '@/tests/resizeObserver';

import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

globalThis.ResizeObserver = FakeResizeObserver;

class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

Object.assign(globalThis, { IntersectionObserver: IntersectionObserverStub });

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    if (!this.open) return;
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

Element.prototype.scrollIntoView = () => {};

globalThis.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});
