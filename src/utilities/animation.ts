// Resolves once the element's transitions finish; other animations are skipped since a pending button's spinner never ends.
export const afterTransitions = async (element: Element) => {
  const animations = typeof element.getAnimations === 'function' ? element.getAnimations({ subtree: true }) : [];
  await Promise.allSettled(animations.filter((animation) => animation instanceof CSSTransition).map(({ finished }) => finished));
};
