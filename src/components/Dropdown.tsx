import styles from '@/styles/Dropdown.module.css';

import { type ReactNode, useId, useRef, useState } from 'react';

import Suggestions, { type Option } from '@/components/Suggestions';

import { caret } from '@/utilities/icons';

type Props = {
  title?: string;
  value?: string;
  content?: ReactNode;
  options?: Option[];
  isActive?: boolean;
  hasError?: boolean;
  className?: string;
};

const Dropdown = ({ title, value, content, options, isActive, hasError, className }: Props) => {
  const trigger = useRef<HTMLButtonElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const menuId = useId();

  return (
    <div className={`${styles.dropdown} ${className ?? ''}`.trim()}>
      <button
        ref={trigger}
        type='button'
        aria-haspopup='menu'
        aria-expanded={isExpanded}
        aria-controls={menuId}
        className={`${styles.trigger} ${isActive ? styles.active : ''} ${hasError ? styles.error : ''}`.trim()}
        onClick={() => setIsExpanded((prev) => !prev)}>
        <span className={styles.title}>{value || title}</span>
        {caret}
      </button>
      <Suggestions id={menuId} anchor={trigger} isOpen={isExpanded} onClose={() => setIsExpanded(false)} content={content} options={options} />
    </div>
  );
};

export default Dropdown;
