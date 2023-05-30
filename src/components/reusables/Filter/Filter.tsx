import * as React from 'react';
import { useState, useEffect, useId, type ReactNode } from 'react';
import { Button } from '@digdir/design-system-react';
import cn from 'classnames';
import { XMarkIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { arraysEqual } from '@/resources/utils';
import { usePrevious } from '@/resources/hooks';

import type { FilterOption } from './utils';
import { OptionDisplay } from './OptionDisplay';
import classes from './Filter.module.css';
import { Floatover } from './Floatover';
import { FilterButton } from './FilterButton';

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
  closeButtonAriaLabel?: string;
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
  closeButtonAriaLabel,
  onApply,
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(value ?? []);
  const [checkedFilters, setCheckedFilters] = useState<string[]>(value ?? []);
  const [hasChanges, setHasChanges] = useState(false);
  const filterButtonID = useId();
  const { t } = useTranslation('common');

  // Update selected values when there are external changes
  const prevValue = usePrevious(value);
  useEffect(() => {
    if (value !== undefined && !arraysEqual(value, prevValue)) {
      setActiveFilters(value);
    }
  }, [value]);

  useEffect(() => {
    setHasChanges(!arraysEqual(activeFilters, checkedFilters));
  }, [checkedFilters]);

  const handleApply = () => {
    onApply?.(checkedFilters);
    setActiveFilters([...checkedFilters]);
    setHasChanges(false);
  };

  const handleReset = () => {
    setCheckedFilters([]);
  };

  const handleOpenOrClose = () => {
    if (isOpen) {
      handleApply();
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const modalHeader = () => (
    <div className={classes.modalHeader}>
      <h3>{label}</h3>
      <Button
        variant='quiet'
        color='secondary'
        onClick={handleOpenOrClose}
        icon={<XMarkIcon />}
        aria-label={closeButtonAriaLabel ?? String(t('common.close')) + ' ' + label}
      />
    </div>
  );

  return (
    <Floatover
      aria-labelledby={filterButtonID}
      trigger={
        <FilterButton
          id={filterButtonID}
          onClick={handleOpenOrClose}
          iconLeft={icon}
          isOpen={isOpen}
          numActiveFilters={activeFilters.length}
        >
          {label}
        </FilterButton>
      }
      isOpen={isOpen}
      setIsOpen={handleOpenOrClose}
      isModal={modalView}
    >
      <div className={classes.popoverContent}>
        {modalView && modalHeader()}
        <div className={cn(classes.optionSection, { [classes.modal]: modalView })}>
          <OptionDisplay
            options={options}
            onValueChange={setCheckedFilters}
            value={checkedFilters}
            searchable={searchable}
            compact={!modalView}
          />
        </div>
        <div className={cn(classes.filterActions, { [classes.modal]: modalView })}>
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
            onClick={hasChanges ? handleOpenOrClose : undefined}
            aria-disabled={!hasChanges}
            fullWidth={modalView}
          >
            {applyButtonLabel}
          </Button>
        </div>
      </div>
    </Floatover>
  );
};
