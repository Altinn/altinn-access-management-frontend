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
  /** The provided filter options, defined in values and labels */
  options: FilterOption[];
  /**  The label that will be displayed on the filter button */
  label: string;
  /** The label for the apply button inside the popover */
  applyButtonLabel: string;
  /** The label for the reset button inside the popover */
  resetButtonLabel: string;
  /** The label for the reset button inside the popover */
  searchable?: boolean;
  /** The icon element to display with the filter label */
  icon?: ReactNode;
  /** The active filter values. Can be used for setting active filters externally. */
  values?: string[];
  /** Callback function that will be called when filters are applied */
  onApply?: (value: string[]) => void;
  /**  When true, displays a full screen modal when selecting filters */
  fullScreenModal?: boolean;
  /** The ARIA label for the close button in modal view */
  closeButtonAriaLabel?: string;
}

/**
 * Filter Component
 *
 * This component renders a button and corresponding popover with functionality for option selection.
 *
 * @component
 * @example
 * <Filter
 *   options={filterOptions}
 *   label="Filter"
 *   applyButtonLabel="Apply"
 *   resetButtonLabel="Reset"
 *   icon={<FilterIcon />}
 *   values={selectedFilters}
 *   onApply={handleFilterApply}
 *   fullScreenModal={true}
 *   closeButtonAriaLabel="Close filter"
 * />
 *
 * @property {FilterOption[]} options - The provided filter options, defined in values and labels
 * @property {string} label - The label that will be displayed on the filter button
 * @property {string} applyButtonLabel - The label for the apply button inside the popover
 * @property {string} resetButtonLabel - The label for the reset button inside the popover
 * @property {React.ReactNode} [icon] - The icon element to display with the filter label
 * @property {string[]} [values] - The active filter values. Can be used for setting active filters externally.
 * @property {boolean} [searchable=false] - Indicates whether the options are searchable
 * @property {boolean} [fullScreenModal=false] - When true, displays a full screen modal when selecting filters
 * @property {string} [closeButtonAriaLabel] - The ARIA label for the close button in modal view
 * @property {function} [onApply] - Callback function that will be called when filters are applied
 * @returns {React.ReactNode} Rendered component
 */

export const Filter = ({
  options,
  label,
  applyButtonLabel,
  resetButtonLabel,
  icon,
  values,
  searchable,
  fullScreenModal = false,
  closeButtonAriaLabel,
  onApply,
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(values ?? []);
  const [checkedFilters, setCheckedFilters] = useState<string[]>(values ?? []);
  const [hasChanges, setHasChanges] = useState(false);
  const filterButtonID = useId();
  const { t } = useTranslation('common');

  // Update selected values when there are external changes
  const prevvalues = usePrevious(values);
  useEffect(() => {
    if (values !== undefined && !arraysEqual(values, prevvalues)) {
      setActiveFilters(values);
      setCheckedFilters(values);
    }
  }, [values]);

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
        icon={<XMarkIcon aria-label={String(t('common.close'))} />}
        aria-label={closeButtonAriaLabel ?? String(t('common.close')) + ' ' + label}
        size='medium'
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
      isModal={fullScreenModal}
    >
      <div className={classes.popoverContent}>
        {fullScreenModal && modalHeader()}
        <div className={cn(classes.optionSection, { [classes.modal]: fullScreenModal })}>
          <OptionDisplay
            options={options}
            onValueChange={setCheckedFilters}
            values={checkedFilters}
            searchable={searchable}
            compact={!fullScreenModal}
          />
        </div>
        <div className={cn(classes.filterActions, { [classes.modal]: fullScreenModal })}>
          <Button
            className={classes.resetButton}
            size={fullScreenModal ? 'medium' : 'small'}
            variant='quiet'
            fullWidth={false}
            aria-disabled={checkedFilters.length === 0}
            onClick={checkedFilters.length === 0 ? undefined : handleReset}
          >
            {resetButtonLabel}
          </Button>
          <Button
            size={fullScreenModal ? 'medium' : 'small'}
            onClick={hasChanges ? handleOpenOrClose : undefined}
            aria-disabled={!hasChanges}
            fullWidth={fullScreenModal}
          >
            {applyButtonLabel}
          </Button>
        </div>
      </div>
    </Floatover>
  );
};
