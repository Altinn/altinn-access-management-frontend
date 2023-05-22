import * as React from 'react';
import { forwardRef, type ReactNode } from 'react';
import { SvgIcon } from '@altinn/altinn-design-system';
import cn from 'classnames';
import { ChevronDownIcon } from '@navikt/aksel-icons';

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

export const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
  (
    { onClick, iconLeft, id, className, children, isOpen, numActiveFilters = 0, ...restHTMLProps },
    ref,
  ) => {
    const activeNotification = () => {
      return (
        numActiveFilters !== 0 && <div className={classes.activeBadge}>{numActiveFilters}</div>
      );
    };
    return (
      <div className={cn(classes.buttonContainer, className)}>
        {activeNotification()}
        <button
          {...restHTMLProps}
          ref={ref}
          id={id}
          className={classes.filterButton}
          onClick={onClick}
        >
          {iconLeft && (
            <SvgIcon
              svgIconComponent={iconLeft}
              className={classes.icon}
            />
          )}
          {children}
          <SvgIcon
            svgIconComponent={<ChevronDownIcon />}
            className={cn(classes.icon, classes.chevron, { [classes.open]: isOpen })}
          />
        </button>
      </div>
    );
  },
);

FilterButton.displayName = 'FilterButton';
