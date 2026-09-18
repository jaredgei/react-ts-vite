import styles from 'scss/Dropdown.module.scss';

import { ReactNode, useId, useRef, useState } from 'react';

import Suggestions, { Option } from 'components/Suggestions';

import { caret } from 'utilities/icons';

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
  const dropdown = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const listboxId = useId();

  return (
    <div ref={dropdown} className={`${styles.dropdown} ${className ?? ''}`.trim()}>
      <div
        role='combobox'
        aria-expanded={isExpanded}
        aria-haspopup='listbox'
        aria-controls={listboxId}
        tabIndex={0}
        className={`${styles.dropdownContainer} ${isActive ? styles.active : ''} ${hasError ? styles.error : ''}`.trim()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsExpanded((prev) => !prev);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}>
        <div className={styles.dropdownTitle}>
          <div className={styles.dropdownTitleValue}>{value || title}</div>
        </div>
        {caret}
      </div>
      <Suggestions id={listboxId} anchor={dropdown} isOpen={isExpanded} onClose={() => setIsExpanded(false)} content={content} options={options} />
    </div>
  );
};

export default Dropdown;
