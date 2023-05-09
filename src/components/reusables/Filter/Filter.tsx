import * as React from 'react';
import { useState, useEffect, type ReactNode } from 'react';
import { Button } from '@digdir/design-system-react';
import { SvgIcon } from '@altinn/altinn-design-system';
import cn from 'classnames';

import { ReactComponent as ChevronDown } from '@/assets/ChevronDown.svg';
import { arraysEqual } from '@/resources/utils';

import type { FilterOption } from './utils';
import { FilterContent } from './FilterContent';
import classes from './Filter.module.css';
import { Popover } from './Popover';

export interface FilterProps {
  options: FilterOption[];
  label: string;
  applyButtonLabel: string;
  resetButtonLabel: string;
  searchable?: boolean;
  icon?: ReactNode;
  value?: string[];
  onApply?: (value: string[]) => void;
  modalView?: boolean;
}

export const Filter = ({
  options,
  label,
  applyButtonLabel,
  resetButtonLabel,
  icon,
  value,
  searchable,
  modalView = false,
  onApply,
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(value ?? []);
  const [checkedFilters, setCheckedFilters] = useState<string[]>(value ?? []);
  const [hasChanges, setHasChanges] = useState(false);

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

  const filterButton = (
    <button
      id='filterButton'
      className={classes.filterButton}
      onClick={handleOpenOrClose}
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
        className={cn(classes.icon, { [classes.open]: isOpen })}
      />
    </button>
  );

  const modalHeader = () => {
    return (
      <div className={classes.modalHeader}>
        <h3>{label}</h3>
        <Button
          variant='quiet'
          onClick={handleOpenOrClose}
        >
          X
        </Button>
      </div>
    );
  };

  return (
    <Popover
      trigger={filterButton}
      isOpen={isOpen}
      setIsOpen={handleOpenOrClose}
      isModal={modalView}
    >
      <div
        aria-labelledby='filterButton'
        className={classes.popoverContent}
      >
        {modalView && modalHeader()}
        <div className={cn(classes.optionSection, { [classes.modal]: modalView })}>
          <FilterContent
            options={options}
            onValueChange={setCheckedFilters}
            value={checkedFilters}
            searchable={searchable}
            compact={!modalView}
          />
        </div>
        <div className={cn(classes.popoverActions, { [classes.modal]: modalView })}>
          <Button
            className={classes.resetButton}
            size={modalView ? 'medium' : 'small'}
            variant='quiet'
            fullWidth={false}
            aria-disabled={checkedFilters.length === 0}
            onClick={checkedFilters.length === 0 ? undefined : handleReset}
          >
            {resetButtonLabel}
          </Button>
          <Button
            size={modalView ? 'medium' : 'small'}
            onClick={hasChanges ? handleApply : undefined}
            aria-disabled={!hasChanges}
            fullWidth={modalView}
          >
            {applyButtonLabel}
          </Button>
        </div>
      </div>
    </Popover>
  );
};
