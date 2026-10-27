import styles from '@/styles/Menu.module.css';

import { type KeyboardEvent, type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from 'react';

import { useElementRect } from '@/hooks/useElementRect';
import { usePresence } from '@/hooks/usePresence';

import { check } from '@/utilities/icons';
import { popupPosition } from '@/utilities/popup';

// An option without a name is a divider; one with `checked` is a choice, marked when it is the current one.
export type Option = {
  name?: string;
  onSelect?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  checked?: boolean;
};

type Props = {
  id?: string;
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  options: Option[];
};

const focusItem = (menu: HTMLElement | null, pick: (items: HTMLElement[], index: number) => HTMLElement | undefined) => {
  const items = Array.from(menu?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not(:disabled)') ?? []);
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

const Menu = ({ id, anchor, open, onClose, options }: Props) => {
  const [height, setHeight] = useState(0);
  const { ref: popup, present } = usePresence<HTMLDivElement>(open);
  const panel = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const rect = useElementRect(anchor, open);

  useLayoutEffect(() => {
    popup.current?.togglePopover(open);
    if (open) focusItem(menu.current, (items) => items[0]);
  }, [popup, open]);

  // Measured once shown, since a closed popover lays out nothing; scrollHeight is the full height whatever the max-height.
  useLayoutEffect(() => {
    const element = panel.current;
    if (open && element) setHeight(element.scrollHeight + element.offsetHeight - element.clientHeight);
  }, [open, options]);

  if (!present) return null;

  // Icons lead, so every row keeps their column once any has one, a radio choice's unchecked rows included.
  const iconColumn = options.some((option) => option.icon !== undefined || option.checked !== undefined);

  const handleKeyDown = (event: KeyboardEvent) => {
    const move = navigation.get(event.key);
    if (!move) return;
    event.preventDefault();
    focusItem(menu.current, move);
  };

  return (
    <div
      ref={popup}
      popover='auto'
      // Closing, it fades out still shown, where a click could pick an option twice.
      inert={!open}
      className={styles.popup}
      onBeforeToggle={(event) => {
        if (event.newState === 'closed' && popup.current?.contains(document.activeElement)) anchor.current?.focus();
      }}
      onToggle={(event) => {
        if (event.newState === 'closed') onClose();
      }}
      style={rect ? popupPosition(rect, height) : undefined}>
      <div ref={panel} className={styles.panel}>
        <div ref={menu} id={id} role='menu' tabIndex={-1} onKeyDown={handleKeyDown}>
          {options.map(({ checked, ...option }, index) => {
            const icon = checked ? check : option.icon;
            return option.name ? (
              <button
                key={option.name + index}
                type='button'
                role={checked === undefined ? 'menuitem' : 'menuitemradio'}
                aria-checked={checked}
                disabled={option.disabled}
                className={styles.item}
                onClick={() => {
                  onClose();
                  option.onSelect?.();
                }}>
                {iconColumn && <span className={styles.itemIcon}>{icon}</span>}
                <span className={styles.itemText}>{option.name}</span>
              </button>
            ) : (
              <div key={`divider-${index}`} role='separator' className={styles.divider} />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Menu;
