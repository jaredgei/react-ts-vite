import styles from '@/styles/Suggestions.module.css';

import { type KeyboardEvent, type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { useElementRect } from '@/hooks/useElementRect';

import { cx } from '@/utilities/classes';
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

const focusItem = (menu: HTMLElement | null, pick: (items: HTMLElement[], index: number) => HTMLElement | undefined) => {
  const items = Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? []);
  pick(
    items,
    items.findIndex((item) => item === document.activeElement),
  )?.focus();
};

const navigation = new Map<string, (items: HTMLElement[], index: number) => HTMLElement | undefined>([
  ['ArrowDown', (items, index) => items[(index + 1) % items.length]],
  ['ArrowUp', (items, index) => items.at(index <= 0 ? -1 : index - 1)],
  ['Home', (items) => items[0]],
  ['End', (items) => items.at(-1)],
]);

const Suggestions = ({ id, anchor, isOpen = false, onClose, content, options = [], className }: Props) => {
  const [activeChildren, setActiveChildren] = useState<Option[] | null>(null);
  const popup = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const rect = useElementRect(anchor, Boolean(anchor && isOpen));

  useEffect(() => {
    if (!anchor) return;
    popup.current?.togglePopover(isOpen);
    if (isOpen) focusItem(menu.current, (items) => items[0]);
  }, [isOpen, anchor]);

  const showLevel = (children: Option[] | null) => {
    flushSync(() => setActiveChildren(children));
    focusItem(menu.current, (items) => items[0]);
  };

  const selectOption = (option: Option) => {
    if (option.children) return showLevel(option.children);
    onClose?.();
    option.onSelect?.();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const move = navigation.get(event.key);
    if (!move) return;
    event.preventDefault();
    focusItem(menu.current, move);
  };

  const list = (
    <div className={cx(styles.suggestions, !anchor && styles.inline, className)} style={{ maxHeight: POPUP_MAX_HEIGHT }}>
      {content}
      <div ref={menu} id={id} role='menu' tabIndex={-1} onKeyDown={handleKeyDown}>
        {activeChildren && (
          <button type='button' role='menuitem' className={cx(styles.suggestion, styles.back)} onClick={() => showLevel(null)}>
            <span className={styles.suggestionIcon}>{forward}</span>
            <span className={styles.suggestionText}>Back</span>
          </button>
        )}
        {(activeChildren ?? options).map((option, index) => {
          if (!option.name) return <div key={`divider-${index}`} role='separator' className={styles.divider} />;
          const icon = option.icon ?? (option.children && forward);
          return (
            <button
              type='button'
              role='menuitem'
              disabled={option.disabled}
              className={cx(styles.suggestion, option.disabled && styles.disabled)}
              key={option.name + index}
              onClick={() => selectOption(option)}>
              <span className={styles.suggestionText}>{option.name}</span>
              {icon && <span className={styles.suggestionIcon}>{icon}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!anchor) return list;

  return (
    <div
      ref={popup}
      popover='auto'
      className={styles.popup}
      onBeforeToggle={(event) => {
        if (event.newState === 'closed' && popup.current?.contains(document.activeElement)) anchor.current?.focus();
      }}
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
