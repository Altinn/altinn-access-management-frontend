import * as React from 'react';
import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Button } from '@digdir/design-system-react';
import { SvgIcon } from '@altinn/altinn-design-system';
import cn from 'classnames';
import { v4 as uuidv4 } from 'uuid';

import { ReactComponent as ChevronDown } from '@/assets/ChevronDown.svg';
import { arraysEqual } from '@/resources/utils';

import type { FilterOption } from './utils';
import { FilterContent } from './FilterContent';
import classes from './Filter.module.css';

export interface FilterProps {
  options: FilterOption[];
  label: string;
  icon?: ReactNode;
  value?: string[];
  onApply?: (value: string[]) => void;
}

export const Filter = ({ options, label, icon, value, onApply }: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(value ?? []);
  const [checkedFilters, setCheckedFilters] = useState<string[]>(value ?? []);
  const [hasChanges, setHasChanges] = useState(false);
  const [dropdownId] = useState('filter-dropdown-' + uuidv4());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDropdownClick = dropdownRef.current?.contains(event.target);
      const isFilterButtonClick = filterButtonRef.current?.contains(event.target);
      if (!isDropdownClick && !isFilterButtonClick) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // desktop
    document.addEventListener('touchstart', handleClickOutside); // touch devices
    // document.addEventListener('focus', handleClickOutside); // tab navigation

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('focus', handleClickOutside);
    };
  }, [dropdownRef, filterButtonRef]);

  useEffect(() => {
    if (!arraysEqual(activeFilters, checkedFilters)) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  }, [checkedFilters]);

  const handleApply = () => {
    onApply?.(checkedFilters);
    setActiveFilters([...checkedFilters]);
    handleOpenOrClose();
    setHasChanges(false);
  };

  const handleReset = () => {
    setCheckedFilters([]);
  };

  const handleOpenOrClose = () => {
    if (isOpen) {
      console.log('setting false');
      setIsOpen(false);
    } else {
      console.log('setting true');
      setCheckedFilters([...activeFilters]); // reset to active choices
      setIsOpen(true);
    }
  };

  return (
    <div className={classes.filter}>
      <button
        ref={filterButtonRef}
        className={classes.filterButton}
        onClick={handleOpenOrClose}
        aria-expanded={isOpen}
        aria-controls={dropdownId}
      >
        {icon && (
          <SvgIcon
            svgIconComponent={icon}
            className={classes.icon}
          />
        )}
        {label}
        <SvgIcon
          svgIconComponent={<ChevronDown />}
          className={cn(classes.icon, { [classes['icon--open']]: isOpen })}
        />
      </button>
      {isOpen && (
        <div
          id={dropdownId}
          ref={dropdownRef}
          className={classes.dropdown}
        >
          <div className={classes.content}>
            <FilterContent
              options={options}
              onValueChange={setCheckedFilters}
              value={checkedFilters}
            />
          </div>
          <div className={classes.dropdownActions}>
            <Button
              size='small'
              variant='quiet'
              aria-disabled={checkedFilters.length === 0}
              onClick={checkedFilters.length === 0 ? undefined : handleReset}
            >
              Nullstill valg
            </Button>
            <Button
              size='small'
              onClick={hasChanges ? handleApply : undefined}
              aria-disabled={!hasChanges}
            >
              Bruk
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
