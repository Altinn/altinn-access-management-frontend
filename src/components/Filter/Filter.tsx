import * as React from 'react';
import { useState, useEffect, useId, type ReactNode } from 'react';
import { Button, Spinner, Heading } from '@digdir/designsystemet-react';
import cn from 'classnames';
import { XMarkIcon } from '@navikt/aksel-icons';
import { useTranslation } from 'react-i18next';

import { arraysEqual, getButtonIconSize } from '@/resources/utils';
import { usePrevious } from '@/resources/hooks';

import type { FilterOption } from './utils';
import { OptionDisplay } from './OptionDisplay';
import classes from './Filter.module.css';
import { Floatover } from './Floatover';
import { FilterButton } from './FilterButton';

export interface FilterProps {
  /** The provided filter options, defined in values and labels */
  options: FilterOption[] | undefined;
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
  /** className used for external styling of the filter button*/
  className?: string;
  /** shows loading spinner */
  isLoading?: boolean;
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
 * @property {function} [isLoading] - Shows loading spinner
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
  className,
  fullScreenModal = false,
  closeButtonAriaLabel,
  onApply,
  isLoading,
}: FilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(values ?? []);
  const [checkedFilters, setCheckedFilters] = useState<string[]>(values ?? []);
  const [hasChanges, setHasChanges] = useState(false);
  const filterButtonID = useId();
  const { t } = useTranslation();

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
      <Heading
        size='xs'
        level={3}
      >
        {label}
      </Heading>
      <Button
        variant='tertiary'
        color='neutral'
        onClick={handleOpenOrClose}
        aria-label={closeButtonAriaLabel ?? String(t('common.close')) + ' ' + label}
        size='md'
        icon={true}
      >
        <XMarkIcon
          aria-label={String(t('common.close'))}
          fontSize={getButtonIconSize(false)}
        />
      </Button>
    </div>
  );

  return (
    <Floatover
      aria-labelledby={filterButtonID}
      trigger={
        <FilterButton
          className={className}
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
      <div className={cn(classes.content, fullScreenModal && classes.modal)}>
        {fullScreenModal && modalHeader()}
        {isLoading || options === undefined ? (
          <div className={classes.loadingContainer}>
            <Spinner
              title={t('common.loading')}
              // variant='primary'
              size='md'
            />
          </div>
        ) : (
          <>
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
                size={fullScreenModal ? 'md' : 'sm'}
                variant='tertiary'
                // fullWidth={false}
                aria-disabled={checkedFilters.length === 0}
                onClick={checkedFilters.length === 0 ? undefined : handleReset}
              >
                {resetButtonLabel}
              </Button>
              <Button
                size={fullScreenModal ? 'md' : 'sm'}
                onClick={hasChanges ? handleOpenOrClose : undefined}
                aria-disabled={!hasChanges}
              >
                {applyButtonLabel}
              </Button>
            </div>
          </>
        )}
      </div>
    </Floatover>
  );
};
