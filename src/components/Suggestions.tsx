import styles from 'scss/Suggestions.module.scss';

import { MouseEvent as ReactMouseEvent, ReactNode, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useElementRect } from 'hooks/useElementRect';
import { useKeyPressed } from 'hooks/useKeyPressed';

import { forward } from 'utilities/icons';

const POPUP_MAX_HEIGHT = 280;
const POPUP_GAP = 4;
const VIEWPORT_PADDING = 8;
const ANIMATION_MS = 200;

export type Option = {
  name?: string;
  onSelect?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  children?: Option[];
};

type Props = {
  id?: string;
  anchor?: RefObject<HTMLElement | null>;
  isOpen?: boolean;
  onClose?: () => void;
  content?: ReactNode;
  options?: Option[];
  className?: string;
};

const Suggestions = ({ id, anchor, isOpen = false, onClose, content, options = [], className }: Props) => {
  const [activeChildren, setActiveChildren] = useState<Option[] | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const rect = useElementRect(anchor, Boolean(anchor && isOpen));

  useEffect(() => {
    if (isOpen) return;
    const reset = setTimeout(() => setActiveChildren(null), ANIMATION_MS);
    return () => clearTimeout(reset);
  }, [isOpen]);

  useKeyPressed(
    'Escape',
    useCallback(() => {
      if (isOpen) onClose?.();
    }, [isOpen, onClose]),
  );

  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchor?.current?.contains(target) || popupRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchor]);

  const selectOption = (event: ReactMouseEvent, option: Option) => {
    event.preventDefault();
    event.stopPropagation();
    if (option.children) return setActiveChildren(option.children);
    onClose?.();
    option.onSelect?.();
  };

  const list = (
    <div className={`${styles.suggestions} ${className ?? ''}`.trim()}>
      {content}
      {(activeChildren ?? options).map((option, index) => {
        if (!option.name) return <div key={`divider-${index}`} className={styles.divider} />;
        const icon = option.icon ?? (option.children && forward);
        return (
          <button
            type='button'
            role='option'
            disabled={option.disabled}
            className={`${styles.suggestion} ${option.disabled ? styles.disabled : ''}`.trim()}
            key={option.name + index}
            onClick={(event) => selectOption(event, option)}>
            <span className={styles.suggestionText}>{option.name}</span>
            {icon && <span className={styles.suggestionIcon}>{icon}</span>}
          </button>
        );
      })}
    </div>
  );

  if (!anchor)
    return (
      <div id={id} role='listbox'>
        {list}
      </div>
    );

  return createPortal(
    <div
      id={id}
      ref={popupRef}
      role='listbox'
      className={`${styles.popup} ${isOpen ? styles.open : ''}`.trim()}
      style={
        rect
          ? {
              top: Math.max(VIEWPORT_PADDING, Math.min(rect.bottom + POPUP_GAP, window.innerHeight - VIEWPORT_PADDING - POPUP_MAX_HEIGHT)),
              ...(rect.left + rect.width / 2 > window.innerWidth / 2
                ? { right: Math.max(VIEWPORT_PADDING, window.innerWidth - rect.right) }
                : { left: Math.max(VIEWPORT_PADDING, rect.left) }),
            }
          : undefined
      }>
      {list}
    </div>,
    document.body,
  );
};

export default Suggestions;
