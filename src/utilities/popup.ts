import type { CSSProperties } from 'react';

const POPUP_GAP = 4;
const VIEWPORT_PADDING = 8;

// Capped at the chosen side's room (--popup-space), so a menu scrolls only when the viewport cannot hold it; --popup-above tells its reveal which way to open.
export const popupPosition = (rect: DOMRect, height: number): CSSProperties => {
  const below = window.innerHeight - VIEWPORT_PADDING - rect.bottom - POPUP_GAP;
  const above = rect.top - POPUP_GAP - VIEWPORT_PADDING;
  const opensBelow = height <= below || below >= above;
  return {
    ...(opensBelow ? { top: rect.bottom + POPUP_GAP } : { bottom: Math.max(VIEWPORT_PADDING, window.innerHeight - rect.top + POPUP_GAP) }),
    ...(rect.left + rect.width / 2 > window.innerWidth / 2
      ? { right: Math.max(VIEWPORT_PADDING, window.innerWidth - rect.right) }
      : { left: Math.max(VIEWPORT_PADDING, rect.left) }),
    '--popup-space': `${Math.max(0, opensBelow ? below : above)}px`,
    '--popup-above': opensBelow ? 0 : 1,
  };
};
