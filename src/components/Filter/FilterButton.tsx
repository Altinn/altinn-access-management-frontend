import * as React from 'react';
import { forwardRef, type ReactNode } from 'react';
import cn from 'classnames';
import { ChevronDownIcon } from '@navikt/aksel-icons';
import { Button } from '@digdir/designsystemet-react';

import classes from './FilterButton.module.css';

export interface FilterButtonProps {
  onClick?: () => void;
  iconLeft?: ReactNode;
  id?: string;
  className?: string;
  children?: ReactNode;
  isOpen?: boolean;
  numActiveFilters?: number;
}

/**
 * FilterButton component displays a filter button with an optional icon and active filter count.
 *
 * @component
 * @example
 * <FilterButton onClick={handleClick} iconLeft={<FilterIcon />} isOpen={true} numActiveFilters={3}>
 *   Filter
 * </FilterButton>
 *
 * @param {Function} onClick - The click event handler for the button.
 * @param {string} id - The ID attribute of the button.
 * @param {string} className - Additional CSS class(es) for the component.
 * @param {ReactNode} children - The content of the button.
 * @param {boolean} isOpen - Indicates whether the filter is open or closed and thus controls the orientation of the chevron icon.
 * @param {number} numActiveFilters - The count of active filters to be displayed as a notification badge.
 * @returns {JSX.Element} The rendered FilterButton component.
 */
export const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
  (
    { onClick, iconLeft, id, className, children, isOpen, numActiveFilters = 0, ...restHTMLProps },
    ref,
  ) => {
    const activeNotification = () => {
      return (
        numActiveFilters !== 0 && (
          <div
            className={classes.activeBadge}
            role='status'
          >
            {numActiveFilters}
          </div>
        )
      );
    };
    return (
      <div className={cn(classes.filterButtonContainer, className)}>
        <Button
          {...restHTMLProps}
          data-size='sm'
          ref={ref}
          id={id}
          className={classes.filterButton}
          onClick={onClick}
        >
          {iconLeft && <div className={classes.iconContainer}>{iconLeft}</div>}
          {children}
          <div className={classes.iconContainer}>
            <ChevronDownIcon
              className={cn(classes.chevron, { [classes.open]: isOpen })}
              aria-hidden
            />
          </div>
        </Button>
        {activeNotification()}
      </div>
    );
  },
);

FilterButton.displayName = 'FilterButton';
