import { act } from '@testing-library/react';
import { onTestFinished } from 'vitest';

// jsdom runs no transitions, so whatever waits for one moves on at once. This holds every element's transitions running until `finish`.
export const holdTransitions = () => {
  let finish = () => {};
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  class CSSTransition {
    finished = finished;
  }
  Object.assign(globalThis, { CSSTransition });
  Object.defineProperty(Element.prototype, 'getAnimations', { configurable: true, value: () => [new CSSTransition()] });
  onTestFinished(() => {
    Reflect.deleteProperty(Element.prototype, 'getAnimations');
    Reflect.deleteProperty(globalThis, 'CSSTransition');
  });
  return {
    finish: () =>
      act(async () => {
        finish();
        await finished;
      }),
  };
};
