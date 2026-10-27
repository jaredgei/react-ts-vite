// jsdom lays nothing out, so an observer hears of a size only when a test sets one.
export class FakeResizeObserver implements ResizeObserver {
  static #observers = new Set<FakeResizeObserver>();
  #targets = new Set<Element>();

  constructor(private callback: ResizeObserverCallback) {
    FakeResizeObserver.#observers.add(this);
  }

  static resize(target: Element, width: number, height: number) {
    const box = [{ inlineSize: width, blockSize: height }];
    const entry = {
      target,
      contentRect: DOMRectReadOnly.fromRect({ width, height }),
      borderBoxSize: box,
      contentBoxSize: box,
      devicePixelContentBoxSize: box,
    };
    FakeResizeObserver.#observers.forEach((observer) => {
      if (observer.#targets.has(target)) observer.callback([entry], observer);
    });
  }

  observe(target: Element) {
    this.#targets.add(target);
  }

  unobserve(target: Element) {
    this.#targets.delete(target);
  }

  disconnect() {
    FakeResizeObserver.#observers.delete(this);
  }
}
