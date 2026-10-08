import styles from '@/styles/VerticalMenu.module.css';

import { useId, useRef, useState } from 'react';

import Suggestions, { type Option } from '@/components/Suggestions';

import { menu } from '@/utilities/icons';

type Props = {
  options: Option[];
  className?: string;
};

const VerticalMenu = ({ options, className }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  return (
    <>
      <button
        ref={trigger}
        type='button'
        aria-label='Options'
        aria-haspopup='menu'
        aria-expanded={isExpanded}
        aria-controls={menuId}
        className={`${styles.verticalMenu} ${isExpanded ? styles.expanded : ''} ${className ?? ''}`.trim()}
        onClick={() => setIsExpanded((prev) => !prev)}>
        {menu}
      </button>
      <Suggestions id={menuId} anchor={trigger} isOpen={isExpanded} onClose={() => setIsExpanded(false)} options={options} />
    </>
  );
};

export default VerticalMenu;
