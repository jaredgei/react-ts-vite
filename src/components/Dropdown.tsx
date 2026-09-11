import styles from 'scss/Dropdown.module.scss';
import React, { useCallback, useEffect, useState, useRef, ReactNode } from 'react';

import { useElementRect } from 'hooks/useElementRect';

import Suggestions from 'components/Suggestions';

import { caret, forward } from 'utilities/icons';

const ANIMATION_MS = 200;
const POPUP_WIDTH = 180;
const POPUP_GAP = 8;

type Option = {
  name?: string;
  onSelect?: () => void;
  uri?: string;
  children?: Option[];
};

type Props = {
  title?: string;
  value?: string;
  content?: ReactNode;
  options?: Option[];
  customButton?: ReactNode;
  anchorPosition?: string;
  isActive?: boolean;
  hasError?: boolean;
};

const Dropdown = ({ title, value, content, options, customButton, anchorPosition = 'top left', isActive, hasError }: Props) => {
  const dropdown = useRef<HTMLDivElement>(null);

  const [workingOptions, setWorkingOptions] = useState<Option[]>(options || []);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const dropdownRect = useElementRect(dropdown, isExpanded);

  const [prevOptions, setPrevOptions] = useState<Option[] | undefined>(options);
  if (options !== prevOptions) {
    setPrevOptions(options);
    setWorkingOptions(options || []);
  }

  useEffect(() => {
    if (isExpanded) return;
    const resetAfterCloseAnimation = setTimeout(() => setWorkingOptions(options || []), ANIMATION_MS);
    return () => clearTimeout(resetAfterCloseAnimation);
  }, [isExpanded, options]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!dropdown.current || (event.target instanceof Node && dropdown.current.contains(event.target)) || !isExpanded) return;
      setIsExpanded(false);
    },
    [isExpanded],
  );

  useEffect(() => {
    if (!isExpanded) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, handleClickOutside]);

  const expand = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsExpanded((prev) => !prev);
  }, []);

  const onOptionSelect = useCallback((option: Option) => {
    if (option.children) return setWorkingOptions(option.children);
    setIsExpanded(false);
    if (option.onSelect) option.onSelect();
  }, []);

  const popupStyle: { width: number; top?: number; left?: number; right?: number; bottom?: number } = { width: POPUP_WIDTH };
  if (dropdownRect) {
    if (anchorPosition.includes('left')) popupStyle.left = dropdownRect.x;
    if (anchorPosition.includes('right')) popupStyle.right = window.innerWidth - dropdownRect.x - dropdownRect.width;
    if (anchorPosition.includes('top')) popupStyle.top = dropdownRect.y + dropdownRect.height + POPUP_GAP;
    if (anchorPosition.includes('bottom')) popupStyle.bottom = window.innerHeight - dropdownRect.y - dropdownRect.height;
  }

  return (
    <div ref={dropdown} className={`${styles.dropdown} ${isExpanded ? styles.expanded : ''}`.trim()}>
      {!customButton && (
        <div className={`${styles.dropdownContainer} ${isActive ? styles.active : ''} ${hasError ? styles.error : ''}`.trim()} onClick={expand}>
          <div className={styles.dropdownTitle}>
            <div className={styles.dropdownTitleValue}>{value || title}</div>
          </div>
          {caret}
        </div>
      )}
      {customButton && (
        <div className={styles.dropdownContainerCustom} onClick={expand}>
          {customButton}
        </div>
      )}
      <div className={styles.popup} style={popupStyle}>
        <Suggestions
          content={content}
          suggestions={workingOptions.map((option) =>
            option.name
              ? {
                  name: option.name,
                  onSelect: () => onOptionSelect(option),
                  uri: option.uri,
                  icon: option.children ? forward : undefined,
                }
              : {},
          )}
        />
      </div>
    </div>
  );
};

export default Dropdown;
