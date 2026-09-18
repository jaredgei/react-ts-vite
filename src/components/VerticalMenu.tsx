import styles from 'scss/VerticalMenu.module.scss';

import { useId, useRef, useState } from 'react';

import Suggestions, { Option } from 'components/Suggestions';

import { menu } from 'utilities/icons';

type Props = {
  options: Option[];
  className?: string;
};

const VerticalMenu = ({ options, className }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const listboxId = useId();

  return (
    <>
      <button
        ref={menuRef}
        type='button'
        aria-label='Options'
        aria-expanded={isExpanded}
        aria-haspopup='listbox'
        aria-controls={listboxId}
        className={`${styles.verticalMenu} ${isExpanded ? styles.expanded : ''} ${className ?? ''}`.trim()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsExpanded((prev) => !prev);
        }}>
        {menu}
      </button>
      <Suggestions id={listboxId} anchor={menuRef} isOpen={isExpanded} onClose={() => setIsExpanded(false)} options={options} />
    </>
  );
};

export default VerticalMenu;
