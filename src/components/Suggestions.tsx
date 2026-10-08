import styles from '@/styles/Suggestions.module.css';

import { type MouseEvent, type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';

import { useElementRect } from '@/hooks/useElementRect';

import { forward } from '@/utilities/icons';

const POPUP_MAX_HEIGHT = 280;
const POPUP_GAP = 4;
const VIEWPORT_PADDING = 8;

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
  const popup = useRef<HTMLDivElement>(null);
  const rect = useElementRect(anchor, Boolean(anchor && isOpen));

  useEffect(() => {
    if (anchor) popup.current?.togglePopover(isOpen);
  }, [isOpen, anchor]);

  const selectOption = (event: MouseEvent, option: Option) => {
    event.preventDefault();
    if (option.children) return setActiveChildren(option.children);
    onClose?.();
    option.onSelect?.();
  };

  const list = (
    <div role='menu' className={`${styles.suggestions} ${anchor ? '' : styles.inline} ${className ?? ''}`.trim()}>
      {content}
      {(activeChildren ?? options).map((option, index) => {
        if (!option.name) return <div key={`divider-${index}`} role='separator' className={styles.divider} />;
        const icon = option.icon ?? (option.children && forward);
        return (
          <button
            type='button'
            role='menuitem'
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
      <div id={id} ref={popup}>
        {list}
      </div>
    );

  return (
    <div
      id={id}
      ref={popup}
      popover='auto'
      className={styles.popup}
      onToggle={(event) => {
        if (event.newState === 'closed') {
          setActiveChildren(null);
          onClose?.();
        }
      }}
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
    </div>
  );
};

export default Suggestions;
