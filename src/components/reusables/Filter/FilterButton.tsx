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
}

export const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ onClick, iconLeft, id, className, children, isOpen, ...restHTMLProps }, ref) => (
    <button
      {...restHTMLProps}
      ref={ref}
      id={id}
      className={cn(classes.filterButton, className)}
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
  ),
);

FilterButton.displayName = 'FilterButton';
