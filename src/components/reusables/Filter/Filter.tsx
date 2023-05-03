import * as React from 'react';
import { useState, useEffect, type ReactNode } from 'react';
import { Button } from '@digdir/design-system-react';
import { SvgIcon } from '@altinn/altinn-design-system';
import cn from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import {
  useFloating,
  offset,
  useClick,
  useDismiss,
  useInteractions,
  shift,
  autoUpdate,
} from '@floating-ui/react';

import { ReactComponent as ChevronDown } from '@/assets/ChevronDown.svg';
import { arraysEqual } from '@/resources/utils';

import type { FilterOption } from './utils';
import { FilterContent } from './FilterContent';
import classes from './Filter.module.css';

export interface FilterProps {
  options: FilterOption[];
  label: string;
  applyButtonLabel: string;
  resetButtonLabel: string;
  searchable?: boolean;
  icon?: ReactNode;
  value?: string[];
  onApply?: (value: string[]) => void;
}

export const Filter = ({
  options,
  label,
  applyButtonLabel,
  resetButtonLabel,
  icon,
  value,
  searchable,
  onApply,
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(value ?? []);
  const [checkedFilters, setCheckedFilters] = useState<string[]>(value ?? []);
  const [hasChanges, setHasChanges] = useState(false);
  const [popupId] = useState('filter-popup-' + String(uuidv4()));

  const popup = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(1), shift()],
  });

  const context = popup.context;

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

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
        ref={popup.refs.setReference}
        {...getReferenceProps()}
        className={classes.filterButton}
        onClick={handleOpenOrClose}
        aria-expanded={isOpen}
        aria-controls={popupId}
        aria-haspopup='dialog'
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
          id={popupId}
          ref={popup.refs.setFloating}
          className={classes.popup}
          style={{
            position: popup.strategy,
            top: popup.y ?? 0,
            left: popup.x ?? 0,
          }}
          role='dialog'
          {...getFloatingProps()}
        >
          <div className={classes.content}>
            <FilterContent
              options={options}
              onValueChange={setCheckedFilters}
              value={checkedFilters}
              searchable={searchable}
            />
          </div>
          <div className={classes.popupActions}>
            <Button
              size='small'
              variant='quiet'
              aria-disabled={checkedFilters.length === 0}
              onClick={checkedFilters.length === 0 ? undefined : handleReset}
            >
              {resetButtonLabel}
            </Button>
            <Button
              size='small'
              onClick={hasChanges ? handleApply : undefined}
              aria-disabled={!hasChanges}
            >
              {applyButtonLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
