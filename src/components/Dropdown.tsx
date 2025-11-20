import 'scss/Dropdown.scss';
import React, { useCallback, useEffect, useState, useRef, ReactNode } from 'react';

import Suggestions from 'components/Suggestions';

import { caret, forward } from 'utilities/icons';

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
  const popup = useRef<HTMLDivElement>(null);

  const [workingOptions, setWorkingOptions] = useState<Option[]>(options || []);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [dropdownRect, setDropdownRect] = useState<DOMRect>(new DOMRect());

  useEffect(() => {
    // if props change update state
    // @eslint-disable-next-line react-hooks/exhaustive-deps
    setWorkingOptions(options || []);
  }, [options]);

  useEffect(() => {
    if (isExpanded) return;
    setTimeout(() => setWorkingOptions(options || []), 200); // once closing animation completes, reset options
  }, [isExpanded]);

  const updateDimensions = useCallback(() => {
    if (!dropdown.current) return;
    setDropdownRect(dropdown.current.getBoundingClientRect());
  }, [dropdown, popup]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!dropdown.current || (event.target instanceof Node && dropdown.current.contains(event.target)) || !isExpanded) return;
      setIsExpanded(false);
    },
    [dropdown, isExpanded, setIsExpanded],
  );

  useEffect(() => {
    updateDimensions();
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    updateDimensions();
    document.addEventListener('scroll', updateDimensions);
    return () => {
      document.removeEventListener('scroll', updateDimensions);
    };
  }, [updateDimensions]);

  const expand = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsExpanded(!isExpanded);
    },
    [isExpanded],
  );

  const onOptionSelect = useCallback((option: Option) => {
    if (option.children) return setWorkingOptions(option.children);
    setIsExpanded(false);
    if (option.onSelect) option.onSelect();
  }, []);

  const popupStyle: { width: number; top?: number; left?: number; right?: number; bottom?: number } = { width: 180 };
  if (anchorPosition.includes('left')) popupStyle.left = dropdownRect.x;
  if (anchorPosition.includes('right')) popupStyle.right = window.innerWidth - dropdownRect.x - dropdownRect.width;
  if (anchorPosition.includes('top')) popupStyle.top = dropdownRect.y + dropdownRect.height + 8;
  if (anchorPosition.includes('bottom')) popupStyle.bottom = window.innerHeight - dropdownRect.y - dropdownRect.height;

  return (
    <div ref={dropdown} className={'dropdown' + (isExpanded ? ' expanded' : '')}>
      {!customButton && (
        <div className={'dropdownContainer' + (isActive ? ' active' : '') + (hasError ? ' error' : '')} onClick={expand}>
          <div className='dropdownTitle'>
            {/* render all options hidden so width scales to max */}
            <div className={'hiddenTitleOption'}>{title}</div>
            {options?.map((option: Option) => (
              <div key={option.name} className={'hiddenTitleOption'}>
                {option.name}
              </div>
            ))}
            <div className='dropdownTitleValue'>{value || title}</div>
          </div>
          {caret}
        </div>
      )}
      {customButton && (
        <div className='dropdownContainerCustom' onClick={expand}>
          {customButton}
        </div>
      )}
      <div className='popup' style={popupStyle} ref={popup}>
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
